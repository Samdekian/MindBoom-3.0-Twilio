-- Create session analytics events table
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

-- Add policies (without IF NOT EXISTS since it's not supported for policies)
DROP POLICY IF EXISTS "Anyone can insert events" ON public.session_analytics_events;
CREATE POLICY "Anyone can insert events" 
ON public.session_analytics_events 
FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their session events" ON public.session_analytics_events;
CREATE POLICY "Users can view their session events" 
ON public.session_analytics_events 
FOR SELECT 
USING (true);

-- Create session quality metrics table
CREATE TABLE IF NOT EXISTS public.session_quality_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  participant_id TEXT,
  connection_quality TEXT NOT NULL,
  network_quality JSONB,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.session_quality_metrics ENABLE ROW LEVEL SECURITY;

-- Add policies
DROP POLICY IF EXISTS "Anyone can insert quality metrics" ON public.session_quality_metrics;
CREATE POLICY "Anyone can insert quality metrics" 
ON public.session_quality_metrics 
FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view quality metrics" ON public.session_quality_metrics;
CREATE POLICY "Users can view quality metrics" 
ON public.session_quality_metrics 
FOR SELECT 
USING (true);