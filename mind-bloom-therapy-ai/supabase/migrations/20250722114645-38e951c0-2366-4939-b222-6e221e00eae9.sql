-- Create tables for session analytics and monitoring

-- Session analytics events table
CREATE TABLE public.session_analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  participant_id UUID,
  participant_name TEXT,
  user_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Session analytics summary table
CREATE TABLE public.session_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL UNIQUE,
  session_started_at TIMESTAMP WITH TIME ZONE,
  session_ended_at TIMESTAMP WITH TIME ZONE,
  total_duration_seconds INTEGER DEFAULT 0,
  total_participants INTEGER DEFAULT 0,
  max_concurrent_participants INTEGER DEFAULT 0,
  disconnection_count INTEGER DEFAULT 0,
  reconnection_count INTEGER DEFAULT 0,
  chat_messages_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Session quality metrics table
CREATE TABLE public.session_quality_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  participant_id UUID,
  connection_quality TEXT NOT NULL,
  network_quality JSONB,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Session recordings table
CREATE TABLE public.session_recordings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  resource_id TEXT NOT NULL,
  sid TEXT NOT NULL,
  channel_name TEXT NOT NULL,
  uid INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'recording',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  file_list JSONB DEFAULT '[]'::jsonb,
  upload_info JSONB DEFAULT '{}'::jsonb,
  recording_config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX idx_session_analytics_events_session_id ON public.session_analytics_events(session_id);
CREATE INDEX idx_session_analytics_events_event_type ON public.session_analytics_events(event_type);
CREATE INDEX idx_session_analytics_events_created_at ON public.session_analytics_events(created_at);
CREATE INDEX idx_session_quality_metrics_session_id ON public.session_quality_metrics(session_id);
CREATE INDEX idx_session_recordings_session_id ON public.session_recordings(session_id);

-- Enable RLS on all tables
ALTER TABLE public.session_analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_quality_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_recordings ENABLE ROW LEVEL SECURITY;

-- RLS policies for session_analytics_events
CREATE POLICY "Users can view analytics events for their sessions"
ON public.session_analytics_events
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM instant_sessions
    WHERE instant_sessions.id = session_analytics_events.session_id
    AND (instant_sessions.therapist_id = auth.uid() OR 
         EXISTS (
           SELECT 1 FROM instant_session_participants
           WHERE instant_session_participants.session_id = instant_sessions.id
           AND instant_session_participants.user_id = auth.uid()
         )
    )
  )
);

CREATE POLICY "System can insert analytics events"
ON public.session_analytics_events
FOR INSERT
WITH CHECK (true);

-- RLS policies for session_analytics
CREATE POLICY "Users can view analytics for their sessions"
ON public.session_analytics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM instant_sessions
    WHERE instant_sessions.id = session_analytics.session_id
    AND (instant_sessions.therapist_id = auth.uid() OR 
         EXISTS (
           SELECT 1 FROM instant_session_participants
           WHERE instant_session_participants.session_id = instant_sessions.id
           AND instant_session_participants.user_id = auth.uid()
         )
    )
  )
);

CREATE POLICY "System can manage session analytics"
ON public.session_analytics
FOR ALL
USING (true);

-- RLS policies for session_quality_metrics
CREATE POLICY "Users can view quality metrics for their sessions"
ON public.session_quality_metrics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM instant_sessions
    WHERE instant_sessions.id = session_quality_metrics.session_id
    AND (instant_sessions.therapist_id = auth.uid() OR 
         EXISTS (
           SELECT 1 FROM instant_session_participants
           WHERE instant_session_participants.session_id = instant_sessions.id
           AND instant_session_participants.user_id = auth.uid()
         )
    )
  )
);

CREATE POLICY "System can insert quality metrics"
ON public.session_quality_metrics
FOR INSERT
WITH CHECK (true);

-- RLS policies for session_recordings
CREATE POLICY "Session owners can view recordings"
ON public.session_recordings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM instant_sessions
    WHERE instant_sessions.id = session_recordings.session_id
    AND instant_sessions.therapist_id = auth.uid()
  )
);

CREATE POLICY "System can manage recordings"
ON public.session_recordings
FOR ALL
USING (true);

-- Add triggers for updated_at
CREATE TRIGGER update_session_analytics_updated_at
  BEFORE UPDATE ON public.session_analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_session_recordings_updated_at
  BEFORE UPDATE ON public.session_recordings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Database functions for analytics
CREATE OR REPLACE FUNCTION public.increment_participant_count(session_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO session_analytics (session_id, total_participants)
  VALUES (session_id_param, 1)
  ON CONFLICT (session_id)
  DO UPDATE SET
    total_participants = session_analytics.total_participants + 1,
    max_concurrent_participants = GREATEST(
      session_analytics.max_concurrent_participants,
      session_analytics.total_participants + 1
    ),
    updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_participant_count(session_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE session_analytics
  SET 
    total_participants = GREATEST(0, total_participants - 1),
    updated_at = now()
  WHERE session_id = session_id_param;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_error_count(session_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO session_analytics (session_id, error_count)
  VALUES (session_id_param, 1)
  ON CONFLICT (session_id)
  DO UPDATE SET
    error_count = session_analytics.error_count + 1,
    updated_at = now();
END;
$$;