
-- Add session status to instant_sessions table
ALTER TABLE public.instant_sessions 
ADD COLUMN IF NOT EXISTS session_status text DEFAULT 'created' CHECK (session_status IN ('created', 'waiting', 'active', 'ended'));

-- Enable realtime for instant_session_participants table
ALTER TABLE public.instant_session_participants REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.instant_session_participants;

-- Enable realtime for instant_sessions table  
ALTER TABLE public.instant_sessions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.instant_sessions;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_instant_sessions_therapist_status ON public.instant_sessions(therapist_id, session_status);
CREATE INDEX IF NOT EXISTS idx_instant_session_participants_session_active ON public.instant_session_participants(session_id, is_active);
