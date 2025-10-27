
-- Fix instant_sessions status constraint to include 'connecting' state
ALTER TABLE instant_sessions DROP CONSTRAINT IF EXISTS instant_sessions_session_status_check;
ALTER TABLE instant_sessions ADD CONSTRAINT instant_sessions_session_status_check 
  CHECK (session_status IN ('created', 'waiting', 'connecting', 'active', 'ended', 'expired'));

-- Create sfu_rooms table for Agora SFU room management
CREATE TABLE IF NOT EXISTS sfu_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL UNIQUE,
  agora_app_id TEXT NOT NULL,
  agora_channel_name TEXT NOT NULL,
  max_participants INTEGER NOT NULL DEFAULT 15,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  host_user_id UUID NOT NULL,
  recording_enabled BOOLEAN DEFAULT false,
  recording_resource_id TEXT,
  recording_sid TEXT
);

-- Create participant_streams table for multi-stream tracking
CREATE TABLE IF NOT EXISTS participant_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  user_id UUID,
  participant_name TEXT,
  agora_uid INTEGER NOT NULL,
  stream_type TEXT NOT NULL CHECK (stream_type IN ('video', 'audio', 'screen')),
  is_publishing BOOLEAN DEFAULT false,
  is_subscribed BOOLEAN DEFAULT false,
  video_quality TEXT DEFAULT 'high' CHECK (video_quality IN ('low', 'medium', 'high')),
  audio_quality TEXT DEFAULT 'high' CHECK (audio_quality IN ('low', 'medium', 'high')),
  connection_quality TEXT DEFAULT 'excellent' CHECK (connection_quality IN ('excellent', 'good', 'poor', 'disconnected')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  left_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(session_id, user_id, stream_type)
);

-- Add group session support to instant_sessions
ALTER TABLE instant_sessions ADD COLUMN IF NOT EXISTS session_type TEXT DEFAULT 'peer_to_peer' CHECK (session_type IN ('peer_to_peer', 'group_sfu'));
ALTER TABLE instant_sessions ADD COLUMN IF NOT EXISTS sfu_room_id UUID REFERENCES sfu_rooms(id);
ALTER TABLE instant_sessions ADD COLUMN IF NOT EXISTS host_user_id UUID;

-- Enable RLS for new tables
ALTER TABLE sfu_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE participant_streams ENABLE ROW LEVEL SECURITY;

-- RLS policies for sfu_rooms
CREATE POLICY "Host can manage their SFU rooms" ON sfu_rooms
  FOR ALL USING (host_user_id = auth.uid());

CREATE POLICY "Participants can view active SFU rooms" ON sfu_rooms
  FOR SELECT USING (is_active = true AND expires_at > now());

-- RLS policies for participant_streams  
CREATE POLICY "Users can view streams in their sessions" ON participant_streams
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM instant_session_participants isp
      WHERE isp.session_id = participant_streams.session_id 
      AND isp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own streams" ON participant_streams
  FOR ALL USING (user_id = auth.uid());

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_sfu_rooms_active ON sfu_rooms(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_participant_streams_session ON participant_streams(session_id, is_active);
CREATE INDEX IF NOT EXISTS idx_participant_streams_user ON participant_streams(user_id, is_active);

-- Enable realtime for new tables
ALTER TABLE sfu_rooms REPLICA IDENTITY FULL;
ALTER TABLE participant_streams REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE sfu_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE participant_streams;
