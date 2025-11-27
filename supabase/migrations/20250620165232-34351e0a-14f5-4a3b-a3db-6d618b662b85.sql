
-- Create caseload configuration table to store therapist limits and settings
CREATE TABLE public.caseload_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  therapist_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  max_active_patients INTEGER NOT NULL DEFAULT 30,
  max_weekly_sessions INTEGER NOT NULL DEFAULT 40,
  preferred_patient_types TEXT[] DEFAULT '{}',
  workload_status TEXT NOT NULL DEFAULT 'available' CHECK (workload_status IN ('available', 'at_capacity', 'overloaded', 'unavailable')),
  auto_assignment_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(therapist_id)
);

-- Create patient assignments table to track patient-therapist relationships
CREATE TABLE public.patient_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  therapist_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assigned_by UUID REFERENCES auth.users(id) NOT NULL,
  assignment_reason TEXT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'transferred', 'discharged', 'on_hold')),
  priority_level TEXT NOT NULL DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workload tracking table for monitoring therapist capacity
CREATE TABLE public.workload_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  therapist_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  active_patients_count INTEGER NOT NULL DEFAULT 0,
  weekly_sessions_count INTEGER NOT NULL DEFAULT 0,
  pending_assignments_count INTEGER NOT NULL DEFAULT 0,
  utilization_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(therapist_id, metric_date)
);

-- Enable RLS on all tables
ALTER TABLE public.caseload_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workload_metrics ENABLE ROW LEVEL SECURITY;

-- RLS policies for caseload_configurations
CREATE POLICY "Therapists can view their own caseload config" ON public.caseload_configurations
  FOR SELECT USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can update their own caseload config" ON public.caseload_configurations
  FOR UPDATE USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can insert their own caseload config" ON public.caseload_configurations
  FOR INSERT WITH CHECK (auth.uid() = therapist_id);

CREATE POLICY "Admins can view all caseload configs" ON public.caseload_configurations
  FOR ALL USING (public.is_admin_bypass_rls(auth.uid()));

-- RLS policies for patient_assignments
CREATE POLICY "Therapists can view their assignments" ON public.patient_assignments
  FOR SELECT USING (auth.uid() = therapist_id OR auth.uid() = patient_id);

CREATE POLICY "Admins can manage all assignments" ON public.patient_assignments
  FOR ALL USING (public.is_admin_bypass_rls(auth.uid()));

CREATE POLICY "Therapists can view assignments they made" ON public.patient_assignments
  FOR SELECT USING (auth.uid() = assigned_by);

-- RLS policies for workload_metrics
CREATE POLICY "Therapists can view their own metrics" ON public.workload_metrics
  FOR SELECT USING (auth.uid() = therapist_id);

CREATE POLICY "Admins can view all metrics" ON public.workload_metrics
  FOR ALL USING (public.is_admin_bypass_rls(auth.uid()));

-- Function to calculate workload metrics
CREATE OR REPLACE FUNCTION public.calculate_therapist_workload(p_therapist_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_active_patients INTEGER;
  v_weekly_sessions INTEGER;
  v_pending_assignments INTEGER;
  v_max_patients INTEGER;
  v_max_sessions INTEGER;
  v_utilization DECIMAL(5,2);
  v_result JSONB;
BEGIN
  -- Get configuration limits
  SELECT max_active_patients, max_weekly_sessions
  INTO v_max_patients, v_max_sessions
  FROM caseload_configurations
  WHERE therapist_id = p_therapist_id;
  
  -- Use defaults if no configuration exists
  v_max_patients := COALESCE(v_max_patients, 30);
  v_max_sessions := COALESCE(v_max_sessions, 40);
  
  -- Count active patients
  SELECT COUNT(*)
  INTO v_active_patients
  FROM patient_assignments
  WHERE therapist_id = p_therapist_id
  AND status = 'active'
  AND (end_date IS NULL OR end_date >= p_date);
  
  -- Count weekly sessions (current week)
  SELECT COUNT(*)
  INTO v_weekly_sessions
  FROM appointments
  WHERE therapist_id = p_therapist_id
  AND DATE(start_time) BETWEEN 
    (p_date - EXTRACT(DOW FROM p_date)::INTEGER) AND 
    (p_date - EXTRACT(DOW FROM p_date)::INTEGER + 6)
  AND status IN ('scheduled', 'confirmed', 'completed');
  
  -- Count pending assignments
  SELECT COUNT(*)
  INTO v_pending_assignments
  FROM patient_assignments
  WHERE therapist_id = p_therapist_id
  AND status = 'active'
  AND start_date > p_date;
  
  -- Calculate utilization percentage (based on patient capacity)
  v_utilization := (v_active_patients::DECIMAL / v_max_patients::DECIMAL) * 100;
  
  -- Build result
  v_result := jsonb_build_object(
    'active_patients', v_active_patients,
    'max_patients', v_max_patients,
    'weekly_sessions', v_weekly_sessions,
    'max_sessions', v_max_sessions,
    'pending_assignments', v_pending_assignments,
    'utilization_percentage', v_utilization,
    'workload_status', 
      CASE 
        WHEN v_utilization >= 100 THEN 'overloaded'
        WHEN v_utilization >= 90 THEN 'at_capacity'
        WHEN v_utilization >= 70 THEN 'high'
        ELSE 'available'
      END
  );
  
  -- Update metrics table
  INSERT INTO workload_metrics (
    therapist_id,
    metric_date,
    active_patients_count,
    weekly_sessions_count,
    pending_assignments_count,
    utilization_percentage
  ) VALUES (
    p_therapist_id,
    p_date,
    v_active_patients,
    v_weekly_sessions,
    v_pending_assignments,
    v_utilization
  )
  ON CONFLICT (therapist_id, metric_date)
  DO UPDATE SET
    active_patients_count = EXCLUDED.active_patients_count,
    weekly_sessions_count = EXCLUDED.weekly_sessions_count,
    pending_assignments_count = EXCLUDED.pending_assignments_count,
    utilization_percentage = EXCLUDED.utilization_percentage,
    created_at = now();
  
  RETURN v_result;
END;
$$;

-- Function to suggest optimal therapist assignment
CREATE OR REPLACE FUNCTION public.suggest_therapist_assignment(p_patient_id UUID, p_preferred_specialization TEXT DEFAULT NULL)
RETURNS TABLE(
  therapist_id UUID,
  therapist_name TEXT,
  current_utilization DECIMAL(5,2),
  available_capacity INTEGER,
  specialization_match BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as therapist_id,
    p.full_name as therapist_name,
    COALESCE(wm.utilization_percentage, 0) as current_utilization,
    (COALESCE(cc.max_active_patients, 30) - COALESCE(wm.active_patients_count, 0)) as available_capacity,
    (p_preferred_specialization IS NULL OR p_preferred_specialization = ANY(cc.preferred_patient_types)) as specialization_match
  FROM profiles p
  JOIN user_roles ur ON p.id = ur.user_id
  JOIN roles r ON ur.role_id = r.id
  LEFT JOIN caseload_configurations cc ON p.id = cc.therapist_id
  LEFT JOIN workload_metrics wm ON p.id = wm.therapist_id AND wm.metric_date = CURRENT_DATE
  WHERE r.name = 'therapist'
  AND p.approval_status = 'approved'
  AND p.status = 'active'
  AND (cc.workload_status IS NULL OR cc.workload_status IN ('available', 'high'))
  AND (cc.auto_assignment_enabled IS NULL OR cc.auto_assignment_enabled = true)
  AND (COALESCE(cc.max_active_patients, 30) - COALESCE(wm.active_patients_count, 0)) > 0
  ORDER BY 
    specialization_match DESC,
    current_utilization ASC,
    available_capacity DESC;
END;
$$;

-- Trigger to update workload metrics when assignments change
CREATE OR REPLACE FUNCTION public.update_workload_metrics_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update metrics for affected therapist(s)
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM calculate_therapist_workload(NEW.therapist_id);
    
    -- If therapist changed in UPDATE, update old therapist too
    IF TG_OP = 'UPDATE' AND OLD.therapist_id != NEW.therapist_id THEN
      PERFORM calculate_therapist_workload(OLD.therapist_id);
    END IF;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM calculate_therapist_workload(OLD.therapist_id);
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Create trigger
CREATE TRIGGER update_workload_metrics_on_assignment_change
  AFTER INSERT OR UPDATE OR DELETE ON public.patient_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_workload_metrics_trigger();

-- Add updated_at triggers
CREATE TRIGGER update_caseload_configurations_updated_at
  BEFORE UPDATE ON public.caseload_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_assignments_updated_at
  BEFORE UPDATE ON public.patient_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
