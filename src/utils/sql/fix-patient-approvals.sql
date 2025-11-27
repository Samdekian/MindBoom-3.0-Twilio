
-- NOTE: This file is for reference only. To fix existing patient approvals,
-- an administrator should run this script in the Supabase SQL editor

-- Options to run this safely:
-- 1. Create a temporary admin user if needed to run the update
-- 2. Use an admin token with the Supabase API

-- This function sets all patient accounts to 'approved' status
-- It requires admin privileges to run
CREATE OR REPLACE FUNCTION admin_fix_patient_approvals()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count integer;
BEGIN
  -- Update all patient profiles to have 'approved' status
  UPDATE profiles 
  SET approval_status = 'approved' 
  WHERE account_type = 'patient' AND approval_status = 'pending'
  RETURNING COUNT(*) INTO updated_count;
  
  RETURN 'Updated ' || updated_count || ' patient records to approved status';
END;
$$;

-- Execute the function as an administrator
SELECT admin_fix_patient_approvals();

-- Optional: Drop the function when done
-- DROP FUNCTION admin_fix_patient_approvals();
