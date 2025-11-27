-- Fix RLS policy for instant_session_participants to allow guests/patients to join
-- The issue: can_join_session() was too restrictive, blocking non-therapist users

-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "Users can join sessions if allowed" ON instant_session_participants;

-- Create a more permissive policy that allows:
-- 1. Therapist (session owner) to join
-- 2. Any authenticated user to join if session is active, not expired, and has room
-- 3. Guest users (unauthenticated) to join with null user_id if session allows
CREATE POLICY "Users can join active sessions"
ON instant_session_participants
FOR INSERT
WITH CHECK (
  -- Session must be active and not expired
  EXISTS (
    SELECT 1
    FROM instant_sessions
    WHERE instant_sessions.id = instant_session_participants.session_id
    AND instant_sessions.is_active = true
    AND instant_sessions.expires_at > now()
    AND (
      -- Check if there's room (current participants < max)
      (
        SELECT COUNT(*)
        FROM instant_session_participants AS isp
        WHERE isp.session_id = instant_session_participants.session_id
        AND isp.is_active = true
      ) < instant_sessions.max_participants
    )
  )
  AND (
    -- Either authenticated user inserting their own record
    (user_id = auth.uid() AND auth.uid() IS NOT NULL)
    -- Or guest user (null user_id) if waiting room is enabled
    OR (user_id IS NULL AND EXISTS (
      SELECT 1
      FROM instant_sessions
      WHERE instant_sessions.id = instant_session_participants.session_id
      AND instant_sessions.waiting_room_enabled = true
    ))
  )
);

-- Also ensure SELECT policy allows participants to see each other
DROP POLICY IF EXISTS "Users can view participants in sessions they're in" ON instant_session_participants;
CREATE POLICY "Users can view participants in their sessions"
ON instant_session_participants
FOR SELECT
USING (
  -- User can see their own participation
  user_id = auth.uid()
  OR
  -- User can see other participants in sessions they're in
  EXISTS (
    SELECT 1
    FROM instant_session_participants AS my_participation
    WHERE my_participation.session_id = instant_session_participants.session_id
    AND my_participation.user_id = auth.uid()
    AND my_participation.is_active = true
  )
  OR
  -- Therapist can see all participants in their sessions
  EXISTS (
    SELECT 1
    FROM instant_sessions
    WHERE instant_sessions.id = instant_session_participants.session_id
    AND instant_sessions.therapist_id = auth.uid()
  )
);

