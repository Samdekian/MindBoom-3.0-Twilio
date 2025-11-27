-- ============================================================================
-- FIX RLS INFINITE RECURSION
-- Run this in Supabase SQL Editor to fix the RLS policy issue
-- ============================================================================

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Users can view participants in their breakout room" ON public.breakout_room_participants;

-- Create a simpler, non-recursive policy
CREATE POLICY "Users can view participants in their breakout room"
  ON public.breakout_room_participants FOR SELECT
  USING (
    -- Users can see their own record
    user_id = auth.uid()
    OR
    -- Therapists can see all participants in their sessions
    EXISTS (
      SELECT 1 FROM public.breakout_rooms br
      JOIN public.instant_sessions ins ON br.session_id = ins.id
      WHERE br.id = breakout_room_participants.breakout_room_id
      AND ins.therapist_id = auth.uid()
    )
  );

-- Verify the fix
SELECT policyname, tablename 
FROM pg_policies 
WHERE tablename = 'breakout_room_participants';

