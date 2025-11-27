-- CRITICAL SECURITY FIXES - Phase 3: Final Security Hardening

-- 1. ADD RLS POLICIES TO REMAINING TABLES

-- APPOINTMENT_CONFLICTS - Add comprehensive policies
CREATE POLICY "users_can_view_conflicts_for_their_appointments" 
ON public.appointment_conflicts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM appointments a 
    WHERE a.id = appointment_conflicts.appointment_id 
    AND (a.therapist_id = auth.uid() OR a.patient_id = auth.uid())
  ) OR is_admin_bypass_rls(auth.uid())
);

CREATE POLICY "therapists_can_manage_appointment_conflicts" 
ON public.appointment_conflicts 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM appointments a 
    WHERE a.id = appointment_conflicts.appointment_id 
    AND a.therapist_id = auth.uid()
  ) OR is_admin_bypass_rls(auth.uid())
);

-- APPOINTMENT_REMINDERS - Add comprehensive policies
CREATE POLICY "users_can_view_reminders_for_their_appointments" 
ON public.appointment_reminders 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM appointments a 
    WHERE a.id = appointment_reminders.appointment_id 
    AND (a.therapist_id = auth.uid() OR a.patient_id = auth.uid())
  ) OR is_admin_bypass_rls(auth.uid())
);

CREATE POLICY "system_can_manage_appointment_reminders" 
ON public.appointment_reminders 
FOR ALL 
USING (is_admin_bypass_rls(auth.uid()));

-- 2. FIX FUNCTION SEARCH PATH SECURITY (Add SET search_path = 'public' to all functions missing it)

-- Fix functions that don't have SET search_path (identified by security linter)
CREATE OR REPLACE FUNCTION public.handle_new_notification_preferences()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_profile_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update profile with email from auth.users when profile is updated
  UPDATE profiles 
  SET email = (SELECT email FROM auth.users WHERE id = NEW.id)
  WHERE id = NEW.id AND email IS NULL;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_task_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    activity_type,
    resource_type,
    resource_id,
    metadata
  ) VALUES (
    auth.uid(),
    CASE
      WHEN TG_OP = 'INSERT' THEN 'task_created'
      WHEN TG_OP = 'UPDATE' THEN 'task_updated'
      WHEN TG_OP = 'DELETE' THEN 'task_deleted'
    END,
    'project_tasks',
    CASE
      WHEN TG_OP = 'DELETE' THEN OLD.id::text
      ELSE NEW.id::text
    END,
    CASE
      WHEN TG_OP = 'INSERT' THEN jsonb_build_object('title', NEW.title, 'status', NEW.status, 'priority', NEW.priority)
      WHEN TG_OP = 'UPDATE' THEN jsonb_build_object(
        'title', NEW.title, 
        'old_status', OLD.status, 
        'new_status', NEW.status,
        'old_priority', OLD.priority,
        'new_priority', NEW.priority
      )
      WHEN TG_OP = 'DELETE' THEN jsonb_build_object('title', OLD.title, 'status', OLD.status, 'priority', OLD.priority)
    END
  );
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_approval_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF OLD.approval_status IS DISTINCT FROM NEW.approval_status THEN
    INSERT INTO public.audit_logs (
      user_id,
      activity_type,
      resource_type,
      resource_id,
      metadata
    ) VALUES (
      (NULLIF(current_setting('app.current_user_id', true), ''))::uuid,
      'approval_status_change',
      'profiles',
      NEW.id,
      jsonb_build_object(
        'previous_status', OLD.approval_status,
        'new_status', NEW.approval_status,
        'admin_notes', NEW.admin_notes,
        'therapist_id', NEW.id,
        'therapist_name', NEW.full_name
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_response_time_metrics()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_response_time_minutes INTEGER;
BEGIN
  -- Calculate response time in minutes
  SELECT EXTRACT(EPOCH FROM (NEW.responded_at - OLD.created_at)) / 60
  INTO v_response_time_minutes;
  
  -- Update average response time for the day
  UPDATE therapist_analytics
  SET response_time_minutes = (
    CASE 
      WHEN response_time_minutes = 0 THEN v_response_time_minutes
      ELSE (response_time_minutes + v_response_time_minutes) / 2
    END
  ),
  updated_at = now()
  WHERE therapist_id = NEW.therapist_id 
  AND metric_date = DATE(NEW.responded_at);
  
  RETURN NEW;
END;
$$;

-- 3. ADD COMPREHENSIVE AUDIT LOGGING FOR SECURITY EVENTS
CREATE OR REPLACE FUNCTION public.log_security_event(
  user_id uuid, 
  event_type text, 
  resource_type text DEFAULT 'security_event',
  severity text DEFAULT 'medium',
  details jsonb DEFAULT '{}'
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    activity_type,
    resource_type,
    resource_id,
    metadata
  ) VALUES (
    user_id,
    event_type,
    resource_type,
    user_id::text,
    jsonb_build_object(
      'severity', severity,
      'timestamp', now(),
      'details', details,
      'ip_address', current_setting('request.headers', true)::jsonb->>'x-real-ip'
    )
  );
END;
$$;