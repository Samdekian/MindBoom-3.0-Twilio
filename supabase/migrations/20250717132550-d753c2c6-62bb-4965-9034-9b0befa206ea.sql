-- Phase 1: Clean up stale participant records and add constraints

-- Mark all participants in expired sessions as inactive
UPDATE instant_session_participants 
SET is_active = false, left_at = now() 
WHERE session_id IN (
  SELECT id FROM instant_sessions 
  WHERE expires_at < now() OR is_active = false
);

-- Remove duplicate participants for authenticated users (keep only the most recent)
DELETE FROM instant_session_participants 
WHERE user_id IS NOT NULL
AND id NOT IN (
  SELECT DISTINCT ON (session_id, user_id) id
  FROM instant_session_participants 
  WHERE user_id IS NOT NULL
  ORDER BY session_id, user_id, joined_at DESC
);

-- Remove duplicate participants for anonymous users (keep only the most recent)
DELETE FROM instant_session_participants 
WHERE user_id IS NULL 
AND participant_name IS NOT NULL
AND id NOT IN (
  SELECT DISTINCT ON (session_id, participant_name) id
  FROM instant_session_participants 
  WHERE user_id IS NULL AND participant_name IS NOT NULL
  ORDER BY session_id, participant_name, joined_at DESC
);

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