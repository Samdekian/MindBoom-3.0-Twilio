
-- Drop the complex existing function and create a simple one
DROP FUNCTION IF EXISTS public.update_approval_status_as_admin(uuid, text, uuid);
DROP FUNCTION IF EXISTS public.cleanup_therapist_inconsistencies();

-- Create a simple function that just updates the approval status
CREATE OR REPLACE FUNCTION public.update_therapist_approval_simple(
  therapist_id uuid,
  new_status text,
  admin_notes text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  therapist_role_id uuid;
BEGIN
  -- Validate status
  IF new_status NOT IN ('pending', 'approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid status: %. Must be pending, approved, or rejected', new_status;
  END IF;
  
  -- Update the profile in a single transaction
  UPDATE profiles 
  SET 
    approval_status = new_status,
    admin_notes = COALESCE(admin_notes, profiles.admin_notes),
    updated_at = now()
  WHERE id = therapist_id AND account_type = 'therapist';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Therapist with ID % not found', therapist_id;
  END IF;
  
  -- If approving, ensure they have the therapist role
  IF new_status = 'approved' THEN
    -- Get therapist role ID
    SELECT id INTO therapist_role_id FROM roles WHERE name = 'therapist';
    
    -- Add role if not already assigned
    INSERT INTO user_roles (user_id, role_id)
    VALUES (therapist_id, therapist_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
  END IF;
END;
$$;

-- Simplify RLS policies - remove all existing conflicting policies
DROP POLICY IF EXISTS "profile_select_policy" ON profiles;
DROP POLICY IF EXISTS "profile_update_policy" ON profiles;
DROP POLICY IF EXISTS "profile_insert_policy" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Create simple, clear RLS policies
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (
    auth.uid() = id OR is_admin_bypass_rls(auth.uid())
  );

CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE USING (
    auth.uid() = id OR is_admin_bypass_rls(auth.uid())
  );

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
