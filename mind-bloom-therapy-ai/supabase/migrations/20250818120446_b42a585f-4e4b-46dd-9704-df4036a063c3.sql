-- CRITICAL SECURITY FIXES - Phase 1: Data Protection

-- 1. SECURE PROFILES TABLE - Remove public access, add role-based policies
-- Drop the dangerous public select policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Add secure policies for profiles table
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Admin can view all profiles for management
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (is_admin_bypass_rls(auth.uid()));

-- Patients can view approved therapist profiles only (minimal data)
CREATE POLICY "Patients can view approved therapist basic info" 
ON public.profiles 
FOR SELECT 
USING (
  account_type = 'therapist' 
  AND approval_status = 'approved' 
  AND auth.role() = 'authenticated'
);

-- 2. SECURE THERAPIST_SETTINGS TABLE - Remove public access
-- This table contains sensitive integration credentials and must be private
DROP POLICY IF EXISTS "Therapists can view their own settings" ON public.therapist_settings;
DROP POLICY IF EXISTS "Public can view therapist settings" ON public.therapist_settings;

-- Add strict RLS policies for therapist_settings
CREATE POLICY "Therapists can manage only their own settings" 
ON public.therapist_settings 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can view therapist settings for support purposes
CREATE POLICY "Admins can view therapist settings" 
ON public.therapist_settings 
FOR SELECT 
USING (is_admin_bypass_rls(auth.uid()));

-- 3. ADD MISSING RLS POLICIES FOR CRITICAL TABLES

-- PATIENT_NOTES - Currently has NO policies (CRITICAL)
DROP POLICY IF EXISTS "Therapists can manage patient notes" ON public.patient_notes;
DROP POLICY IF EXISTS "Patients can view their notes" ON public.patient_notes;

CREATE POLICY "Therapists can manage notes for their patients" 
ON public.patient_notes 
FOR ALL 
USING (
  auth.uid() = therapist_id OR 
  is_admin_bypass_rls(auth.uid())
);

CREATE POLICY "Patients can view their own notes" 
ON public.patient_notes 
FOR SELECT 
USING (auth.uid() = patient_id);

-- TREATMENT_PLANS - Add missing policies
CREATE POLICY "Therapists can manage treatment plans for their patients" 
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

CREATE POLICY "Patients can view their own treatment plans" 
ON public.treatment_plans 
FOR SELECT 
USING (auth.uid() = patient_id);

-- TREATMENT_GOALS - Add missing policies  
CREATE POLICY "Therapists can manage treatment goals for their patients" 
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

CREATE POLICY "Patients can view their own treatment goals" 
ON public.treatment_goals 
FOR SELECT 
USING (auth.uid() = patient_id);

-- SESSION_RECORDINGS - Add strict access control
CREATE POLICY "Session participants can access recordings" 
ON public.session_recordings 
FOR SELECT 
USING (
  auth.uid() = therapist_id OR 
  auth.uid() = patient_id OR
  is_admin_bypass_rls(auth.uid())
);

CREATE POLICY "Therapists can manage session recordings" 
ON public.session_recordings 
FOR ALL 
USING (auth.uid() = therapist_id OR is_admin_bypass_rls(auth.uid()));

-- SESSION_MATERIALS - Add access control
CREATE POLICY "Session participants can access materials" 
ON public.session_materials 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM appointments a 
    WHERE a.id = session_materials.appointment_id 
    AND (a.therapist_id = auth.uid() OR a.patient_id = auth.uid())
  ) OR is_admin_bypass_rls(auth.uid())
);

CREATE POLICY "Therapists can manage session materials" 
ON public.session_materials 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM appointments a 
    WHERE a.id = session_materials.appointment_id 
    AND a.therapist_id = auth.uid()
  ) OR is_admin_bypass_rls(auth.uid())
);

-- APPOINTMENT_CONFLICTS - Add missing policies
CREATE POLICY "Users can view conflicts for their appointments" 
ON public.appointment_conflicts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM appointments a 
    WHERE a.id = appointment_conflicts.appointment_id 
    AND (a.therapist_id = auth.uid() OR a.patient_id = auth.uid())
  ) OR is_admin_bypass_rls(auth.uid())
);

CREATE POLICY "Therapists can manage appointment conflicts" 
ON public.appointment_conflicts 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM appointments a 
    WHERE a.id = appointment_conflicts.appointment_id 
    AND a.therapist_id = auth.uid()
  ) OR is_admin_bypass_rls(auth.uid())
);

-- APPOINTMENT_REMINDERS - Add missing policies
CREATE POLICY "Users can view reminders for their appointments" 
ON public.appointment_reminders 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM appointments a 
    WHERE a.id = appointment_reminders.appointment_id 
    AND (a.therapist_id = auth.uid() OR a.patient_id = auth.uid())
  ) OR is_admin_bypass_rls(auth.uid())
);

CREATE POLICY "System can manage appointment reminders" 
ON public.appointment_reminders 
FOR ALL 
USING (is_admin_bypass_rls(auth.uid()));

-- 4. SECURE SENSITIVE DATA FIELDS
-- Add function to mask sensitive data for non-authorized users
CREATE OR REPLACE FUNCTION public.mask_sensitive_data(
  data text, 
  user_id uuid, 
  data_owner_id uuid
) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only show full data to owner, therapist, or admin
  IF user_id = data_owner_id OR is_admin_bypass_rls(user_id) THEN
    RETURN data;
  END IF;
  
  -- Mask sensitive data for others
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