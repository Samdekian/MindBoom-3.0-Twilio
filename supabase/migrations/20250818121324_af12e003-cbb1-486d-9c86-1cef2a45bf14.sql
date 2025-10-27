-- CRITICAL SECURITY FIXES - Phase 2: Complete RLS (Fixed Column References)

-- 4. ADD MISSING RLS POLICIES FOR ALL REMAINING CRITICAL TABLES

-- TREATMENT_PLANS - Add comprehensive policies (has patient_id, therapist_id)
DO $$
DECLARE
    pol_record RECORD;
BEGIN
    FOR pol_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'treatment_plans' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.treatment_plans', pol_record.policyname);
    END LOOP;
END
$$;

CREATE POLICY "therapists_can_manage_treatment_plans" 
ON public.treatment_plans 
FOR ALL 
USING (
  auth.uid() = therapist_id OR 
  is_admin_bypass_rls(auth.uid())
);

CREATE POLICY "patients_can_view_own_treatment_plans" 
ON public.treatment_plans 
FOR SELECT 
USING (auth.uid() = patient_id);

ALTER TABLE public.treatment_plans ENABLE ROW LEVEL SECURITY;

-- TREATMENT_GOALS - Add comprehensive policies (has treatment_plan_id)
DO $$
DECLARE
    pol_record RECORD;
BEGIN
    FOR pol_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'treatment_goals' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.treatment_goals', pol_record.policyname);
    END LOOP;
END
$$;

CREATE POLICY "therapists_can_manage_treatment_goals" 
ON public.treatment_goals 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM treatment_plans tp 
    WHERE tp.id = treatment_goals.treatment_plan_id 
    AND tp.therapist_id = auth.uid()
  ) OR is_admin_bypass_rls(auth.uid())
);

CREATE POLICY "patients_can_view_own_treatment_goals" 
ON public.treatment_goals 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM treatment_plans tp 
    WHERE tp.id = treatment_goals.treatment_plan_id 
    AND tp.patient_id = auth.uid()
  )
);

ALTER TABLE public.treatment_goals ENABLE ROW LEVEL SECURITY;

-- SESSION_RECORDINGS - Add strict access control (has appointment_id)
DO $$
DECLARE
    pol_record RECORD;
BEGIN
    FOR pol_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'session_recordings' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.session_recordings', pol_record.policyname);
    END LOOP;
END
$$;

CREATE POLICY "session_participants_can_access_recordings" 
ON public.session_recordings 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM appointments a 
    WHERE a.id = session_recordings.appointment_id 
    AND (a.therapist_id = auth.uid() OR a.patient_id = auth.uid())
  ) OR is_admin_bypass_rls(auth.uid())
);

CREATE POLICY "therapists_can_manage_session_recordings" 
ON public.session_recordings 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM appointments a 
    WHERE a.id = session_recordings.appointment_id 
    AND a.therapist_id = auth.uid()
  ) OR is_admin_bypass_rls(auth.uid())
);

ALTER TABLE public.session_recordings ENABLE ROW LEVEL SECURITY;

-- SESSION_MATERIALS - Add access control (has appointment_id, therapist_id)
DO $$
DECLARE
    pol_record RECORD;
BEGIN
    FOR pol_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'session_materials' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.session_materials', pol_record.policyname);
    END LOOP;
END
$$;

CREATE POLICY "session_participants_can_access_materials" 
ON public.session_materials 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM appointments a 
    WHERE a.id = session_materials.appointment_id 
    AND (a.therapist_id = auth.uid() OR a.patient_id = auth.uid())
  ) OR is_admin_bypass_rls(auth.uid())
);

CREATE POLICY "therapists_can_manage_session_materials" 
ON public.session_materials 
FOR ALL 
USING (
  auth.uid() = therapist_id OR is_admin_bypass_rls(auth.uid())
);

ALTER TABLE public.session_materials ENABLE ROW LEVEL SECURITY;

-- 5. CREATE SECURE DATA MASKING FUNCTION FOR SENSITIVE INFORMATION
CREATE OR REPLACE FUNCTION public.mask_sensitive_data(
  data text, 
  requesting_user_id uuid, 
  data_owner_id uuid
) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only show full data to owner, assigned therapist, or admin
  IF requesting_user_id = data_owner_id OR is_admin_bypass_rls(requesting_user_id) THEN
    RETURN data;
  END IF;
  
  -- Check if requesting user is assigned therapist
  IF EXISTS (
    SELECT 1 FROM patient_assignments pa 
    WHERE pa.patient_id = data_owner_id 
    AND pa.therapist_id = requesting_user_id 
    AND pa.status = 'active'
  ) THEN
    RETURN data;
  END IF;
  
  -- Mask sensitive data for unauthorized users
  IF data IS NULL OR length(data) = 0 THEN
    RETURN data;
  END IF;
  
  -- Mask phone numbers, emails, etc.
  IF data ~ '^[0-9\-\+\(\)\s]+$' THEN -- Phone pattern
    RETURN regexp_replace(data, '.', '*', 'g');
  ELSIF data ~ '@' THEN -- Email pattern  
    RETURN regexp_replace(data, '^(.{2}).*(@.*)$', '\1***\2');
  ELSE
    RETURN left(data, 2) || repeat('*', greatest(0, length(data) - 2));
  END IF;
END;
$$;