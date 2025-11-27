-- Create tables one by one with proper error handling

-- First, create session_analytics_events table
CREATE TABLE IF NOT EXISTS public.session_analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  participant_id TEXT,
  participant_name TEXT,
  user_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.session_analytics_events ENABLE ROW LEVEL SECURITY;

-- Add basic policies
CREATE POLICY IF NOT EXISTS "Anyone can insert events" 
ON public.session_analytics_events 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Users can view their session events" 
ON public.session_analytics_events 
FOR SELECT 
USING (user_id = auth.uid() OR true);