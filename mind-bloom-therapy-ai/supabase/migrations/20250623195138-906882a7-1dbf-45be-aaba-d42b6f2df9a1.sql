
-- Fix RLS policies for instant_sessions table

-- Drop existing policies
DROP POLICY IF EXISTS "Therapists can manage their own instant sessions" ON public.instant_sessions;
DROP POLICY IF EXISTS "Anyone can view active sessions with token" ON public.instant_sessions;

-- Create separate policies for different operations
CREATE POLICY "Therapists can insert their own instant sessions"
  ON public.instant_sessions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() 
      AND (r.name = 'therapist' OR r.name = 'admin')
    )
    AND therapist_id = auth.uid()
  );

CREATE POLICY "Therapists can view their own instant sessions"
  ON public.instant_sessions
  FOR SELECT
  USING (
    therapist_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() 
      AND r.name = 'admin'
    )
  );

CREATE POLICY "Therapists can update their own instant sessions"
  ON public.instant_sessions
  FOR UPDATE
  USING (
    therapist_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() 
      AND r.name = 'admin'
    )
  );

CREATE POLICY "Therapists can delete their own instant sessions"
  ON public.instant_sessions
  FOR DELETE
  USING (
    therapist_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() 
      AND r.name = 'admin'
    )
  );

-- Anyone can view active sessions with valid token for joining
CREATE POLICY "Public can view active sessions by token"
  ON public.instant_sessions
  FOR SELECT
  USING (is_active = true AND expires_at > now());

-- Fix RLS policies for instant_session_participants

-- Drop existing policies
DROP POLICY IF EXISTS "Users can see session participants" ON public.instant_session_participants;
DROP POLICY IF EXISTS "Users can join sessions" ON public.instant_session_participants;
DROP POLICY IF EXISTS "Users can update their participation" ON public.instant_session_participants;

-- Create new policies for participants
CREATE POLICY "Users can view participants in their sessions"
  ON public.instant_session_participants
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.instant_sessions
      WHERE id = session_id 
      AND therapist_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.instant_session_participants isp
      WHERE isp.session_id = instant_session_participants.session_id
      AND isp.user_id = auth.uid()
      AND isp.is_active = true
    )
  );

-- Allow anyone to join sessions (both authenticated and anonymous users)
CREATE POLICY "Anyone can join sessions"
  ON public.instant_session_participants
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.instant_sessions
      WHERE id = session_id 
      AND is_active = true 
      AND expires_at > now()
    )
  );

CREATE POLICY "Users can update their own participation"
  ON public.instant_session_participants
  FOR UPDATE
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.instant_sessions
      WHERE id = session_id 
      AND therapist_id = auth.uid()
    )
  );
