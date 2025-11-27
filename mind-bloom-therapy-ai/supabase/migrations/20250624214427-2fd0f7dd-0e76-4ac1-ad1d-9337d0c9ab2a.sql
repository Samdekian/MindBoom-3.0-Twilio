
-- Create signaling_messages table for WebRTC signaling
CREATE TABLE IF NOT EXISTS public.signaling_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID NOT NULL,
  sender_id UUID REFERENCES auth.users(id) NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('offer', 'answer', 'ice-candidate')),
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.signaling_messages ENABLE ROW LEVEL SECURITY;

-- Allow users to insert signaling messages for sessions they're part of
CREATE POLICY "Users can send signaling messages" ON public.signaling_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Allow users to read signaling messages from channels they're part of
CREATE POLICY "Users can read signaling messages" ON public.signaling_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM appointments a 
      WHERE a.id = channel_id 
      AND (a.patient_id = auth.uid() OR a.therapist_id = auth.uid())
    )
  );

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_signaling_messages_channel_created 
  ON public.signaling_messages(channel_id, created_at DESC);

-- Create table for session connection logs
CREATE TABLE IF NOT EXISTS public.session_connection_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  session_id TEXT NOT NULL,
  connection_state TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for connection logs
ALTER TABLE public.session_connection_logs ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own connection logs
CREATE POLICY "Users can log their own connections" ON public.session_connection_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to read their own connection logs
CREATE POLICY "Users can read their own connection logs" ON public.session_connection_logs
  FOR SELECT USING (auth.uid() = user_id);
