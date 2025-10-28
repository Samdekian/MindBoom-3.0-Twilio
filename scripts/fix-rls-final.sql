-- ===========================================================================
-- FIX: RLS Infinite Recursion - FINAL VERSION
-- ===========================================================================
-- This drops ALL existing policies and creates fresh ones

-- 1. Drop EVERY possible policy that might exist
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on breakout_room_participants table
    FOR r IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'breakout_room_participants'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.breakout_room_participants', r.policyname);
        RAISE NOTICE 'Dropped policy: %', r.policyname;
    END LOOP;
END $$;

-- 2. Create fresh SELECT policy (non-recursive)
CREATE POLICY "breakout_participants_select"
  ON public.breakout_room_participants
  FOR SELECT
  USING (
    -- Users can see their own assignments
    user_id = auth.uid()
    OR
    -- Therapists can see all participants in their sessions
    EXISTS (
      SELECT 1 
      FROM public.breakout_rooms br
      INNER JOIN public.instant_sessions ins ON ins.id = br.session_id
      WHERE br.id = breakout_room_participants.breakout_room_id
        AND ins.therapist_id = auth.uid()
    )
  );

-- 3. Create fresh INSERT policy
CREATE POLICY "breakout_participants_insert"
  ON public.breakout_room_participants
  FOR INSERT
  WITH CHECK (
    -- Therapists can assign participants
    EXISTS (
      SELECT 1 
      FROM public.breakout_rooms br
      INNER JOIN public.instant_sessions ins ON ins.id = br.session_id
      WHERE br.id = breakout_room_participants.breakout_room_id
        AND ins.therapist_id = auth.uid()
    )
    OR
    -- Participants can join themselves
    user_id = auth.uid()
  );

-- 4. Create fresh UPDATE policy
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

-- 5. Create fresh DELETE policy
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

-- 6. Verify the new policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as operation
FROM pg_policies 
WHERE tablename = 'breakout_room_participants'
ORDER BY policyname;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=================================================';
  RAISE NOTICE '✅ RLS POLICIES FIXED SUCCESSFULLY!';
  RAISE NOTICE '=================================================';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Policies created:';
  RAISE NOTICE '   ✓ breakout_participants_select   (SELECT)';
  RAISE NOTICE '   ✓ breakout_participants_insert   (INSERT)';
  RAISE NOTICE '   ✓ breakout_participants_update   (UPDATE)';
  RAISE NOTICE '   ✓ breakout_participants_delete   (DELETE)';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Infinite recursion error is FIXED!';
  RAISE NOTICE '🚀 You can now test Breakout Rooms!';
  RAISE NOTICE '';
  RAISE NOTICE '=================================================';
END $$;

