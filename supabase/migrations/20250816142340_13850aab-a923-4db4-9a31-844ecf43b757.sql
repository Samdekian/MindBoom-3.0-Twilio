-- SECURITY FIXES - Phase 2: Database Function Security
-- Add SET search_path to all database functions for security

-- Fix functions that don't have proper search_path set
CREATE OR REPLACE FUNCTION public.assign_role_to_user(p_user_id uuid, p_role_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Check if the role is already assigned using explicit table aliases
  IF NOT EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = p_user_id AND ur.role_id = p_role_id
  ) THEN
    -- Assign role with explicit column names
    INSERT INTO user_roles (user_id, role_id)
    VALUES (p_user_id, p_role_id);
  END IF;
  
  -- Log the role assignment with explicit column references
  INSERT INTO audit_logs (
    user_id,
    activity_type,
    resource_type,
    resource_id,
    metadata
  ) VALUES (
    p_user_id,
    'role_assigned',
    'user_roles',
    p_user_id::text,
    jsonb_build_object(
      'role_id', p_role_id,
      'method', 'assign_role_api'
    )
  );
  
  -- Return success
  RETURN true;
END;
$function$;

-- Fix the text version of assign_role_to_user
CREATE OR REPLACE FUNCTION public.assign_role_to_user(p_user_id uuid, p_role_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Validate role_id is a valid UUID
  IF p_role_id IS NULL THEN
    RAISE EXCEPTION 'Role ID cannot be null';
    RETURN false;
  END IF;

  -- Check if the role is already assigned using explicit table aliases
  IF NOT EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = p_user_id AND ur.role_id = p_role_id::uuid
  ) THEN
    -- Assign role with explicit column references
    INSERT INTO user_roles (user_id, role_id)
    VALUES (p_user_id, p_role_id::uuid);
  END IF;
  
  -- Log the role assignment with explicit column references
  INSERT INTO audit_logs (
    user_id,
    activity_type,
    resource_type,
    resource_id,
    metadata
  ) VALUES (
    p_user_id,
    'role_assigned',
    'user_roles',
    p_user_id::text,
    jsonb_build_object(
      'role_id', p_role_id,
      'method', 'metadata_fixer'
    )
  );
  
  -- Return success
  RETURN true;
END;
$function$;

-- Add input validation function for sensitive operations
CREATE OR REPLACE FUNCTION public.validate_input_security(
  input_text TEXT,
  max_length INTEGER DEFAULT 1000,
  allow_html BOOLEAN DEFAULT FALSE
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Check for null or empty input
  IF input_text IS NULL OR length(trim(input_text)) = 0 THEN
    RETURN FALSE;
  END IF;
  
  -- Check length limits
  IF length(input_text) > max_length THEN
    RETURN FALSE;
  END IF;
  
  -- Check for potential XSS if HTML is not allowed
  IF NOT allow_html THEN
    IF input_text ~* '<[^>]*script[^>]*>' 
       OR input_text ~* 'javascript:'
       OR input_text ~* 'vbscript:'
       OR input_text ~* 'on\w+\s*='
       OR input_text ~* 'expression\s*\(' THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  -- Check for potential SQL injection patterns
  IF input_text ~* '(union\s+select|drop\s+table|delete\s+from|insert\s+into|update\s+\w+\s+set)'
     OR input_text ~* '(exec\s*\(|sp_|xp_|cast\s*\()'
     OR input_text ~* '(\b(or|and)\b\s*[''"]?\s*\d+\s*[''"]?\s*[=<>])' THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$function$;

-- Add function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  user_id UUID,
  event_type TEXT,
  severity TEXT DEFAULT 'medium',
  details JSONB DEFAULT '{}'::jsonb
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
    'security_event',
    user_id::text,
    jsonb_build_object(
      'severity', severity,
      'timestamp', now(),
      'details', details
    )
  );
END;
$function$;