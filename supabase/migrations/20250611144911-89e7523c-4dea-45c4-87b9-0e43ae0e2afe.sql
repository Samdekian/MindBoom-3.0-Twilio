
-- Fix the ambiguous column reference in the update_therapist_approval_simple function
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
  
  -- Update the profile in a single transaction with explicit column references
  UPDATE profiles 
  SET 
    approval_status = new_status,
    admin_notes = COALESCE(update_therapist_approval_simple.admin_notes, profiles.admin_notes),
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
