-- Add appointment_type column to appointments table
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS appointment_type TEXT DEFAULT 'video';

-- Add index for filtering by appointment type
CREATE INDEX IF NOT EXISTS idx_appointments_type 
ON appointments(appointment_type);

-- Add check constraint for valid types
ALTER TABLE appointments 
ADD CONSTRAINT IF NOT EXISTS appointments_type_check 
CHECK (appointment_type IN ('video', 'consultation', 'therapy', 'follow-up'));

COMMENT ON COLUMN appointments.appointment_type IS 'Type of appointment: video, consultation, therapy, or follow-up';

