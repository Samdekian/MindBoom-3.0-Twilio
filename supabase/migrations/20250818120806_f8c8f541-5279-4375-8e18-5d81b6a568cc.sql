-- CRITICAL SECURITY FIXES - Phase 1: Data Protection (Fixed)

-- 1. SECURE PROFILES TABLE - Remove ALL existing policies first, then add secure ones
DO $$
DECLARE
    pol_record RECORD;
BEGIN
    -- Drop all existing policies on profiles table
    FOR pol_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol_record.policyname);
    END LOOP;
END
$$;

-- Add secure policies for profiles table
CREATE POLICY "users_can_view_own_profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "users_can_update_own_profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Admin can view all profiles for management
CREATE POLICY "admins_can_view_all_profiles" 
ON public.profiles 
FOR SELECT 
USING (is_admin_bypass_rls(auth.uid()));

-- Patients can view approved therapist profiles only (minimal data)
CREATE POLICY "patients_can_view_approved_therapists" 
ON public.profiles 
FOR SELECT 
USING (
  account_type = 'therapist' 
  AND approval_status = 'approved' 
  AND auth.role() = 'authenticated'
);

-- 2. SECURE THERAPIST_SETTINGS TABLE - Remove ALL existing policies first
DO $$
DECLARE
    pol_record RECORD;
BEGIN
    -- Drop all existing policies on therapist_settings table
    FOR pol_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'therapist_settings' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.therapist_settings', pol_record.policyname);
    END LOOP;
END
$$;

-- Add strict RLS policies for therapist_settings (sensitive credentials)
CREATE POLICY "therapists_can_manage_own_settings" 
ON public.therapist_settings 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can view therapist settings for support purposes
CREATE POLICY "admins_can_view_therapist_settings" 
ON public.therapist_settings 
FOR SELECT 
USING (is_admin_bypass_rls(auth.uid()));

-- 3. ADD MISSING RLS POLICIES FOR CRITICAL TABLES

-- PATIENT_NOTES - Currently has NO policies (CRITICAL)
DO $$
DECLARE
    pol_record RECORD;
BEGIN
    FOR pol_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'patient_notes' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.patient_notes', pol_record.policyname);
    END LOOP;
END
$$;

CREATE POLICY "therapists_can_manage_patient_notes" 
ON public.patient_notes 
FOR ALL 
USING (
  auth.uid() = therapist_id OR 
  is_admin_bypass_rls(auth.uid())
);

CREATE POLICY "patients_can_view_own_notes" 
ON public.patient_notes 
FOR SELECT 
USING (auth.uid() = patient_id);

-- Enable RLS on patient_notes if not already enabled
ALTER TABLE public.patient_notes ENABLE ROW LEVEL SECURITY;