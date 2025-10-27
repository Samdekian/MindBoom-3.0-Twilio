-- Create production monitoring tables

-- Performance metrics table
CREATE TABLE IF NOT EXISTS public.performance_metrics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_name TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 1,
    average DECIMAL(10,2) NOT NULL,
    min DECIMAL(10,2) NOT NULL,
    max DECIMAL(10,2) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    user_id UUID REFERENCES auth.users(id),
    session_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Error logs table
CREATE TABLE IF NOT EXISTS public.error_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    error_message TEXT NOT NULL,
    error_stack TEXT,
    context TEXT NOT NULL,
    additional_data JSONB,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    user_agent TEXT,
    url TEXT,
    user_id UUID REFERENCES auth.users(id),
    session_id UUID,
    severity TEXT DEFAULT 'error' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Health checks table
CREATE TABLE IF NOT EXISTS public.health_checks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    status TEXT NOT NULL CHECK (status IN ('healthy', 'degraded', 'unhealthy')),
    response_time_ms DECIMAL(10,2) NOT NULL,
    database_connected BOOLEAN NOT NULL DEFAULT false,
    webrtc_available BOOLEAN NOT NULL DEFAULT false,
    agora_sdk_loaded BOOLEAN NOT NULL DEFAULT false,
    memory_usage_mb DECIMAL(10,2) DEFAULT 0,
    additional_checks JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Session analytics table (enhanced)
CREATE TABLE IF NOT EXISTS public.session_analytics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL,
    total_participants INTEGER NOT NULL DEFAULT 0,
    max_concurrent_participants INTEGER NOT NULL DEFAULT 0,
    session_duration_minutes INTEGER DEFAULT 0,
    chat_messages_count INTEGER DEFAULT 0,
    disconnection_count INTEGER DEFAULT 0,
    reconnection_count INTEGER DEFAULT 0,
    average_bandwidth_kbps DECIMAL(10,2),
    average_latency_ms DECIMAL(10,2),
    quality_score DECIMAL(3,2) DEFAULT 0.0,
    stability_score DECIMAL(3,2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON public.performance_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_metric_name ON public.performance_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id ON public.performance_metrics(user_id);

CREATE INDEX IF NOT EXISTS idx_error_logs_timestamp ON public.error_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_context ON public.error_logs(context);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON public.error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON public.error_logs(resolved);

CREATE INDEX IF NOT EXISTS idx_health_checks_timestamp ON public.health_checks(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_health_checks_status ON public.health_checks(status);

CREATE INDEX IF NOT EXISTS idx_session_analytics_session_id ON public.session_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_session_analytics_created_at ON public.session_analytics(created_at DESC);

-- Enable RLS
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for performance_metrics
CREATE POLICY "Users can view their own performance metrics" 
ON public.performance_metrics FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can insert their own performance metrics" 
ON public.performance_metrics FOR INSERT 
WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

-- RLS Policies for error_logs  
CREATE POLICY "Users can view their own error logs" 
ON public.error_logs FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can insert their own error logs" 
ON public.error_logs FOR INSERT 
WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

-- RLS Policies for health_checks (public read, system write)
CREATE POLICY "Anyone can view health checks" 
ON public.health_checks FOR SELECT 
USING (true);

CREATE POLICY "System can insert health checks" 
ON public.health_checks FOR INSERT 
WITH CHECK (true);

-- RLS Policies for session_analytics
CREATE POLICY "Anyone can view session analytics" 
ON public.session_analytics FOR SELECT 
USING (true);

CREATE POLICY "System can manage session analytics" 
ON public.session_analytics FOR ALL
USING (true);

-- Create function to clean up old monitoring data
CREATE OR REPLACE FUNCTION public.cleanup_monitoring_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Keep only last 30 days of performance metrics
  DELETE FROM public.performance_metrics 
  WHERE created_at < now() - INTERVAL '30 days';
  
  -- Keep only last 90 days of error logs
  DELETE FROM public.error_logs 
  WHERE created_at < now() - INTERVAL '90 days';
  
  -- Keep only last 7 days of health checks
  DELETE FROM public.health_checks 
  WHERE created_at < now() - INTERVAL '7 days';
  
  -- Keep only last 180 days of session analytics
  DELETE FROM public.session_analytics 
  WHERE created_at < now() - INTERVAL '180 days';
END;
$$;

-- Create function to get system health summary
CREATE OR REPLACE FUNCTION public.get_system_health_summary()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  health_summary jsonb;
  recent_errors integer;
  avg_response_time decimal;
  last_health_status text;
BEGIN
  -- Get recent error count
  SELECT COUNT(*) INTO recent_errors
  FROM public.error_logs
  WHERE created_at > now() - INTERVAL '1 hour';
  
  -- Get average response time
  SELECT AVG(response_time_ms) INTO avg_response_time
  FROM public.health_checks
  WHERE created_at > now() - INTERVAL '1 hour';
  
  -- Get last health status
  SELECT status INTO last_health_status
  FROM public.health_checks
  ORDER BY created_at DESC
  LIMIT 1;
  
  health_summary := jsonb_build_object(
    'overall_status', COALESCE(last_health_status, 'unknown'),
    'recent_errors', COALESCE(recent_errors, 0),
    'average_response_time_ms', COALESCE(avg_response_time, 0),
    'timestamp', now()
  );
  
  RETURN health_summary;
END;
$$;

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_session_analytics_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_session_analytics_updated_at
    BEFORE UPDATE ON public.session_analytics
    FOR EACH ROW
    EXECUTE FUNCTION public.update_session_analytics_timestamp();