-- Migration: Add Breakout Rooms Support for Twilio Video
-- Created: 2025-10-27
-- Description: Tables for managing breakout rooms in group therapy sessions

-- ===========================================================================
-- BREAKOUT ROOMS TABLE
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.breakout_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.instant_sessions(id) ON DELETE CASCADE,
  room_name TEXT NOT NULL,
  twilio_room_sid TEXT UNIQUE,
  max_participants INTEGER NOT NULL DEFAULT 5,
  current_participants INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  closed_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT breakout_rooms_max_participants_check CHECK (max_participants > 0 AND max_participants <= 50),
  CONSTRAINT breakout_rooms_current_participants_check CHECK (current_participants >= 0 AND current_participants <= max_participants)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_breakout_rooms_session_id ON public.breakout_rooms(session_id);
CREATE INDEX IF NOT EXISTS idx_breakout_rooms_twilio_sid ON public.breakout_rooms(twilio_room_sid);
CREATE INDEX IF NOT EXISTS idx_breakout_rooms_active ON public.breakout_rooms(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.breakout_rooms ENABLE ROW LEVEL SECURITY;

-- RLS Policies for breakout_rooms
CREATE POLICY "Users can view breakout rooms in their sessions"
  ON public.breakout_rooms
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.instant_session_participants isp
      WHERE isp.session_id = breakout_rooms.session_id
      AND isp.user_id = auth.uid()
      AND isp.is_active = true
    )
  );

CREATE POLICY "Therapists can manage breakout rooms in their sessions"
  ON public.breakout_rooms
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.instant_sessions ins
      JOIN user_roles ur ON ur.user_id = auth.uid()
      JOIN roles r ON ur.role_id = r.id
      WHERE ins.id = breakout_rooms.session_id
      AND ins.therapist_id = auth.uid()
      AND r.name IN ('therapist', 'admin')
    )
  );

-- ===========================================================================
-- BREAKOUT ROOM PARTICIPANTS TABLE
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.breakout_room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  breakout_room_id UUID NOT NULL REFERENCES public.breakout_rooms(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.instant_session_participants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  participant_name TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  left_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  connection_quality TEXT DEFAULT 'good' CHECK (connection_quality IN ('excellent', 'good', 'poor', 'disconnected')),
  
  UNIQUE(breakout_room_id, participant_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_breakout_room_participants_room_id ON public.breakout_room_participants(breakout_room_id);
CREATE INDEX IF NOT EXISTS idx_breakout_room_participants_participant_id ON public.breakout_room_participants(participant_id);
CREATE INDEX IF NOT EXISTS idx_breakout_room_participants_user_id ON public.breakout_room_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_breakout_room_participants_active ON public.breakout_room_participants(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.breakout_room_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for breakout_room_participants
CREATE POLICY "Users can view participants in their breakout room"
  ON public.breakout_room_participants
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.breakout_room_participants brp
      WHERE brp.breakout_room_id = breakout_room_participants.breakout_room_id
      AND brp.user_id = auth.uid()
      AND brp.is_active = true
    )
    OR
    EXISTS (
      SELECT 1 FROM public.breakout_rooms br
      JOIN public.instant_sessions ins ON br.session_id = ins.id
      WHERE br.id = breakout_room_participants.breakout_room_id
      AND ins.therapist_id = auth.uid()
    )
  );

CREATE POLICY "System can manage breakout room participants"
  ON public.breakout_room_participants
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.breakout_rooms br
      JOIN public.instant_sessions ins ON br.session_id = ins.id
      WHERE br.id = breakout_room_participants.breakout_room_id
      AND ins.therapist_id = auth.uid()
    )
  );

-- ===========================================================================
-- BREAKOUT ROOM TRANSITIONS TABLE
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.breakout_room_transitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES public.instant_session_participants(id) ON DELETE CASCADE,
  from_room_id UUID REFERENCES public.breakout_rooms(id) ON DELETE SET NULL,
  to_room_id UUID REFERENCES public.breakout_rooms(id) ON DELETE SET NULL,
  moved_by UUID REFERENCES auth.users(id),
  moved_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  transition_type TEXT NOT NULL DEFAULT 'manual' CHECK (transition_type IN ('manual', 'auto', 'self')),
  reason TEXT,
  
  CONSTRAINT breakout_room_transitions_room_check CHECK (from_room_id IS DISTINCT FROM to_room_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_breakout_room_transitions_participant_id ON public.breakout_room_transitions(participant_id);
CREATE INDEX IF NOT EXISTS idx_breakout_room_transitions_from_room ON public.breakout_room_transitions(from_room_id);
CREATE INDEX IF NOT EXISTS idx_breakout_room_transitions_to_room ON public.breakout_room_transitions(to_room_id);
CREATE INDEX IF NOT EXISTS idx_breakout_room_transitions_moved_at ON public.breakout_room_transitions(moved_at);

-- Enable RLS
ALTER TABLE public.breakout_room_transitions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for breakout_room_transitions
CREATE POLICY "Users can view their own transitions"
  ON public.breakout_room_transitions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.instant_session_participants isp
      WHERE isp.id = breakout_room_transitions.participant_id
      AND isp.user_id = auth.uid()
    )
  );

CREATE POLICY "Therapists can view all transitions in their sessions"
  ON public.breakout_room_transitions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.instant_session_participants isp
      JOIN public.instant_sessions ins ON isp.session_id = ins.id
      WHERE isp.id = breakout_room_transitions.participant_id
      AND ins.therapist_id = auth.uid()
    )
  );

CREATE POLICY "Therapists can create transitions"
  ON public.breakout_room_transitions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.instant_session_participants isp
      JOIN public.instant_sessions ins ON isp.session_id = ins.id
      WHERE isp.id = breakout_room_transitions.participant_id
      AND ins.therapist_id = auth.uid()
    )
  );

-- ===========================================================================
-- FUNCTIONS AND TRIGGERS
-- ===========================================================================

-- Function to update participant count when participants join/leave breakout rooms
CREATE OR REPLACE FUNCTION update_breakout_room_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.is_active = true THEN
    UPDATE public.breakout_rooms
    SET current_participants = current_participants + 1
    WHERE id = NEW.breakout_room_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.is_active = true AND NEW.is_active = false THEN
      UPDATE public.breakout_rooms
      SET current_participants = GREATEST(0, current_participants - 1)
      WHERE id = NEW.breakout_room_id;
    ELSIF OLD.is_active = false AND NEW.is_active = true THEN
      UPDATE public.breakout_rooms
      SET current_participants = current_participants + 1
      WHERE id = NEW.breakout_room_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.is_active = true THEN
    UPDATE public.breakout_rooms
    SET current_participants = GREATEST(0, current_participants - 1)
    WHERE id = OLD.breakout_room_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to maintain participant count
CREATE TRIGGER trigger_update_breakout_room_participant_count
AFTER INSERT OR UPDATE OR DELETE ON public.breakout_room_participants
FOR EACH ROW
EXECUTE FUNCTION update_breakout_room_participant_count();

-- Function to automatically close empty breakout rooms
CREATE OR REPLACE FUNCTION auto_close_empty_breakout_rooms()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.breakout_rooms
  SET is_active = false, closed_at = now()
  WHERE id = OLD.breakout_room_id
  AND current_participants = 0
  AND is_active = true
  AND created_at < now() - INTERVAL '5 minutes'; -- Only auto-close rooms older than 5 minutes
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-close empty rooms
CREATE TRIGGER trigger_auto_close_empty_breakout_rooms
AFTER UPDATE OF is_active ON public.breakout_room_participants
FOR EACH ROW
WHEN (OLD.is_active = true AND NEW.is_active = false)
EXECUTE FUNCTION auto_close_empty_breakout_rooms();

-- ===========================================================================
-- COMMENTS FOR DOCUMENTATION
-- ===========================================================================
COMMENT ON TABLE public.breakout_rooms IS 'Breakout rooms within therapy group sessions for Twilio Video';
COMMENT ON TABLE public.breakout_room_participants IS 'Participants assigned to specific breakout rooms';
COMMENT ON TABLE public.breakout_room_transitions IS 'History of participant movements between breakout rooms';
COMMENT ON COLUMN public.breakout_rooms.twilio_room_sid IS 'Twilio Video Room SID for the breakout room';
COMMENT ON COLUMN public.breakout_room_transitions.transition_type IS 'Type of movement: manual (by therapist), auto (random assignment), or self (participant choice)';

