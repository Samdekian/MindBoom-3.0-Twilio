
-- Add Google Calendar event ID column to appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS google_calendar_event_id text;
