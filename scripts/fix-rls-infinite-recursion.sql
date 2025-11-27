-- ============================================================================
-- FIX RLS INFINITE RECURSION - CRITICAL
-- Copy and paste this entire file into Supabase SQL Editor and run
-- This fixes the "infinite recursion" error in breakout_room_participants
-- ============================================================================

-- Drop ALL policies for breakout_room_participants to start fresh
DROP POLICY IF EXISTS "Users can view participants in their breakout room" ON public.breakout_room_participants;
DROP POLICY IF EXISTS "System can manage breakout room participants" ON public.breakout_room_participants;

-- Create simple, non-recursive SELECT policy
CREATE POLICY "breakout_participants_select"
  ON public.breakout_room_participants FOR SELECT
  USING (
    -- Users can see their own records
    user_id = auth.uid()
    OR
    -- Therapists can see all participants in their sessions' breakout rooms
    EXISTS (
      SELECT 1 
      FROM public.breakout_rooms br
      INNER JOIN public.instant_sessions ins ON br.session_id = ins.id
      WHERE br.id = breakout_room_participants.breakout_room_id
      AND ins.therapist_id = auth.uid()
    )
  );

-- Create INSERT policy for therapists
CREATE POLICY "breakout_participants_insert"
  ON public.breakout_room_participants FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM public.breakout_rooms br
      INNER JOIN public.instant_sessions ins ON br.session_id = ins.id
      WHERE br.id = breakout_room_participants.breakout_room_id
      AND ins.therapist_id = auth.uid()
    )
  );

-- Create UPDATE policy for therapists
CREATE POLICY "breakout_participants_update"
  ON public.breakout_room_participants FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 
      FROM public.breakout_rooms br
      INNER JOIN public.instant_sessions ins ON br.session_id = ins.id
      WHERE br.id = breakout_room_participants.breakout_room_id
      AND ins.therapist_id = auth.uid()
    )
  );

-- Create DELETE policy for therapists
CREATE POLICY "breakout_participants_delete"
  ON public.breakout_room_participants FOR DELETE
  USING (
    EXISTS (
      SELECT 1 
      FROM public.breakout_rooms br
      INNER JOIN public.instant_sessions ins ON br.session_id = ins.id
      WHERE br.id = breakout_room_participants.breakout_room_id
      AND ins.therapist_id = auth.uid()
    )
  );

-- Verify policies were created
SELECT 
  policyname, 
  cmd,
  CASE 
    WHEN policyname LIKE '%select%' THEN 'SELECT'
    WHEN policyname LIKE '%insert%' THEN 'INSERT'
    WHEN policyname LIKE '%update%' THEN 'UPDATE'
    WHEN policyname LIKE '%delete%' THEN 'DELETE'
  END as operation
FROM pg_policies 
WHERE tablename = 'breakout_room_participants'
ORDER BY policyname;

-- Should show 4 policies (select, insert, update, delete)

