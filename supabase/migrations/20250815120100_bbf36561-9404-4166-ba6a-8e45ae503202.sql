-- CRITICAL SECURITY FIXES - Phase 1: Data Protection
-- Fix public access vulnerabilities identified in security review

-- 1. SECURE PROFILES TABLE - Remove public read access
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Replace with restrictive RLS policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Therapists can view basic patient info for assigned patients" 
ON public.profiles 
FOR SELECT 
USING (
  account_type = 'patient' AND 
  EXISTS (
    SELECT 1 FROM patient_assignments pa 
    WHERE pa.patient_id = profiles.id 
    AND pa.therapist_id = auth.uid() 
    AND pa.status = 'active'
  )
);

CREATE POLICY "Patients can view basic therapist info for assigned therapists" 
ON public.profiles 
FOR SELECT 
USING (
  account_type = 'therapist' AND 
  approval_status = 'approved' AND
  EXISTS (
    SELECT 1 FROM patient_assignments pa 
    WHERE pa.therapist_id = profiles.id 
    AND pa.patient_id = auth.uid() 
    AND pa.status = 'active'
  )
);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR ALL 
USING (is_admin_bypass_rls(auth.uid()));

-- 2. SECURE SFU_ROOMS TABLE
ALTER TABLE public.sfu_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view rooms for their sessions" 
ON public.sfu_rooms 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM instant_session_participants isp 
    WHERE isp.session_id = sfu_rooms.session_id 
    AND isp.user_id = auth.uid()
  )
);

CREATE POLICY "Therapists can manage rooms for their sessions" 
ON public.sfu_rooms 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM instant_sessions ins 
    WHERE ins.id = sfu_rooms.session_id 
    AND ins.therapist_id = auth.uid()
  )
);

-- 3. SECURE THERAPIST_AVAILABILITY_SLOTS
ALTER TABLE public.therapist_availability_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Therapists can manage their own availability" 
ON public.therapist_availability_slots 
FOR ALL 
USING (auth.uid() = therapist_id);

CREATE POLICY "Patients can view available slots for booking" 
ON public.therapist_availability_slots 
FOR SELECT 
USING (is_available = true AND start_time > now());

CREATE POLICY "Admins can view all availability slots" 
ON public.therapist_availability_slots 
FOR ALL 
USING (is_admin_bypass_rls(auth.uid()));

-- 4. SECURE ROLE_SYNC_EVENTS - Admin only access
ALTER TABLE public.role_sync_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view role sync events" 
ON public.role_sync_events 
FOR ALL 
USING (is_admin_bypass_rls(auth.uid()));

-- 5. SECURE WORKLOAD_METRICS
ALTER TABLE public.workload_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Therapists can view their own workload metrics" 
ON public.workload_metrics 
FOR SELECT 
USING (auth.uid() = therapist_id);

CREATE POLICY "Admins can view all workload metrics" 
ON public.workload_metrics 
FOR ALL 
USING (is_admin_bypass_rls(auth.uid()));

-- 6. SECURE THERAPIST_ANALYTICS  
ALTER TABLE public.therapist_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Therapists can view their own analytics" 
ON public.therapist_analytics 
FOR ALL 
USING (auth.uid() = therapist_id);

CREATE POLICY "Admins can view all therapist analytics" 
ON public.therapist_analytics 
FOR ALL 
USING (is_admin_bypass_rls(auth.uid()));

-- 7. SECURE SESSION_NOTES
ALTER TABLE public.session_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Therapists can view notes for their sessions" 
ON public.session_notes 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM appointments a 
    WHERE a.id = session_notes.appointment_id 
    AND a.therapist_id = auth.uid()
  )
);

CREATE POLICY "Patients can view notes for their sessions" 
ON public.session_notes 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM appointments a 
    WHERE a.id = session_notes.appointment_id 
    AND a.patient_id = auth.uid()
  )
);

-- 8. SECURE SESSION_ANALYTICS
ALTER TABLE public.session_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view analytics for sessions they participated in" 
ON public.session_analytics 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM instant_session_participants isp 
    WHERE isp.session_id = session_analytics.session_id 
    AND isp.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all session analytics" 
ON public.session_analytics 
FOR ALL 
USING (is_admin_bypass_rls(auth.uid()));

-- 9. Create a secure public view for therapist directory
CREATE OR REPLACE VIEW public.therapist_directory AS
SELECT 
  id,
  full_name,
  account_type,
  approval_status,
  created_at
FROM public.profiles 
WHERE account_type = 'therapist' 
AND approval_status = 'approved' 
AND status = 'active';

-- Grant public access to the safe directory view
GRANT SELECT ON public.therapist_directory TO authenticated;