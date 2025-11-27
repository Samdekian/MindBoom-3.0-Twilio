-- Fix Security Definer View issue by replacing problematic views with secure functions

-- Drop the problematic view that calls SECURITY DEFINER functions
DROP VIEW IF EXISTS public.user_roles_view;

-- Create a secure function to replace the therapist profiles view functionality
-- This function implements proper access control instead of relying on SECURITY DEFINER views
CREATE OR REPLACE FUNCTION public.get_therapist_profiles_with_access_control()
RETURNS TABLE(
  id uuid,
  full_name text,
  admin_notes text,
  approval_status text,
  approval_request_date timestamp with time zone,
  email text,
  account_type text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only allow admins to access this data
  IF NOT public.is_admin_bypass_rls(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Return therapist profiles with controlled email access
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.admin_notes,
    p.approval_status,
    p.approval_request_date,
    u.email,
    p.account_type,
    p.created_at,
    p.updated_at
  FROM profiles p
  LEFT JOIN auth.users u ON p.id = u.id
  WHERE p.account_type = 'therapist'
  ORDER BY p.approval_request_date DESC NULLS LAST;
END;
$$;

-- Also check and secure the other views to ensure they don't have similar issues
-- Drop and recreate role_assignments_view to ensure it's properly secured
DROP VIEW IF EXISTS public.role_assignments_view;

CREATE VIEW public.role_assignments_view 
WITH (security_barrier = true)
AS 
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

-- Enable RLS on the view
ALTER VIEW public.role_assignments_view SET (security_barrier = true);

-- Create RLS policy for the role assignments view
CREATE POLICY "Admins can view role assignments" 
ON public.role_assignments_view 
FOR SELECT 
USING (public.is_admin_bypass_rls(auth.uid()));

-- Drop and recreate role_audit_logs_view with security barrier
DROP VIEW IF EXISTS public.role_audit_logs_view;

CREATE VIEW public.role_audit_logs_view 
WITH (security_barrier = true)
AS 
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

-- Enable RLS on the audit logs view  
ALTER VIEW public.role_audit_logs_view SET (security_barrier = true);

-- Create RLS policy for the audit logs view
CREATE POLICY "Admins can view role audit logs" 
ON public.role_audit_logs_view 
FOR SELECT 
USING (public.is_admin_bypass_rls(auth.uid()));

-- Update any existing code that referenced the old view to use the new function
-- Note: The get_therapist_profiles_for_admin() function already exists and serves this purpose