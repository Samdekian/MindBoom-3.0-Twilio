-- Add email and additional patient fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS insurance_provider TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_communication TEXT DEFAULT 'email';

-- Create a function to sync email from auth.users
CREATE OR REPLACE FUNCTION sync_profile_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update profile with email from auth.users when profile is updated
  UPDATE profiles 
  SET email = (SELECT email FROM auth.users WHERE id = NEW.id)
  WHERE id = NEW.id AND email IS NULL;
  
  RETURN NEW;
END;
$$;

-- Create trigger to sync email when profile is inserted/updated
DROP TRIGGER IF EXISTS sync_profile_email_trigger ON profiles;
CREATE TRIGGER sync_profile_email_trigger
  AFTER INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_profile_email();

-- Sync existing profiles with emails
UPDATE profiles 
SET email = u.email 
FROM auth.users u 
WHERE profiles.id = u.id AND profiles.email IS NULL;