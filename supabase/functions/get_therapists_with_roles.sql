
-- Function to get therapists with their roles and emails
CREATE OR REPLACE FUNCTION public.get_therapists_with_roles(user_ids uuid[])
RETURNS TABLE(
  id uuid,
  email text,
  roles text[],
  role_consistency boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    u.email,
    ARRAY(
      SELECT r.name::text
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = p.id
    ) as roles,
    CASE
      WHEN p.account_type = 'therapist' AND 
           EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id 
                  WHERE ur.user_id = p.id AND r.name = 'therapist'::app_role)
      THEN true
      ELSE false
    END as role_consistency
  FROM profiles p
  LEFT JOIN auth.users u ON p.id = u.id
  WHERE p.id = ANY(user_ids);
END;
$$;
