-- ============================================================================
-- Migration: Fix Video Session Stability Issues
-- Created: 2025-01-29
-- Description: 
--  1. Fix sync_user_roles 404 error
--  2. Fix instant_session_participants UPSERT 400 error  
--  3. Fix breakout_rooms query 400 error (RLS policy)
--  4. Prevent multiple active connections from same user
-- ============================================================================

-- ============================================================================
-- PART 1: Fix sync_user_roles function (404 error)
-- ============================================================================

-- Drop existing function if it exists with wrong signature
DROP FUNCTION IF EXISTS public.sync_user_roles();
DROP FUNCTION IF EXISTS public.sync_user_roles(uuid);

-- Recreate sync_user_roles function with proper signature and permissions
CREATE OR REPLACE FUNCTION public.sync_user_roles(p_user_id uuid DEFAULT auth.uid())
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _user_id uuid := COALESCE(p_user_id, auth.uid());
    _user_role text;
    _profile_exists boolean;
    _user_metadata jsonb;
    _account_type text;
    _approval_status text;
    _full_name text;
    _avatar_url text;
BEGIN
    -- Check if user exists in auth.users
    SELECT raw_user_meta_data INTO _user_metadata FROM auth.users WHERE id = _user_id;

    IF _user_metadata IS NULL THEN
        RAISE EXCEPTION 'User with ID % not found in auth.users', _user_id;
    END IF;

    _account_type := _user_metadata->>'accountType';
    _approval_status := _user_metadata->>'approval_status';
    _full_name := _user_metadata->>'full_name';
    _avatar_url := _user_metadata->>'avatar_url';

    -- Ensure a profile exists for the user
    SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id) INTO _profile_exists;

    IF NOT _profile_exists THEN
        INSERT INTO public.profiles (id, full_name, avatar_url, account_type, approval_status)
        VALUES (_user_id, _full_name, _avatar_url, _account_type, _approval_status)
        ON CONFLICT (id) DO NOTHING;
    END IF;

    -- Clear existing roles for the user
    DELETE FROM public.user_roles WHERE user_id = _user_id;

    -- Assign role based on account_type from metadata
    IF _account_type = 'therapist' THEN
        INSERT INTO public.user_roles (user_id, role_id)
        SELECT _user_id, id FROM public.roles WHERE role_name = 'therapist';
        _user_role := 'therapist';
    ELSIF _account_type = 'patient' THEN
        INSERT INTO public.user_roles (user_id, role_id)
        SELECT _user_id, id FROM public.roles WHERE role_name = 'patient';
        _user_role := 'patient';
    ELSE
        -- Default role if accountType is not specified or unknown
        INSERT INTO public.user_roles (user_id, role_id)
        SELECT _user_id, id FROM public.roles WHERE role_name = 'patient';
        _user_role := 'patient';
    END IF;

    RETURN jsonb_build_object(
        'user_id', _user_id,
        'role', _user_role,
        'status', 'roles synchronized'
    );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.sync_user_roles(uuid) TO anon, authenticated, service_role;

-- ============================================================================
-- PART 2: Fix instant_session_participants UPSERT (400 error)
-- ============================================================================

-- Ensure unique index exists for UPSERT
DROP INDEX IF EXISTS idx_instant_participants_upsert;
CREATE UNIQUE INDEX IF NOT EXISTS idx_instant_participants_upsert 
ON public.instant_session_participants (session_id, user_id) 
WHERE user_id IS NOT NULL;

-- Update RLS policies to allow UPSERT
DROP POLICY IF EXISTS instant_participants_insert_authenticated ON instant_session_participants;
DROP POLICY IF EXISTS instant_participants_update_own ON instant_session_participants;

-- Policy for authenticated users to insert/update their own participant record
CREATE POLICY "instant_participants_insert_authenticated" ON instant_session_participants
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "instant_participants_update_own" ON instant_session_participants
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- PART 3: Prevent multiple active connections from same user
-- ============================================================================

-- Function to deactivate old participant records when new one is inserted
CREATE OR REPLACE FUNCTION public.handle_duplicate_participant()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- If this is a new active participant with a user_id,
    -- deactivate all other active participants for this user in other sessions
    -- (but keep current session participants active)
    IF NEW.user_id IS NOT NULL AND NEW.is_active = true THEN
        UPDATE instant_session_participants
        SET is_active = false,
            left_at = NOW()
        WHERE user_id = NEW.user_id
          AND session_id != NEW.session_id
          AND is_active = true;
        
        -- Also deactivate any other participants in the same session with same user_id
        -- (shouldn't happen due to unique index, but just in case)
        UPDATE instant_session_participants
        SET is_active = false,
            left_at = NOW()
        WHERE session_id = NEW.session_id
          AND user_id = NEW.user_id
          AND id != NEW.id
          AND is_active = true;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger to automatically handle duplicates
DROP TRIGGER IF EXISTS prevent_duplicate_participants ON instant_session_participants;
CREATE TRIGGER prevent_duplicate_participants
  AFTER INSERT ON instant_session_participants
  FOR EACH ROW
  WHEN (NEW.user_id IS NOT NULL)
  EXECUTE FUNCTION public.handle_duplicate_participant();

-- ============================================================================
-- PART 4: Fix breakout_rooms RLS policy (400 error)
-- ============================================================================

-- Drop existing problematic policy
DROP POLICY IF EXISTS "Users can view breakout rooms in their sessions" ON breakout_rooms;
DROP POLICY IF EXISTS "Users can view breakout rooms in their sessions" ON breakout_rooms;

-- Create simplified policy that doesn't cause recursion
CREATE POLICY "breakout_rooms_select_by_participant" ON breakout_rooms
  FOR SELECT TO authenticated
  USING (
    -- User is therapist of the session
    EXISTS (
      SELECT 1 FROM instant_sessions
      WHERE instant_sessions.id = breakout_rooms.main_session_id
      AND instant_sessions.therapist_id = auth.uid()
    )
    OR
    -- User is active participant in the session
    EXISTS (
      SELECT 1 FROM instant_session_participants
      WHERE instant_session_participants.session_id = breakout_rooms.session_id
      AND instant_session_participants.user_id = auth.uid()
      AND instant_session_participants.is_active = true
    )
  );

-- Also allow anonymous users to view active sessions (for shared links)
CREATE POLICY "breakout_rooms_select_active_sessions" ON breakout_rooms
  FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM instant_sessions
      WHERE instant_sessions.id = breakout_rooms.main_session_id
      AND instant_sessions.is_active = true
      AND instant_sessions.expires_at > now()
    )
  );

-- Update therapist management policy to avoid recursion
DROP POLICY IF EXISTS "Therapists can manage breakout rooms in their sessions" ON breakout_rooms;

CREATE POLICY "breakout_rooms_manage_therapist" ON breakout_rooms
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM instant_sessions
      WHERE instant_sessions.id = breakout_rooms.main_session_id
      AND instant_sessions.therapist_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM instant_sessions
      WHERE instant_sessions.id = breakout_rooms.main_session_id
      AND instant_sessions.therapist_id = auth.uid()
    )
  );

-- ============================================================================
-- PART 5: Add indexes for performance
-- ============================================================================

-- Index for checking active participants
CREATE INDEX IF NOT EXISTS idx_instant_participants_active_user 
ON instant_session_participants(user_id, is_active) 
WHERE is_active = true AND user_id IS NOT NULL;

-- Index for session lookup
CREATE INDEX IF NOT EXISTS idx_instant_participants_session_active
ON instant_session_participants(session_id, is_active)
WHERE is_active = true;

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Verify sync_user_roles exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'sync_user_roles' 
        AND pronamespace = 'public'::regnamespace
    ) THEN
        RAISE EXCEPTION 'sync_user_roles function not created';
    END IF;
    RAISE NOTICE '✅ sync_user_roles function verified';
END $$;

-- Verify unique index exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_instant_participants_upsert'
    ) THEN
        RAISE EXCEPTION 'Unique index for UPSERT not created';
    END IF;
    RAISE NOTICE '✅ Unique index for UPSERT verified';
END $$;

-- Verify trigger exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'prevent_duplicate_participants'
    ) THEN
        RAISE EXCEPTION 'Duplicate prevention trigger not created';
    END IF;
    RAISE NOTICE '✅ Duplicate prevention trigger verified';
END $$;

RAISE NOTICE '✅ Migration completed successfully!';

