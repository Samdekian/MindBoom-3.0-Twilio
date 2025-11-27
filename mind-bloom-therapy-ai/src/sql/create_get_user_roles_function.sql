
-- This function bypasses RLS to safely get user roles
-- It needs to be run by a database admin in the Supabase SQL editor
CREATE OR REPLACE FUNCTION public.get_user_roles(user_id UUID)
RETURNS TABLE(role_name text)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.name::text as role_name
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = user_id;
$$;
