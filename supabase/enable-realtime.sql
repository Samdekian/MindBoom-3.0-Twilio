
-- Enable full replication identity for the appointments table
ALTER TABLE appointments REPLICA IDENTITY FULL;

-- Add the appointments table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;

-- Create table for session notes
CREATE TABLE IF NOT EXISTS public.session_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id),
  created_by UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on the session_notes table
ALTER TABLE public.session_notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for session_notes
CREATE POLICY "Therapists can view their patients' notes" ON public.session_notes 
  FOR SELECT USING (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM appointments 
      WHERE appointments.id = session_notes.appointment_id 
      AND appointments.therapist_id = auth.uid()
    )
  );

-- Create policy for inserting and updating session notes
CREATE POLICY "Therapists can create and update notes" ON public.session_notes 
  FOR ALL USING (auth.uid() = created_by);

-- Create table for Google Calendar webhook tracking
CREATE TABLE IF NOT EXISTS public.google_calendar_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id TEXT,
  resource_id TEXT,
  resource_state TEXT,
  headers JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Create table for Google Calendar webhook configurations
CREATE TABLE IF NOT EXISTS public.google_calendar_webhook_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  calendar_id TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  expiration TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes to improve performance
CREATE INDEX IF NOT EXISTS idx_session_notes_appointment_id ON public.session_notes(appointment_id);
CREATE INDEX IF NOT EXISTS idx_session_notes_created_by ON public.session_notes(created_by);
CREATE INDEX IF NOT EXISTS idx_google_calendar_webhooks_channel_id ON public.google_calendar_webhooks(channel_id);
CREATE INDEX IF NOT EXISTS idx_google_calendar_webhook_configs_user_id ON public.google_calendar_webhook_configs(user_id);
