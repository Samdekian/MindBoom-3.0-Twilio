-- Fix breakout_rooms unique constraint
-- This allows different sessions to have rooms with the same name (e.g., "Room 1")
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/aoumioacfvttagverbna/sql

-- Step 1: Drop the incorrect unique constraint on room_name alone
ALTER TABLE public.breakout_rooms DROP CONSTRAINT IF EXISTS breakout_rooms_room_name_key;

-- Step 2: Add composite unique constraint on (session_id, room_name)
ALTER TABLE public.breakout_rooms 
  DROP CONSTRAINT IF EXISTS breakout_rooms_session_room_unique;

ALTER TABLE public.breakout_rooms 
  ADD CONSTRAINT breakout_rooms_session_room_unique 
  UNIQUE (session_id, room_name);

-- Step 3: Clean up old inactive breakout rooms (optional, keeps DB clean)
DELETE FROM public.breakout_rooms 
WHERE created_at < NOW() - INTERVAL '24 hours'
  AND (is_active = false OR closed_at IS NOT NULL);

-- Verify the constraint was added
SELECT 
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'breakout_rooms'
  AND con.contype = 'u'; -- unique constraints

