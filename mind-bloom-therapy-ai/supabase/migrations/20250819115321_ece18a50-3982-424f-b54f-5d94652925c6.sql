-- Fix RLS policies for health_checks and performance_metrics tables

-- Update health_checks RLS policies for proper access
DROP POLICY IF EXISTS "Admins can view all health checks" ON public.health_checks;
DROP POLICY IF EXISTS "System can insert health checks" ON public.health_checks;
DROP POLICY IF EXISTS "System can update health checks" ON public.health_checks;

-- Allow authenticated users to view health status
CREATE POLICY "Authenticated users can view health status"
  ON public.health_checks
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow system to manage health checks
CREATE POLICY "System can manage health checks"
  ON public.health_checks
  FOR ALL
  USING (true);

-- Update performance_metrics RLS policies
DROP POLICY IF EXISTS "Admins can view all performance metrics" ON public.performance_metrics;

-- Create performance_metrics table if it doesn't exist with correct structure
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name text NOT NULL,
  count integer NOT NULL DEFAULT 0,
  average numeric NOT NULL DEFAULT 0,
  min numeric NOT NULL DEFAULT 0,
  max numeric NOT NULL DEFAULT 0,
  timestamp timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on performance_metrics
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view performance metrics
CREATE POLICY "Authenticated users can view performance metrics"
  ON public.performance_metrics
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow system to insert performance metrics
CREATE POLICY "System can insert performance metrics"
  ON public.performance_metrics
  FOR INSERT
  WITH CHECK (true);