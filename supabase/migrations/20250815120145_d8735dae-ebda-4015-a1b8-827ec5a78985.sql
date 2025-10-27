-- SECURITY FIXES - Phase 1: Fix Critical Data Protection Issues
-- Handle existing policies gracefully and add missing security measures

-- 1. Fix profiles table - Drop the overly permissive public policy if it exists
DO $$ 
BEGIN
    -- Drop the dangerous public policy that allows everyone to see all profiles
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
    
    -- Create restrictive policies only if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Therapists can view basic patient info for assigned patients'
    ) THEN
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
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Patients can view basic therapist info for assigned therapists'
    ) THEN
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
    END IF;
END $$;

-- 2. SECURE SFU_ROOMS TABLE
ALTER TABLE public.sfu_rooms ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'sfu_rooms' AND policyname = 'Users can view rooms for their sessions'
    ) THEN
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
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'sfu_rooms' AND policyname = 'Therapists can manage rooms for their sessions'
    ) THEN
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
    END IF;
END $$;

-- 3. SECURE THERAPIST_AVAILABILITY_SLOTS
ALTER TABLE public.therapist_availability_slots ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'therapist_availability_slots' AND policyname = 'Therapists can manage their own availability'
    ) THEN
        CREATE POLICY "Therapists can manage their own availability" 
        ON public.therapist_availability_slots 
        FOR ALL 
        USING (auth.uid() = therapist_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'therapist_availability_slots' AND policyname = 'Patients can view available slots for booking'
    ) THEN
        CREATE POLICY "Patients can view available slots for booking" 
        ON public.therapist_availability_slots 
        FOR SELECT 
        USING (is_available = true AND start_time > now());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'therapist_availability_slots' AND policyname = 'Admins can view all availability slots'
    ) THEN
        CREATE POLICY "Admins can view all availability slots" 
        ON public.therapist_availability_slots 
        FOR ALL 
        USING (is_admin_bypass_rls(auth.uid()));
    END IF;
END $$;

-- 4. SECURE ROLE_SYNC_EVENTS - Admin only access
ALTER TABLE public.role_sync_events ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'role_sync_events' AND policyname = 'Only admins can view role sync events'
    ) THEN
        CREATE POLICY "Only admins can view role sync events" 
        ON public.role_sync_events 
        FOR ALL 
        USING (is_admin_bypass_rls(auth.uid()));
    END IF;
END $$;

-- 5. SECURE WORKLOAD_METRICS
ALTER TABLE public.workload_metrics ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'workload_metrics' AND policyname = 'Therapists can view their own workload metrics'
    ) THEN
        CREATE POLICY "Therapists can view their own workload metrics" 
        ON public.workload_metrics 
        FOR SELECT 
        USING (auth.uid() = therapist_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'workload_metrics' AND policyname = 'Admins can view all workload metrics'
    ) THEN
        CREATE POLICY "Admins can view all workload metrics" 
        ON public.workload_metrics 
        FOR ALL 
        USING (is_admin_bypass_rls(auth.uid()));
    END IF;
END $$;

-- 6. SECURE THERAPIST_ANALYTICS  
ALTER TABLE public.therapist_analytics ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'therapist_analytics' AND policyname = 'Therapists can view their own analytics'
    ) THEN
        CREATE POLICY "Therapists can view their own analytics" 
        ON public.therapist_analytics 
        FOR ALL 
        USING (auth.uid() = therapist_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'therapist_analytics' AND policyname = 'Admins can view all therapist analytics'
    ) THEN
        CREATE POLICY "Admins can view all therapist analytics" 
        ON public.therapist_analytics 
        FOR ALL 
        USING (is_admin_bypass_rls(auth.uid()));
    END IF;
END $$;

-- 7. Create a secure public view for therapist directory
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

-- Grant access to the safe directory view
GRANT SELECT ON public.therapist_directory TO authenticated;