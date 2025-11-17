-- Add role column to instant_session_participants
ALTER TABLE instant_session_participants 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'participant';

-- Add check constraint for valid roles
ALTER TABLE instant_session_participants 
ADD CONSTRAINT IF NOT EXISTS participant_role_check 
CHECK (role IN ('host', 'participant', 'moderator', 'observer'));

-- Add index for filtering by role
CREATE INDEX IF NOT EXISTS idx_instant_session_participants_role 
ON instant_session_participants(role);

COMMENT ON COLUMN instant_session_participants.role IS 'Participant role: host (therapist), participant (patient), moderator, or observer';

