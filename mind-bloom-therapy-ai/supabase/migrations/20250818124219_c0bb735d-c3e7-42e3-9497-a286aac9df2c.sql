-- CRITICAL SECURITY FIXES - Phase 4: Final Function Security Hardening

-- Fix remaining critical database functions missing SET search_path

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

CREATE OR REPLACE FUNCTION public.create_user_invitation(p_email text, p_role_to_assign text DEFAULT 'patient'::text, p_invited_by uuid DEFAULT auth.uid())
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

CREATE OR REPLACE FUNCTION public.ensure_admin_role_consistency()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  admin_role_id UUID;
  first_user_id UUID;
BEGIN
  -- Get admin role ID
  SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';
  
  -- If no admin role exists, create it
  IF admin_role_id IS NULL THEN
    INSERT INTO roles (name, description)
    VALUES ('admin', 'Administrator with full system access')
    RETURNING id INTO admin_role_id;
  END IF;
  
  -- Get the first user
  SELECT id INTO first_user_id FROM auth.users ORDER BY created_at LIMIT 1;
  
  -- Ensure first user has admin role
  IF first_user_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role_id)
    VALUES (first_user_id, admin_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
    
    -- Update their profile
    UPDATE profiles 
    SET account_type = 'admin', approval_status = 'approved'
    WHERE id = first_user_id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_instant_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Mark participants in expired sessions as inactive
  UPDATE instant_session_participants 
  SET is_active = false, left_at = now() 
  WHERE is_active = true 
  AND session_id IN (
    SELECT id FROM instant_sessions 
    WHERE expires_at < now() OR is_active = false
  );
  
  -- Deactivate expired sessions
  UPDATE instant_sessions 
  SET is_active = false, session_status = 'expired'
  WHERE expires_at < now() AND is_active = true;
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_participant_on_disconnect(p_session_id uuid, p_user_id uuid DEFAULT NULL::uuid, p_participant_name text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE instant_session_participants 
  SET is_active = false, left_at = now()
  WHERE session_id = p_session_id 
  AND is_active = true
  AND (
    (p_user_id IS NOT NULL AND user_id = p_user_id) OR
    (p_user_id IS NULL AND participant_name = p_participant_name)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_stale_participants()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Mark participants as inactive if they haven't been active for more than 5 minutes
  -- This helps catch cases where browser was closed without proper cleanup
  UPDATE instant_session_participants 
  SET is_active = false, left_at = now()
  WHERE is_active = true 
  AND joined_at < now() - INTERVAL '5 minutes'
  AND left_at IS NULL
  AND session_id IN (
    SELECT id FROM instant_sessions 
    WHERE expires_at < now() OR is_active = false
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_stale_session_states()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Mark participants as disconnected if no heartbeat for 2 minutes
  UPDATE session_states 
  SET connection_state = 'disconnected',
      updated_at = now()
  WHERE last_heartbeat < now() - INTERVAL '2 minutes'
  AND connection_state != 'disconnected';
  
  -- Update participant status based on session state
  UPDATE instant_session_participants 
  SET is_active = false, left_at = now()
  WHERE id IN (
    SELECT isp.id FROM instant_session_participants isp
    LEFT JOIN session_states ss ON isp.session_id = ss.session_id AND isp.user_id = ss.user_id
    WHERE isp.is_active = true 
    AND (ss.id IS NULL OR ss.connection_state = 'disconnected')
  );
END;
$$;