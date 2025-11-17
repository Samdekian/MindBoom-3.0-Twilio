-- Migration: Backfill breakout room schema to align with Twilio rollout
-- Created: 2025-11-08
-- Description: Ensures breakout room tables have required columns, constraints, and indexes

-- ===========================================================================
-- BREAKOUT ROOMS
-- ===========================================================================
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

CREATE INDEX IF NOT EXISTS idx_breakout_rooms_session_id ON public.breakout_rooms(session_id);
CREATE INDEX IF NOT EXISTS idx_breakout_rooms_twilio_sid ON public.breakout_rooms(twilio_room_sid);
CREATE INDEX IF NOT EXISTS idx_breakout_rooms_active ON public.breakout_rooms(is_active) WHERE is_active = true;

-- ===========================================================================
-- BREAKOUT ROOM PARTICIPANTS
-- ===========================================================================
ALTER TABLE public.breakout_room_participants
  ADD COLUMN IF NOT EXISTS breakout_room_id UUID,
  ADD COLUMN IF NOT EXISTS participant_id UUID,
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS participant_name TEXT,
  ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS left_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN,
  ADD COLUMN IF NOT EXISTS connection_quality TEXT;

ALTER TABLE public.breakout_room_participants
  ALTER COLUMN joined_at SET DEFAULT now(),
  ALTER COLUMN is_active SET DEFAULT true,
  ALTER COLUMN connection_quality SET DEFAULT 'good';

ALTER TABLE public.breakout_room_participants
  ADD CONSTRAINT IF NOT EXISTS breakout_room_participants_breakout_room_id_fkey
  FOREIGN KEY (breakout_room_id) REFERENCES public.breakout_rooms(id) ON DELETE CASCADE,
  ADD CONSTRAINT IF NOT EXISTS breakout_room_participants_participant_id_fkey
  FOREIGN KEY (participant_id) REFERENCES public.instant_session_participants(id) ON DELETE CASCADE,
  ADD CONSTRAINT IF NOT EXISTS breakout_room_participants_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'breakout_room_participants_connection_quality_check'
  ) THEN
    ALTER TABLE public.breakout_room_participants
      ADD CONSTRAINT breakout_room_participants_connection_quality_check
      CHECK (connection_quality IN ('excellent', 'good', 'poor', 'disconnected'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'breakout_room_participants_breakout_room_id_participant_id_key'
  ) THEN
    ALTER TABLE public.breakout_room_participants
      ADD CONSTRAINT breakout_room_participants_breakout_room_id_participant_id_key
      UNIQUE (breakout_room_id, participant_id);
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_breakout_room_participants_room_id ON public.breakout_room_participants(breakout_room_id);
CREATE INDEX IF NOT EXISTS idx_breakout_room_participants_participant_id ON public.breakout_room_participants(participant_id);
CREATE INDEX IF NOT EXISTS idx_breakout_room_participants_user_id ON public.breakout_room_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_breakout_room_participants_active ON public.breakout_room_participants(is_active) WHERE is_active = true;

-- ===========================================================================
-- BREAKOUT ROOM TRANSITIONS
-- ===========================================================================
ALTER TABLE public.breakout_room_transitions
  ADD COLUMN IF NOT EXISTS participant_id UUID,
  ADD COLUMN IF NOT EXISTS from_room_id UUID,
  ADD COLUMN IF NOT EXISTS to_room_id UUID,
  ADD COLUMN IF NOT EXISTS moved_by UUID,
  ADD COLUMN IF NOT EXISTS moved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS transition_type TEXT,
  ADD COLUMN IF NOT EXISTS reason TEXT;

ALTER TABLE public.breakout_room_transitions
  ALTER COLUMN moved_at SET DEFAULT now(),
  ALTER COLUMN transition_type SET DEFAULT 'manual';

ALTER TABLE public.breakout_room_transitions
  ADD CONSTRAINT IF NOT EXISTS breakout_room_transitions_participant_id_fkey
  FOREIGN KEY (participant_id) REFERENCES public.instant_session_participants(id) ON DELETE CASCADE,
  ADD CONSTRAINT IF NOT EXISTS breakout_room_transitions_from_room_id_fkey
  FOREIGN KEY (from_room_id) REFERENCES public.breakout_rooms(id) ON DELETE SET NULL,
  ADD CONSTRAINT IF NOT EXISTS breakout_room_transitions_to_room_id_fkey
  FOREIGN KEY (to_room_id) REFERENCES public.breakout_rooms(id) ON DELETE SET NULL,
  ADD CONSTRAINT IF NOT EXISTS breakout_room_transitions_moved_by_fkey
  FOREIGN KEY (moved_by) REFERENCES auth.users(id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'breakout_room_transitions_room_check'
  ) THEN
    ALTER TABLE public.breakout_room_transitions
      ADD CONSTRAINT breakout_room_transitions_room_check
      CHECK (from_room_id IS DISTINCT FROM to_room_id);
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_breakout_room_transitions_participant_id ON public.breakout_room_transitions(participant_id);
CREATE INDEX IF NOT EXISTS idx_breakout_room_transitions_from_room ON public.breakout_room_transitions(from_room_id);
CREATE INDEX IF NOT EXISTS idx_breakout_room_transitions_to_room ON public.breakout_room_transitions(to_room_id);
CREATE INDEX IF NOT EXISTS idx_breakout_room_transitions_moved_at ON public.breakout_room_transitions(moved_at);
