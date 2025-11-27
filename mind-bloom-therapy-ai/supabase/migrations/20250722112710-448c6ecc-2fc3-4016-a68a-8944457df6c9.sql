
-- Create the missing health_checks table
CREATE TABLE public.health_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'healthy',
  last_check_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  response_time_ms INTEGER,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for health checks
ALTER TABLE public.health_checks ENABLE ROW LEVEL SECURITY;

-- Policy for admins to view all health checks
CREATE POLICY "Admins can view all health checks"
ON public.health_checks
FOR SELECT
USING (is_admin_bypass_rls(auth.uid()));

-- Policy for system to insert health checks
CREATE POLICY "System can insert health checks"
ON public.health_checks
FOR INSERT
WITH CHECK (true);

-- Policy for system to update health checks
CREATE POLICY "System can update health checks"
ON public.health_checks
FOR UPDATE
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_health_checks_updated_at
  BEFORE UPDATE ON public.health_checks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for instant_session_participants
ALTER TABLE public.instant_session_participants REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.instant_session_participants;

-- Enable realtime for instant_sessions
ALTER TABLE public.instant_sessions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.instant_sessions;
