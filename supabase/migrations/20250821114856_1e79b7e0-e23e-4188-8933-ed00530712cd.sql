-- Fix Security Definer View issue - simpler approach

-- Drop the problematic view that calls SECURITY DEFINER functions
DROP VIEW IF EXISTS public.user_roles_view;

-- Recreate views with security_barrier to prevent privilege escalation
-- This ensures views don't inherit elevated privileges from SECURITY DEFINER functions

-- Secure role_assignments_view
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

-- Secure role_audit_logs_view
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

-- Create a replacement for the removed user_roles_view that doesn't use SECURITY DEFINER functions
-- This view will only show public profile information without calling privileged functions
CREATE VIEW public.therapist_profiles_public_view
WITH (security_barrier = true)
AS
SELECT 
  p.id,
  p.full_name,
  p.approval_status,
  p.approval_request_date,
  p.account_type,
  p.created_at,
  p.updated_at,
  -- Don't include email here since it requires SECURITY DEFINER access
  NULL::text as email,
  -- Don't include admin_notes here since they're sensitive
  NULL::text as admin_notes
FROM profiles p
WHERE p.account_type = 'therapist'
ORDER BY p.approval_request_date DESC NULLS LAST;