-- Add missing columns to health_checks table
ALTER TABLE public.health_checks 
ADD COLUMN IF NOT EXISTS agora_sdk_loaded BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS agora_credentials_configured BOOLEAN DEFAULT false;

-- Create performance_metrics table for production monitoring
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  average NUMERIC(10,2) NOT NULL,
  min NUMERIC(10,2) NOT NULL,
  max NUMERIC(10,2) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for performance_metrics
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies for performance_metrics (allow authenticated users to read/write)
CREATE POLICY "Allow authenticated users to insert performance metrics" 
ON public.performance_metrics 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read performance metrics" 
ON public.performance_metrics 
FOR SELECT 
TO authenticated 
USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON public.performance_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_metric_name ON public.performance_metrics(metric_name);

-- Create function to cleanup old performance metrics (keep last 7 days)
CREATE OR REPLACE FUNCTION cleanup_old_performance_metrics()
RETURNS void AS $$
BEGIN
  DELETE FROM public.performance_metrics 
  WHERE timestamp < (now() - interval '7 days');
END;
$$ LANGUAGE plpgsql;

-- Create function to get system health status
CREATE OR REPLACE FUNCTION get_system_health_status()
RETURNS TABLE (
  status TEXT,
  database_connected BOOLEAN,
  webrtc_available BOOLEAN,
  agora_sdk_loaded BOOLEAN,
  agora_credentials_configured BOOLEAN,
  last_check TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN h.database_connected AND h.webrtc_available AND h.agora_sdk_loaded AND h.agora_credentials_configured THEN 'healthy'
      WHEN h.database_connected AND h.webrtc_available THEN 'degraded'
      ELSE 'unhealthy'
    END as status,
    h.database_connected,
    h.webrtc_available,
    h.agora_sdk_loaded,
    h.agora_credentials_configured,
    h.timestamp as last_check
  FROM public.health_checks h
  ORDER BY h.timestamp DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;