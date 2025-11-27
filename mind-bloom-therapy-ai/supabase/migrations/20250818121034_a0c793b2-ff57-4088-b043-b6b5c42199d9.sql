-- CRITICAL SECURITY FIXES - Phase 2: Complete RLS and Function Security

-- 4. ADD MISSING RLS POLICIES FOR ALL REMAINING CRITICAL TABLES

-- TREATMENT_PLANS - Add comprehensive policies
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
  is_admin_bypass_rls(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM patient_assignments pa 
    WHERE pa.patient_id = treatment_plans.patient_id 
    AND pa.therapist_id = auth.uid() 
    AND pa.status = 'active'
  )
);

CREATE POLICY "patients_can_view_own_treatment_plans" 
ON public.treatment_plans 
FOR SELECT 
USING (auth.uid() = patient_id);

ALTER TABLE public.treatment_plans ENABLE ROW LEVEL SECURITY;

-- TREATMENT_GOALS - Add comprehensive policies
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
  auth.uid() = therapist_id OR 
  is_admin_bypass_rls(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM patient_assignments pa 
    WHERE pa.patient_id = treatment_goals.patient_id 
    AND pa.therapist_id = auth.uid() 
    AND pa.status = 'active'
  )
);

CREATE POLICY "patients_can_view_own_treatment_goals" 
ON public.treatment_goals 
FOR SELECT 
USING (auth.uid() = patient_id);

ALTER TABLE public.treatment_goals ENABLE ROW LEVEL SECURITY;

-- SESSION_RECORDINGS - Add strict access control
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
  auth.uid() = therapist_id OR 
  auth.uid() = patient_id OR
  is_admin_bypass_rls(auth.uid())
);

CREATE POLICY "therapists_can_manage_session_recordings" 
ON public.session_recordings 
FOR ALL 
USING (auth.uid() = therapist_id OR is_admin_bypass_rls(auth.uid()));

ALTER TABLE public.session_recordings ENABLE ROW LEVEL SECURITY;

-- SESSION_MATERIALS - Add access control
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
  EXISTS (
    SELECT 1 FROM appointments a 
    WHERE a.id = session_materials.appointment_id 
    AND a.therapist_id = auth.uid()
  ) OR is_admin_bypass_rls(auth.uid())
);

ALTER TABLE public.session_materials ENABLE ROW LEVEL SECURITY;

-- 5. FIX REMAINING DATABASE FUNCTION SECURITY
-- Add SET search_path = 'public' to functions that are missing it

CREATE OR REPLACE FUNCTION public.create_appointment_reminders(appointment_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  appointment_record RECORD;
  reminder_24h_time TIMESTAMP WITH TIME ZONE;
  reminder_1h_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get appointment details
  SELECT * INTO appointment_record
  FROM appointments
  WHERE id = appointment_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Appointment not found';
  END IF;
  
  -- Calculate reminder times
  reminder_24h_time := appointment_record.start_time - INTERVAL '24 hours';
  reminder_1h_time := appointment_record.start_time - INTERVAL '1 hour';
  
  -- Create 24-hour reminder
  INSERT INTO appointment_reminders (
    appointment_id,
    reminder_type,
    scheduled_for,
    content
  ) VALUES (
    appointment_id,
    '24_hour',
    reminder_24h_time,
    'Your appointment is scheduled for tomorrow at ' || 
    to_char(appointment_record.start_time, 'HH12:MI AM on Mon, DD Mon YYYY')
  );
  
  -- Create 1-hour reminder
  INSERT INTO appointment_reminders (
    appointment_id,
    reminder_type,
    scheduled_for,
    content
  ) VALUES (
    appointment_id,
    '1_hour',
    reminder_1h_time,
    'Your appointment starts in 1 hour at ' || 
    to_char(appointment_record.start_time, 'HH12:MI AM')
  );
END;
$$;

-- 6. CREATE SECURE DATA MASKING FUNCTION FOR SENSITIVE INFORMATION
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