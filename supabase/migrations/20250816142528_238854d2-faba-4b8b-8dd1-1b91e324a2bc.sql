-- SECURITY FIXES - Phase 2: Fix remaining database function security issues
-- Add SET search_path to all remaining functions that don't have it

-- List of functions that need search_path set based on linter warnings
-- Fixing the most critical functions first

CREATE OR REPLACE FUNCTION public.get_primary_role(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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
  WHERE ur.user_id = p_user_id;  -- Use parameter name instead of column name
  
  -- Return default role if no roles found
  IF roles IS NULL OR array_length(roles, 1) IS NULL THEN
    RETURN 'patient';
  END IF;
  
  -- Determine primary role based on precedence
  IF 'admin' = ANY(roles) THEN
    primary_role := 'admin';
  ELSIF 'therapist' = ANY(roles) THEN
    primary_role := 'therapist';
  ELSIF 'patient' = ANY(roles) THEN
    primary_role := 'patient';
  ELSIF 'support' = ANY(roles) THEN
    primary_role := 'support';
  ELSE
    primary_role := 'patient'; -- Default
  END IF;
  
  RETURN primary_role;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_email(user_id uuid)
RETURNS TABLE(email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT u.email::text
  FROM auth.users u
  WHERE u.id = user_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_email_safe(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  v_email TEXT;
BEGIN
  SELECT email INTO v_email FROM auth.users WHERE id = user_id;
  RETURN v_email;
END;
$function$;

CREATE OR REPLACE FUNCTION public.has_role(user_id uuid, role_name app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = user_id AND r.name = role_name
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = $1 -- Use parameter reference instead of ambiguous column name
    AND r.name = 'admin'
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_admin_bypass_rls(check_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  is_admin_result boolean := false;
BEGIN
  -- Direct query without RLS by using security definer
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = check_user_id 
    AND r.name = 'admin'::app_role
  ) INTO is_admin_result;
  
  RETURN is_admin_result;
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$function$;

-- Fix more functions
CREATE OR REPLACE FUNCTION public.cleanup_old_performance_metrics()
RETURNS void
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  DELETE FROM public.performance_metrics 
  WHERE timestamp < (now() - interval '7 days');
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_email_for_admin(target_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  user_email text;
  requesting_user_id uuid;
BEGIN
  -- Get the requesting user's ID
  requesting_user_id := auth.uid();
  
  -- Check if the requesting user is an admin using our bypass function
  IF NOT public.is_admin_bypass_rls(requesting_user_id) THEN
    RETURN NULL; -- Don't return email for non-admins
  END IF;
  
  -- Get the email from auth.users
  SELECT email INTO user_email 
  FROM auth.users 
  WHERE id = target_user_id;
  
  RETURN user_email;
END;
$function$;