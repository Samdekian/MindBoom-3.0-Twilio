
-- Add user status management
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned', 'pending'));

-- Add user invitation system
CREATE TABLE IF NOT EXISTS user_invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  invited_by uuid REFERENCES auth.users(id),
  invitation_token text NOT NULL UNIQUE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days'),
  role_to_assign text DEFAULT 'patient',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  accepted_at timestamp with time zone
);

-- Enable RLS on user_invitations
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_invitations
CREATE POLICY "Admins can manage all invitations" ON user_invitations
  FOR ALL TO authenticated
  USING (public.is_admin_bypass_rls(auth.uid()));

-- Create function to handle user invitation acceptance
CREATE OR REPLACE FUNCTION public.accept_user_invitation(invitation_token text, user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  invitation_record user_invitations%ROWTYPE;
  role_id_to_assign uuid;
  result jsonb;
BEGIN
  -- Get invitation details
  SELECT * INTO invitation_record
  FROM user_invitations
  WHERE invitation_token = accept_user_invitation.invitation_token
  AND status = 'pending'
  AND expires_at > now();
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired invitation');
  END IF;
  
  -- Update invitation status
  UPDATE user_invitations 
  SET status = 'accepted', accepted_at = now()
  WHERE id = invitation_record.id;
  
  -- Assign role to user
  IF invitation_record.role_to_assign IS NOT NULL THEN
    SELECT id INTO role_id_to_assign FROM roles WHERE name = invitation_record.role_to_assign::app_role;
    
    IF role_id_to_assign IS NOT NULL THEN
      INSERT INTO user_roles (user_id, role_id)
      VALUES (user_id, role_id_to_assign)
      ON CONFLICT (user_id, role_id) DO NOTHING;
    END IF;
  END IF;
  
  -- Update user profile
  UPDATE profiles 
  SET account_type = invitation_record.role_to_assign,
      status = 'active',
      approval_status = 'approved'
  WHERE id = user_id;
  
  -- Log the acceptance
  INSERT INTO audit_logs (
    user_id, activity_type, resource_type, resource_id, metadata
  ) VALUES (
    user_id, 'invitation_accepted', 'user_invitations', invitation_record.id::text,
    jsonb_build_object('email', invitation_record.email, 'role', invitation_record.role_to_assign)
  );
  
  RETURN jsonb_build_object('success', true, 'role_assigned', invitation_record.role_to_assign);
END;
$$;

-- Create function to generate user invitation
CREATE OR REPLACE FUNCTION public.create_user_invitation(
  p_email text,
  p_role_to_assign text DEFAULT 'patient',
  p_invited_by uuid DEFAULT auth.uid()
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  invitation_token text;
  invitation_id uuid;
BEGIN
  -- Check if inviter is admin
  IF NOT public.is_admin_bypass_rls(p_invited_by) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only admins can send invitations');
  END IF;
  
  -- Generate unique token
  invitation_token := encode(gen_random_bytes(32), 'base64url');
  
  -- Create invitation
  INSERT INTO user_invitations (email, invited_by, invitation_token, role_to_assign)
  VALUES (p_email, p_invited_by, invitation_token, p_role_to_assign)
  RETURNING id INTO invitation_id;
  
  -- Log the invitation
  INSERT INTO audit_logs (
    user_id, activity_type, resource_type, resource_id, metadata
  ) VALUES (
    p_invited_by, 'user_invitation_sent', 'user_invitations', invitation_id::text,
    jsonb_build_object('email', p_email, 'role', p_role_to_assign)
  );
  
  RETURN jsonb_build_object(
    'success', true, 
    'invitation_id', invitation_id,
    'invitation_token', invitation_token,
    'expires_at', (now() + interval '7 days')
  );
END;
$$;

-- Create function to update user status
CREATE OR REPLACE FUNCTION public.update_user_status(
  p_user_id uuid,
  p_status text,
  p_admin_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  old_status text;
  admin_user_id uuid := auth.uid();
BEGIN
  -- Check if requester is admin
  IF NOT public.is_admin_bypass_rls(admin_user_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Admin privileges required');
  END IF;
  
  -- Validate status
  IF p_status NOT IN ('active', 'suspended', 'banned', 'pending') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid status');
  END IF;
  
  -- Get current status
  SELECT status INTO old_status FROM profiles WHERE id = p_user_id;
  
  -- Update user status
  UPDATE profiles 
  SET status = p_status,
      admin_notes = COALESCE(p_admin_notes, admin_notes),
      updated_at = now()
  WHERE id = p_user_id;
  
  -- Log the status change
  INSERT INTO audit_logs (
    user_id, activity_type, resource_type, resource_id, metadata
  ) VALUES (
    admin_user_id, 'user_status_changed', 'profiles', p_user_id::text,
    jsonb_build_object(
      'target_user_id', p_user_id,
      'old_status', old_status,
      'new_status', p_status,
      'admin_notes', p_admin_notes
    )
  );
  
  RETURN jsonb_build_object('success', true, 'old_status', old_status, 'new_status', p_status);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.accept_user_invitation(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_invitation(text, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_status(uuid, text, text) TO authenticated;
