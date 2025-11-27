-- Fix database function security by dropping and recreating functions with proper search_path settings
-- This addresses the 8 remaining security warnings from the linter

-- Drop existing functions first to avoid conflicts
DROP FUNCTION IF EXISTS public.get_primary_role(uuid);
DROP FUNCTION IF EXISTS public.get_user_email(uuid);  
DROP FUNCTION IF EXISTS public.get_user_email_safe(uuid);
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);
DROP FUNCTION IF EXISTS public.is_admin(uuid);
DROP FUNCTION IF EXISTS public.cleanup_old_performance_metrics();
DROP FUNCTION IF EXISTS public.get_user_email_for_admin(uuid);

-- Recreate get_primary_role function with proper security
CREATE OR REPLACE FUNCTION public.get_primary_role(p_user_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  roles text[];
  primary_role text;
BEGIN
  -- Get all roles for the user with explicit table alias and parameter reference
  SELECT array_agg(r.name::text)
  INTO roles
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = p_user_id;
  
  -- Return default role if no roles found
  IF roles IS NULL OR array_length(roles, 1) IS NULL THEN
    RETURN 'patient';
  END IF;
  
  -- Determine primary role based on precedence
  IF 'admin' = ANY(roles) THEN
    primary_role := 'admin';
  ELSIF 'therapist' = ANY(roles) THEN
    primary_role := 'therapist';
  ELSE
    primary_role := 'patient';
  END IF;
  
  RETURN primary_role;
END;
$function$;

-- Recreate get_user_email function with proper security
CREATE OR REPLACE FUNCTION public.get_user_email(p_user_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_email text;
BEGIN
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = p_user_id;
  
  RETURN user_email;
END;
$function$;

-- Recreate get_user_email_safe function with proper security
CREATE OR REPLACE FUNCTION public.get_user_email_safe(p_user_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_email text;
  requester_role text;
BEGIN
  -- Get the requester's role
  SELECT get_primary_role(auth.uid()) INTO requester_role;
  
  -- Only allow admins or the user themselves to get email
  IF auth.uid() = p_user_id OR requester_role = 'admin' THEN
    SELECT email INTO user_email
    FROM auth.users
    WHERE id = p_user_id;
    
    RETURN user_email;
  END IF;
  
  -- Return null for unauthorized access
  RETURN NULL;
END;
$function$;

-- Recreate has_role function with proper security
CREATE OR REPLACE FUNCTION public.has_role(p_user_id uuid, p_role app_role)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = p_user_id
    AND r.name = p_role
  );
END;
$function$;

-- Recreate is_admin function with proper security
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN has_role(p_user_id, 'admin');
END;
$function$;

-- Recreate cleanup_old_performance_metrics function with proper security
CREATE OR REPLACE FUNCTION public.cleanup_old_performance_metrics()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Delete performance metrics older than 90 days
  DELETE FROM performance_metrics 
  WHERE created_at < now() - interval '90 days';
  
  -- Delete session analytics older than 1 year
  DELETE FROM session_analytics 
  WHERE created_at < now() - interval '1 year';
  
  -- Log cleanup activity
  INSERT INTO audit_logs (
    user_id,
    activity_type,
    resource_type,
    resource_id,
    metadata
  ) VALUES (
    NULL,
    'system_cleanup',
    'performance_metrics',
    'cleanup_job',
    jsonb_build_object(
      'cleanup_type', 'old_metrics',
      'retention_days', 90
    )
  );
END;
$function$;

-- Recreate get_user_email_for_admin function with proper security
CREATE OR REPLACE FUNCTION public.get_user_email_for_admin(p_user_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_email text;
BEGIN
  -- Verify the requesting user is an admin
  IF NOT is_admin_bypass_rls(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  -- Get user email from auth.users
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = p_user_id;
  
  RETURN user_email;
END;
$function$;