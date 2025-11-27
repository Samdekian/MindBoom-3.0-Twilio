-- Create sync_user_roles function
CREATE OR REPLACE FUNCTION public.sync_user_roles(p_user_id UUID DEFAULT NULL)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_result JSON;
  v_synced_count INTEGER := 0;
BEGIN
  -- If no user_id provided, use authenticated user
  v_user_id := COALESCE(p_user_id, auth.uid());
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'No user ID provided and no authenticated user'
    );
  END IF;

  -- Ensure user has at least one role
  IF NOT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = v_user_id
  ) THEN
    -- Assign default 'patient' role
    INSERT INTO user_roles (user_id, role_id)
    SELECT v_user_id, id FROM roles WHERE name = 'patient'
    ON CONFLICT (user_id, role_id) DO NOTHING;
    
    v_synced_count := 1;
  END IF;

  -- Sync profile account_type with primary role
  UPDATE profiles
  SET account_type = (
    SELECT r.name::text
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = v_user_id
    ORDER BY 
      CASE r.name
        WHEN 'admin' THEN 1
        WHEN 'therapist' THEN 2
        WHEN 'patient' THEN 3
        ELSE 4
      END
    LIMIT 1
  )
  WHERE id = v_user_id;

  v_result := json_build_object(
    'success', true,
    'user_id', v_user_id,
    'synced_count', v_synced_count
  );

  RETURN v_result;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.sync_user_roles(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_user_roles(UUID) TO anon;

COMMENT ON FUNCTION public.sync_user_roles(UUID) IS 'Synchronizes user roles and ensures users have at least one role assigned';

