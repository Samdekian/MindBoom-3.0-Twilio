-- Phase 1: Clean up stale participant records and add constraints

-- Mark all participants in expired sessions as inactive
UPDATE instant_session_participants 
SET is_active = false, left_at = now() 
WHERE session_id IN (
  SELECT id FROM instant_sessions 
  WHERE expires_at < now() OR is_active = false
);

-- Remove duplicate participants (keep only the most recent for each user per session)
DELETE FROM instant_session_participants 
WHERE id NOT IN (
  SELECT DISTINCT ON (session_id, COALESCE(user_id, participant_name)) id
  FROM instant_session_participants 
  ORDER BY session_id, COALESCE(user_id, participant_name), joined_at DESC
);

-- Add unique constraint to prevent duplicate participants per session
-- For authenticated users: unique (session_id, user_id) where user_id is not null
-- For anonymous users: unique (session_id, participant_name) where user_id is null
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_unique_session_user 
ON instant_session_participants (session_id, user_id) 
WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_unique_session_anonymous 
ON instant_session_participants (session_id, participant_name) 
WHERE user_id IS NULL AND participant_name IS NOT NULL;

-- Create function to clean up expired sessions and inactive participants
CREATE OR REPLACE FUNCTION cleanup_expired_instant_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Mark participants in expired sessions as inactive
  UPDATE instant_session_participants 
  SET is_active = false, left_at = now() 
  WHERE is_active = true 
  AND session_id IN (
    SELECT id FROM instant_sessions 
    WHERE expires_at < now() OR is_active = false
  );
  
  -- Deactivate expired sessions
  UPDATE instant_sessions 
  SET is_active = false, session_status = 'expired'
  WHERE expires_at < now() AND is_active = true;
END;
$$;

-- Create function to handle participant cleanup on disconnect
CREATE OR REPLACE FUNCTION cleanup_participant_on_disconnect(p_session_id uuid, p_user_id uuid DEFAULT NULL, p_participant_name text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE instant_session_participants 
  SET is_active = false, left_at = now()
  WHERE session_id = p_session_id 
  AND is_active = true
  AND (
    (p_user_id IS NOT NULL AND user_id = p_user_id) OR
    (p_user_id IS NULL AND participant_name = p_participant_name)
  );
END;
$$;