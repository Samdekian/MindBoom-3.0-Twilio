
-- Phase 1: Create secure RPC function to replace therapist_profiles_admin view
CREATE OR REPLACE FUNCTION public.get_therapist_profiles_for_admin()
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
  -- Verify the requesting user is an admin
  IF NOT public.is_admin_bypass_rls(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Return therapist profiles with emails (same structure as the view)
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.admin_notes,
    p.approval_status,
    p.approval_request_date,
    public.get_user_email_safe(p.id) as email,
    p.account_type,
    p.created_at,
    p.updated_at
  FROM profiles p
  WHERE p.account_type = 'therapist'
  ORDER BY p.approval_request_date DESC NULLS LAST;
END;
$$;

-- Phase 2: Enable RLS on permissions table
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for permissions table
CREATE POLICY "Admins can manage all permissions"
  ON public.permissions
  FOR ALL
  TO authenticated
  USING (public.is_admin_bypass_rls(auth.uid()));

CREATE POLICY "Users can view permissions"
  ON public.permissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Phase 3: Enable RLS on role_permissions table
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for role_permissions table
CREATE POLICY "Admins can manage all role permissions"
  ON public.role_permissions
  FOR ALL
  TO authenticated
  USING (public.is_admin_bypass_rls(auth.uid()));

CREATE POLICY "Users can view role permissions for their roles"
  ON public.role_permissions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() 
      AND ur.role_id = role_permissions.role_id
    )
  );

-- Phase 4: Drop the insecure view (will be replaced by RPC function)
DROP VIEW IF EXISTS public.therapist_profiles_admin;

-- Grant execute permission on the new function to authenticated users
GRANT EXECUTE ON FUNCTION public.get_therapist_profiles_for_admin() TO authenticated;
