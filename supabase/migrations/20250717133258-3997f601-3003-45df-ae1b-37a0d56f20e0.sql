-- Clean up all currently active participants from expired or inactive sessions
UPDATE instant_session_participants 
SET is_active = false, left_at = now()
WHERE is_active = true 
AND session_id IN (
  SELECT id FROM instant_sessions 
  WHERE expires_at < now() OR is_active = false
);

-- Also clean up any duplicate participant records for the same user/session
WITH duplicate_participants AS (
  SELECT 
    session_id,
    user_id,
    participant_name,
    COUNT(*) as count,
    MIN(id) as keep_id
  FROM instant_session_participants 
  WHERE is_active = true
  GROUP BY session_id, user_id, participant_name
  HAVING COUNT(*) > 1
)
UPDATE instant_session_participants 
SET is_active = false, left_at = now()
WHERE id NOT IN (SELECT keep_id FROM duplicate_participants)
AND (session_id, user_id, participant_name) IN (
  SELECT session_id, user_id, participant_name 
  FROM duplicate_participants
);

-- Add better participant cleanup on browser close/refresh
CREATE OR REPLACE FUNCTION public.cleanup_stale_participants()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Mark participants as inactive if they haven't been active for more than 5 minutes
  -- This helps catch cases where browser was closed without proper cleanup
  UPDATE instant_session_participants 
  SET is_active = false, left_at = now()
  WHERE is_active = true 
  AND joined_at < now() - INTERVAL '5 minutes'
  AND left_at IS NULL
  AND session_id IN (
    SELECT id FROM instant_sessions 
    WHERE expires_at < now() OR is_active = false
  );
END;
$$;