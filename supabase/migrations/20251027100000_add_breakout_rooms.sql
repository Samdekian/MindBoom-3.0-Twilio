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

-- Backfill columns/constraints when table already exists
ALTER TABLE public.breakout_rooms
  ADD COLUMN IF NOT EXISTS session_id UUID,
  ADD COLUMN IF NOT EXISTS room_name TEXT,
  ADD COLUMN IF NOT EXISTS twilio_room_sid TEXT,
  ADD COLUMN IF NOT EXISTS max_participants INTEGER,
  ADD COLUMN IF NOT EXISTS current_participants INTEGER,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN,
  ADD COLUMN IF NOT EXISTS created_by UUID;

ALTER TABLE public.breakout_rooms
  ALTER COLUMN max_participants SET DEFAULT 5,
  ALTER COLUMN current_participants SET DEFAULT 0,
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN is_active SET DEFAULT true;

ALTER TABLE public.breakout_rooms
  ADD CONSTRAINT IF NOT EXISTS breakout_rooms_session_id_fkey
  FOREIGN KEY (session_id) REFERENCES public.instant_sessions(id) ON DELETE CASCADE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'breakout_rooms_max_participants_check'
  ) THEN
    ALTER TABLE public.breakout_rooms
      ADD CONSTRAINT breakout_rooms_max_participants_check
      CHECK (max_participants > 0 AND max_participants <= 50);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'breakout_rooms_current_participants_check'
  ) THEN
    ALTER TABLE public.breakout_rooms
      ADD CONSTRAINT breakout_rooms_current_participants_check
      CHECK (current_participants >= 0 AND current_participants <= max_participants);
  END IF;
END;
$$;

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
