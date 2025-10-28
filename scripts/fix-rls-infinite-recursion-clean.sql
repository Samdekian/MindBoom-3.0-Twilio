-- ===========================================================================
-- FIX: RLS Infinite Recursion - CLEAN VERSION (Drops existing policies first)
-- ===========================================================================
-- This fixes the infinite recursion error in breakout_room_participants RLS

-- 1. Drop ALL existing policies that might cause issues
DROP POLICY IF EXISTS "Users can view participants in their breakout room" ON public.breakout_room_participants;
DROP POLICY IF EXISTS "System can manage breakout room participants" ON public.breakout_room_participants;
DROP POLICY IF EXISTS "breakout_participants_select" ON public.breakout_room_participants;
DROP POLICY IF EXISTS "breakout_participants_manage" ON public.breakout_room_participants;

-- 2. Create simple, non-recursive SELECT policy
CREATE POLICY "breakout_participants_select"
  ON public.breakout_room_participants
  FOR SELECT
  USING (
    -- Users can see their own assignments
    user_id = auth.uid()
    OR
    -- Therapists can see all participants in their sessions (simple join, no recursion)
    EXISTS (
      SELECT 1 
      FROM public.breakout_rooms br
      INNER JOIN public.instant_sessions ins ON ins.id = br.session_id
      WHERE br.id = breakout_room_participants.breakout_room_id
        AND ins.therapist_id = auth.uid()
    )
  );

-- 3. Create simple INSERT policy
CREATE POLICY "breakout_participants_insert"
  ON public.breakout_room_participants
  FOR INSERT
  WITH CHECK (
    -- Only therapists can assign participants
    EXISTS (
      SELECT 1 
      FROM public.breakout_rooms br
      INNER JOIN public.instant_sessions ins ON ins.id = br.session_id
      WHERE br.id = breakout_room_participants.breakout_room_id
        AND ins.therapist_id = auth.uid()
    )
    OR
    -- Or participants can join themselves if allowed
    user_id = auth.uid()
  );

-- 4. Create simple UPDATE policy
CREATE POLICY "breakout_participants_update"
  ON public.breakout_room_participants
  FOR UPDATE
  USING (
    -- Therapists can update
    EXISTS (
      SELECT 1 
      FROM public.breakout_rooms br
      INNER JOIN public.instant_sessions ins ON ins.id = br.session_id
      WHERE br.id = breakout_room_participants.breakout_room_id
        AND ins.therapist_id = auth.uid()
    )
    OR
    -- Users can update their own status
    user_id = auth.uid()
  );

-- 5. Create simple DELETE policy
CREATE POLICY "breakout_participants_delete"
  ON public.breakout_room_participants
  FOR DELETE
  USING (
    -- Only therapists can delete
    EXISTS (
      SELECT 1 
      FROM public.breakout_rooms br
      INNER JOIN public.instant_sessions ins ON ins.id = br.session_id
      WHERE br.id = breakout_room_participants.breakout_room_id
        AND ins.therapist_id = auth.uid()
    )
  );

-- 6. Verify policies are created
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as operation,
  qual as using_expression
FROM pg_policies 
WHERE tablename = 'breakout_room_participants'
ORDER BY policyname;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ RLS policies fixed successfully!';
  RAISE NOTICE 'Policies created:';
  RAISE NOTICE '  - breakout_participants_select (SELECT)';
  RAISE NOTICE '  - breakout_participants_insert (INSERT)';
  RAISE NOTICE '  - breakout_participants_update (UPDATE)';
  RAISE NOTICE '  - breakout_participants_delete (DELETE)';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 You can now test breakout rooms!';
END $$;

