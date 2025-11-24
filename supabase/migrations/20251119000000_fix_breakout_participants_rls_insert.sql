-- Fix RLS policy for breakout_room_participants to allow therapist INSERTs
-- Problem: The policy only has USING clause, which doesn't apply to INSERT operations
-- Solution: Add WITH CHECK clause to allow therapists to insert new participant assignments

-- Drop the existing policy
DROP POLICY IF EXISTS "System can manage breakout room participants" ON public.breakout_room_participants;

-- Recreate with both USING and WITH CHECK clauses
CREATE POLICY "System can manage breakout room participants"
  ON public.breakout_room_participants
  FOR ALL
  USING (
    -- Allows SELECT, UPDATE, DELETE for therapists who own the session
    EXISTS (
      SELECT 1 FROM public.breakout_rooms br
      JOIN public.instant_sessions ins ON br.session_id = ins.id
      WHERE br.id = breakout_room_participants.breakout_room_id
      AND ins.therapist_id = auth.uid()
    )
  )
  WITH CHECK (
    -- Allows INSERT for therapists who own the session
    EXISTS (
      SELECT 1 FROM public.breakout_rooms br
      JOIN public.instant_sessions ins ON br.session_id = ins.id
      WHERE br.id = breakout_room_participants.breakout_room_id
      AND ins.therapist_id = auth.uid()
    )
  );

