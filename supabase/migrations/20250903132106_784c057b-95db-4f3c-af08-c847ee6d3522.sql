-- Add unique constraint to instant_session_participants table to support ON CONFLICT
ALTER TABLE instant_session_participants 
ADD CONSTRAINT unique_session_user UNIQUE (session_id, user_id);