-- Create tables for WebRTC session persistence and monitoring

-- WebRTC session state persistence
CREATE TABLE IF NOT EXISTS webrtc_session_state (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  participants TEXT[] DEFAULT '{}',
  connection_states JSONB DEFAULT '{}',
  ice_states JSONB DEFAULT '{}',
  media_constraints JSONB,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT CHECK (status IN ('active', 'paused', 'ended')) DEFAULT 'active',
  quality JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(session_id, user_id)
);

-- WebRTC recovery data for connection resilience
CREATE TABLE IF NOT EXISTS webrtc_recovery_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  reconnection_count INTEGER DEFAULT 0,
  last_disconnection TIMESTAMP WITH TIME ZONE,
  pending_offers JSONB DEFAULT '[]',
  pending_answers JSONB DEFAULT '[]',
  pending_candidates JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(session_id, user_id)
);

-- Connection monitoring and analytics
CREATE TABLE IF NOT EXISTS webrtc_connection_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  peer_user_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  connection_state TEXT,
  ice_state TEXT,
  quality_score INTEGER CHECK (quality_score BETWEEN 1 AND 5),
  bandwidth INTEGER,
  latency INTEGER,
  packet_loss NUMERIC(5,2),
  jitter INTEGER,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ICE server health monitoring
CREATE TABLE IF NOT EXISTS ice_server_health (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  server_url TEXT NOT NULL,
  server_type TEXT CHECK (server_type IN ('stun', 'turn')) NOT NULL,
  is_working BOOLEAN NOT NULL,
  response_time INTEGER,
  last_tested TIMESTAMP WITH TIME ZONE DEFAULT now(),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE webrtc_session_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE webrtc_recovery_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE webrtc_connection_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ice_server_health ENABLE ROW LEVEL SECURITY;

-- RLS policies for session state (users can only access their own sessions)
CREATE POLICY "Users can manage their own session state" ON webrtc_session_state
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for recovery data (users can only access their own recovery data)
CREATE POLICY "Users can manage their own recovery data" ON webrtc_recovery_data
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for connection logs (users can see logs for sessions they participate in)
CREATE POLICY "Users can view connection logs for their sessions" ON webrtc_connection_logs
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() = peer_user_id OR
    is_admin_bypass_rls(auth.uid())
  );

CREATE POLICY "Users can insert connection logs for their sessions" ON webrtc_connection_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for ICE server health (read-only for authenticated users, admin-only writes)
CREATE POLICY "Authenticated users can view ICE server health" ON ice_server_health
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage ICE server health" ON ice_server_health
  FOR ALL USING (is_admin_bypass_rls(auth.uid()));

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_webrtc_session_state_session_id ON webrtc_session_state(session_id);
CREATE INDEX IF NOT EXISTS idx_webrtc_session_state_user_id ON webrtc_session_state(user_id);
CREATE INDEX IF NOT EXISTS idx_webrtc_session_state_status ON webrtc_session_state(status);
CREATE INDEX IF NOT EXISTS idx_webrtc_session_state_last_activity ON webrtc_session_state(last_activity);

CREATE INDEX IF NOT EXISTS idx_webrtc_recovery_data_session_user ON webrtc_recovery_data(session_id, user_id);

CREATE INDEX IF NOT EXISTS idx_webrtc_connection_logs_session_id ON webrtc_connection_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_webrtc_connection_logs_user_id ON webrtc_connection_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_webrtc_connection_logs_created_at ON webrtc_connection_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_ice_server_health_server_url ON ice_server_health(server_url);
CREATE INDEX IF NOT EXISTS idx_ice_server_health_last_tested ON ice_server_health(last_tested);

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_webrtc_session_state_updated_at
  BEFORE UPDATE ON webrtc_session_state
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webrtc_recovery_data_updated_at
  BEFORE UPDATE ON webrtc_recovery_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();