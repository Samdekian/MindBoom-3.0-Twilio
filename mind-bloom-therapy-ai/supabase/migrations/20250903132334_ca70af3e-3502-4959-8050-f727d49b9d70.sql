-- First, remove duplicate entries keeping the most recent one
DELETE FROM instant_session_participants 
WHERE id NOT IN (
  SELECT DISTINCT ON (session_id, user_id) id
  FROM instant_session_participants 
  ORDER BY session_id, user_id, joined_at DESC
);

-- Now add the unique constraint
ALTER TABLE instant_session_participants 
ADD CONSTRAINT unique_session_user UNIQUE (session_id, user_id);