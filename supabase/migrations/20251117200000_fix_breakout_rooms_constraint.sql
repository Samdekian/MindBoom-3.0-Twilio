-- Fix breakout_rooms unique constraint
-- Room names should only be unique within a session, not globally

-- Drop the incorrect unique constraint on room_name (if it exists)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'breakout_rooms_room_name_key'
  ) THEN
    ALTER TABLE public.breakout_rooms DROP CONSTRAINT breakout_rooms_room_name_key;
    RAISE NOTICE 'Dropped constraint: breakout_rooms_room_name_key';
  END IF;
END $$;

-- Add composite unique constraint on (session_id, room_name)
-- This allows different sessions to have rooms with the same name
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'breakout_rooms_session_room_unique'
  ) THEN
    ALTER TABLE public.breakout_rooms 
      ADD CONSTRAINT breakout_rooms_session_room_unique 
      UNIQUE (session_id, room_name);
    RAISE NOTICE 'Added constraint: breakout_rooms_session_room_unique';
  END IF;
END $$;

-- Optional: Clean up old inactive breakout rooms (older than 24 hours)
DELETE FROM public.breakout_rooms 
WHERE created_at < NOW() - INTERVAL '24 hours'
  AND (is_active = false OR closed_at IS NOT NULL);

