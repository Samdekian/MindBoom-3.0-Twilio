
-- Add sync status columns to appointments table if they don't exist
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS sync_status text DEFAULT 'pending';

ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS last_sync_attempt timestamptz;

ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS sync_error text;
