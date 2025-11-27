-- Phase 3: Database Optimization for Video Conference Tables

-- Enable full replica identity for real-time updates
ALTER TABLE instant_session_participants REPLICA IDENTITY FULL;
ALTER TABLE instant_sessions REPLICA IDENTITY FULL;

-- Add performance indexes for session participant queries
CREATE INDEX IF NOT EXISTS idx_session_participants_session_active 
ON instant_session_participants(session_id, is_active) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_session_participants_user_active 
ON instant_session_participants(user_id, is_active) 
WHERE is_active = true;

-- Add index for session lookup by token
CREATE INDEX IF NOT EXISTS idx_instant_sessions_token_active 
ON instant_sessions(session_token, is_active) 
WHERE is_active = true;

-- Add index for active sessions by therapist
CREATE INDEX IF NOT EXISTS idx_instant_sessions_therapist_active 
ON instant_sessions(therapist_id, is_active, expires_at) 
WHERE is_active = true;

-- Create optimized function for session participant count
CREATE OR REPLACE FUNCTION get_active_participant_count(session_uuid uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM instant_session_participants 
  WHERE session_id = session_uuid 
  AND is_active = true;
$$;

-- Create function to validate session access for participants
CREATE OR REPLACE FUNCTION can_join_session(session_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM instant_sessions 
    WHERE id = session_uuid 
    AND is_active = true 
    AND expires_at > now()
    AND (
      therapist_id = user_uuid 
      OR max_participants > (
        SELECT COUNT(*) 
        FROM instant_session_participants 
        WHERE session_id = session_uuid 
        AND is_active = true
      )
    )
  );
$$;

-- Add RLS policy using the new security definer function
DROP POLICY IF EXISTS "Users can join sessions if allowed" ON instant_session_participants;
CREATE POLICY "Users can join sessions if allowed" 
ON instant_session_participants 
FOR INSERT 
WITH CHECK (can_join_session(session_id, auth.uid()));

-- Update existing RLS policy to use security definer function for better performance
DROP POLICY IF EXISTS "Users can update their own participation" ON instant_session_participants;
CREATE POLICY "Users can update their own participation" 
ON instant_session_participants 
FOR UPDATE 
USING (
  user_id = auth.uid() 
  OR EXISTS (
    SELECT 1 
    FROM instant_sessions 
    WHERE instant_sessions.id = instant_session_participants.session_id 
    AND instant_sessions.therapist_id = auth.uid()
  )
);