-- Clean up all currently active participants from expired or inactive sessions
UPDATE instant_session_participants 
SET is_active = false, left_at = now()
WHERE is_active = true 
AND session_id IN (
  SELECT id FROM instant_sessions 
  WHERE expires_at < now() OR is_active = false
);

-- Also clean up any duplicate participant records for the same user/session
-- Use joined_at to keep the earliest record instead of MIN(id)
WITH duplicate_participants AS (
  SELECT 
    session_id,
    user_id,
    participant_name,
    COUNT(*) as count,
    MIN(joined_at) as earliest_joined
  FROM instant_session_participants 
  WHERE is_active = true
  GROUP BY session_id, user_id, participant_name
  HAVING COUNT(*) > 1
)
UPDATE instant_session_participants 
SET is_active = false, left_at = now()
WHERE (session_id, user_id, participant_name) IN (
  SELECT session_id, user_id, participant_name 
  FROM duplicate_participants
)
AND joined_at NOT IN (
  SELECT earliest_joined 
  FROM duplicate_participants dp
  WHERE dp.session_id = instant_session_participants.session_id
  AND dp.user_id = instant_session_participants.user_id
  AND dp.participant_name = instant_session_participants.participant_name
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