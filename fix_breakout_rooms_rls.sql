-- Fix Breakout Rooms RLS Policy for Therapists
-- Run this in Supabase SQL Editor
-- This simplifies the therapist RLS policy to allow therapists to view rooms in their sessions
-- without requiring role check, since therapist_id in instant_sessions is sufficient

-- Drop the existing therapist policy
DROP POLICY IF EXISTS "Therapists can manage breakout rooms in their sessions" ON public.breakout_rooms;

-- Create a simpler therapist policy that only checks therapist_id
-- This allows therapists to view and manage rooms in their sessions
CREATE POLICY "Therapists can manage breakout rooms in their sessions"
  ON public.breakout_rooms
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.instant_sessions ins
      WHERE ins.id = breakout_rooms.session_id
      AND ins.therapist_id = auth.uid()
    )
  );

