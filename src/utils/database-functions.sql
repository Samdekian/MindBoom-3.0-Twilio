
-- Enhanced database function with proper error handling and validation
-- This function returns jsonb with success/error information
CREATE OR REPLACE FUNCTION public.update_approval_status_as_admin(profile_id uuid, new_status text, admin_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  is_admin_result boolean := false;
  profile_exists boolean := false;
  old_status text;
  profile_name text;
  result jsonb;
BEGIN
  -- Input validation with detailed error messages
  IF profile_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Profile ID cannot be null');
  END IF;
  
  IF admin_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Admin user ID cannot be null');
  END IF;
  
  IF new_status IS NULL OR new_status = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'New status cannot be null or empty');
  END IF;
  
  -- Validate the new_status parameter
  IF new_status NOT IN ('pending', 'approved', 'rejected') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid approval status: ' || new_status || '. Must be pending, approved, or rejected');
  END IF;
  
  -- Verify admin permissions using the bypass RLS function
  SELECT is_admin_bypass_rls(admin_user_id) INTO is_admin_result;
  
  IF NOT is_admin_result THEN
    RETURN jsonb_build_object('success', false, 'error', 'Access denied: Only administrators can update approval status');
  END IF;
  
  -- Check if profile exists and get current status
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = profile_id), 
         approval_status, 
         full_name
  INTO profile_exists, old_status, profile_name
  FROM profiles 
  WHERE id = profile_id;
  
  IF NOT profile_exists THEN
    RETURN jsonb_build_object('success', false, 'error', 'Profile with ID ' || profile_id || ' not found');
  END IF;
  
  -- Start transaction for atomic update
  BEGIN
    -- Update the approval status (this bypasses RLS due to SECURITY DEFINER)
    UPDATE public.profiles
    SET 
      approval_status = new_status,
      updated_at = now()
    WHERE id = profile_id;
    
    -- Verify the update was successful
    IF NOT FOUND THEN
      RETURN jsonb_build_object('success', false, 'error', 'Failed to update approval status for profile ' || profile_id);
    END IF;
    
    -- Handle role assignment for approved therapists
    IF new_status = 'approved' AND old_status != 'approved' THEN
      -- Get therapist role ID
      DECLARE
        therapist_role_id uuid;
      BEGIN
        SELECT id INTO therapist_role_id FROM roles WHERE name = 'therapist';
        
        IF therapist_role_id IS NOT NULL THEN
          -- Check if role is already assigned
          IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = profile_id AND role_id = therapist_role_id) THEN
            INSERT INTO user_roles (user_id, role_id) VALUES (profile_id, therapist_role_id);
          END IF;
        END IF;
      EXCEPTION WHEN OTHERS THEN
        -- Log role assignment error but don't fail the main operation
        RAISE WARNING 'Failed to assign therapist role: %', SQLERRM;
      END;
    END IF;
    
    -- Log the successful update with proper error handling
    BEGIN
      INSERT INTO public.audit_logs (
        user_id,
        activity_type,
        resource_type,
        resource_id,
        metadata
      ) VALUES (
        admin_user_id,
        'approval_status_updated',
        'profiles',
        profile_id::text,
        jsonb_build_object(
          'old_status', old_status,
          'new_status', new_status,
          'profile_id', profile_id,
          'profile_name', profile_name,
          'admin_id', admin_user_id,
          'timestamp', now()
        )
      );
    EXCEPTION WHEN OTHERS THEN
      -- Log audit logging failure but don't fail the main operation
      RAISE WARNING 'Failed to create audit log for approval status update: %', SQLERRM;
    END;
    
    -- Build success result
    result := jsonb_build_object(
      'success', true,
      'message', 'Approval status updated successfully',
      'old_status', old_status,
      'new_status', new_status,
      'profile_id', profile_id,
      'profile_name', profile_name
    );
    
    RETURN result;
    
  EXCEPTION WHEN OTHERS THEN
    -- Roll back transaction and return error
    RAISE;
  END;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Return structured error response
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Database error: ' || SQLERRM,
      'profile_id', profile_id,
      'attempted_status', new_status
    );
END;
$$;

-- Cleanup function to fix inconsistent therapist data
CREATE OR REPLACE FUNCTION public.cleanup_therapist_inconsistencies()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  fixed_count integer := 0;
  therapist_record record;
  therapist_role_id uuid;
  result jsonb;
BEGIN
  -- Get therapist role ID
  SELECT id INTO therapist_role_id FROM roles WHERE name = 'therapist';
  
  IF therapist_role_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Therapist role not found');
  END IF;
  
  -- Fix therapists who have the role but wrong approval status
  FOR therapist_record IN 
    SELECT DISTINCT p.id, p.full_name, p.approval_status
    FROM profiles p
    JOIN user_roles ur ON p.id = ur.user_id
    WHERE ur.role_id = therapist_role_id
    AND p.account_type = 'therapist'
    AND p.approval_status = 'pending'
  LOOP
    -- Update to approved since they already have the role
    UPDATE profiles 
    SET approval_status = 'approved'
    WHERE id = therapist_record.id;
    
    fixed_count := fixed_count + 1;
    
    -- Log the fix
    INSERT INTO audit_logs (
      user_id,
      activity_type,
      resource_type,
      resource_id,
      metadata
    ) VALUES (
      therapist_record.id,
      'consistency_fix',
      'profiles',
      therapist_record.id::text,
      jsonb_build_object(
        'action', 'fixed_approval_status',
        'old_status', therapist_record.approval_status,
        'new_status', 'approved',
        'reason', 'had_therapist_role_but_pending_status'
      )
    );
  END LOOP;
  
  result := jsonb_build_object(
    'success', true,
    'fixed_count', fixed_count,
    'message', 'Fixed ' || fixed_count || ' inconsistent therapist records'
  );
  
  RETURN result;
END;
$$;
