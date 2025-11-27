
-- Create instant_sessions table
CREATE TABLE public.instant_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  therapist_id UUID NOT NULL REFERENCES auth.users(id),
  session_token TEXT NOT NULL UNIQUE,
  session_name TEXT NOT NULL,
  max_participants INTEGER NOT NULL DEFAULT 2,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  recording_enabled BOOLEAN NOT NULL DEFAULT false,
  waiting_room_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.instant_sessions ENABLE ROW LEVEL SECURITY;

-- Therapists can manage their own instant sessions
CREATE POLICY "Therapists can manage their own instant sessions"
  ON public.instant_sessions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() 
      AND (r.name = 'therapist' OR r.name = 'admin')
      AND (therapist_id = auth.uid() OR r.name = 'admin')
    )
  );

-- Anyone can view active sessions with valid token (for joining)
CREATE POLICY "Anyone can view active sessions with token"
  ON public.instant_sessions
  FOR SELECT
  USING (is_active = true AND expires_at > now());

-- Create session participants table
CREATE TABLE public.instant_session_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.instant_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  participant_name TEXT,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  left_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  role TEXT NOT NULL DEFAULT 'participant' CHECK (role IN ('host', 'participant'))
);

-- Add Row Level Security for participants
ALTER TABLE public.instant_session_participants ENABLE ROW LEVEL SECURITY;

-- Users can see participants in sessions they're part of
CREATE POLICY "Users can see session participants"
  ON public.instant_session_participants
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.instant_session_participants isp
      WHERE isp.session_id = instant_session_participants.session_id
      AND isp.user_id = auth.uid()
      AND isp.is_active = true
    )
  );

-- Users can insert themselves as participants
CREATE POLICY "Users can join sessions"
  ON public.instant_session_participants
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own participation
CREATE POLICY "Users can update their participation"
  ON public.instant_session_participants
  FOR UPDATE
  USING (user_id = auth.uid());

-- Add trigger for updated_at
CREATE TRIGGER update_instant_sessions_updated_at
  BEFORE UPDATE ON public.instant_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
