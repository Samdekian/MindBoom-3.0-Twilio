-- Completely eliminate security definer view issues by replacing all views with secure functions

-- Drop all existing views
DROP VIEW IF EXISTS public.role_assignments_view CASCADE;
DROP VIEW IF EXISTS public.role_audit_logs_view CASCADE;
DROP VIEW IF EXISTS public.therapist_profiles_public_view CASCADE;

-- Replace role_assignments_view with a secure function
CREATE OR REPLACE FUNCTION public.get_role_assignments()
RETURNS TABLE(
  assignment_id uuid,
  user_id uuid,
  role_id uuid,
  role_name text,
  assigned_at timestamp with time zone,
  updated_at timestamp with time zone,
  full_name text,
  role_description text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only allow admins to view role assignments
  IF NOT public.is_admin_bypass_rls(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT 
    ur.id AS assignment_id,
    ur.user_id,
    ur.role_id,
    r.name AS role_name,
    ur.created_at AS assigned_at,
    ur.updated_at,
    p.full_name,
    r.description AS role_description
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  JOIN profiles p ON ur.user_id = p.id;
END;
$$;

-- Replace role_audit_logs_view with a secure function
CREATE OR REPLACE FUNCTION public.get_role_audit_logs()
RETURNS TABLE(
  id uuid,
  user_id uuid,
  activity_timestamp timestamp with time zone,
  metadata jsonb,
  activity_type text,
  resource_id text,
  full_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only allow admins to view audit logs
  IF NOT public.is_admin_bypass_rls(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT 
    al.id,
    al.user_id,
    al.activity_timestamp,
    al.metadata,
    al.activity_type,
    al.resource_id,
    p.full_name
  FROM audit_logs al
  JOIN profiles p ON al.user_id = p.id
  WHERE al.resource_type = 'user_roles' OR al.activity_type LIKE 'role%';
END;
$$;

-- Replace therapist_profiles_public_view with a secure function
CREATE OR REPLACE FUNCTION public.get_therapist_profiles_public()
RETURNS TABLE(
  id uuid,
  full_name text,
  approval_status text,
  approval_request_date timestamp with time zone,
  account_type text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- This function provides public therapist information without sensitive data
  -- No special privileges required for basic therapist listings
  
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.approval_status,
    p.approval_request_date,
    p.account_type,
    p.created_at,
    p.updated_at
  FROM profiles p
  WHERE p.account_type = 'therapist'
  AND p.approval_status = 'approved'  -- Only show approved therapists publicly
  ORDER BY p.approval_request_date DESC NULLS LAST;
END;
$$;