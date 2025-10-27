-- Create session_connection_logs table for detailed connection monitoring
CREATE TABLE IF NOT EXISTS public.session_connection_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  connection_state TEXT NOT NULL,
  rtt_ms REAL,
  packet_loss_rate REAL,
  jitter_ms REAL,
  bandwidth_kbps INTEGER,
  quality_score INTEGER,
  quality_level TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient session lookups
CREATE INDEX IF NOT EXISTS idx_session_connection_logs_session_id 
ON public.session_connection_logs(session_id);

-- Create index for time-based queries
CREATE INDEX IF NOT EXISTS idx_session_connection_logs_created_at 
ON public.session_connection_logs(created_at);

-- Enable RLS
ALTER TABLE public.session_connection_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view logs for sessions they participate in" 
ON public.session_connection_logs FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM instant_session_participants isp
    WHERE isp.session_id::text = session_connection_logs.session_id 
    AND isp.user_id = auth.uid()
  )
);

CREATE POLICY "System can insert connection logs" 
ON public.session_connection_logs FOR INSERT 
WITH CHECK (true);

-- Create function to clean up old connection logs (keep 30 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_connection_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM session_connection_logs 
  WHERE created_at < now() - interval '30 days';
END;
$$;