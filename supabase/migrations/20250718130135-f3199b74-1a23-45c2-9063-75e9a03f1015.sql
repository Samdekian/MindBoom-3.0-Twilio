-- Create session state tracking table
CREATE TABLE IF NOT EXISTS session_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES instant_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  state_data JSONB NOT NULL DEFAULT '{}',
  connection_state TEXT NOT NULL DEFAULT 'disconnected',
  video_enabled BOOLEAN DEFAULT false,
  audio_enabled BOOLEAN DEFAULT false,
  screen_sharing BOOLEAN DEFAULT false,
  last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_session_states_session_id ON session_states(session_id);
CREATE INDEX IF NOT EXISTS idx_session_states_user_id ON session_states(user_id);
CREATE INDEX IF NOT EXISTS idx_session_states_heartbeat ON session_states(last_heartbeat);

-- Create session analytics table
CREATE TABLE IF NOT EXISTS session_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES instant_sessions(id) ON DELETE CASCADE,
  total_participants INTEGER DEFAULT 0,
  max_concurrent_participants INTEGER DEFAULT 0,
  total_duration_seconds INTEGER DEFAULT 0,
  connection_quality_avg DECIMAL(3,2) DEFAULT 0,
  disconnection_count INTEGER DEFAULT 0,
  reconnection_count INTEGER DEFAULT 0,
  chat_messages_count INTEGER DEFAULT 0,
  recording_duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create session errors table for debugging
CREATE TABLE IF NOT EXISTS session_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES instant_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_context JSONB DEFAULT '{}',
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE session_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_errors ENABLE ROW LEVEL SECURITY;

-- RLS policies for session_states
CREATE POLICY "Users can view session states for their sessions" ON session_states
  FOR SELECT USING (
    user_id = auth.uid() OR 
    session_id IN (
      SELECT id FROM instant_sessions 
      WHERE therapist_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own session states" ON session_states
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own session states" ON session_states
  FOR UPDATE USING (user_id = auth.uid());

-- RLS policies for session_analytics  
CREATE POLICY "Therapists can view analytics for their sessions" ON session_analytics
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM instant_sessions 
      WHERE therapist_id = auth.uid()
    )
  );

CREATE POLICY "System can insert analytics" ON session_analytics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update analytics" ON session_analytics
  FOR UPDATE USING (true);

-- RLS policies for session_errors
CREATE POLICY "Users can view their own session errors" ON session_errors
  FOR SELECT USING (
    user_id = auth.uid() OR 
    session_id IN (
      SELECT id FROM instant_sessions 
      WHERE therapist_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own session errors" ON session_errors
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_session_states_updated_at
  BEFORE UPDATE ON session_states
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_analytics_updated_at
  BEFORE UPDATE ON session_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to cleanup stale session states
CREATE OR REPLACE FUNCTION cleanup_stale_session_states()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Function to update session analytics
CREATE OR REPLACE FUNCTION update_session_analytics_data(p_session_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_participants INTEGER;
  v_max_concurrent INTEGER;
  v_chat_count INTEGER;
  v_disconnection_count INTEGER;
  v_reconnection_count INTEGER;
BEGIN
  -- Count total unique participants
  SELECT COUNT(DISTINCT user_id) INTO v_total_participants
  FROM instant_session_participants
  WHERE session_id = p_session_id;
  
  -- Get max concurrent participants (simplified - could be improved with time-based analysis)
  SELECT COUNT(*) INTO v_max_concurrent
  FROM instant_session_participants
  WHERE session_id = p_session_id AND is_active = true;
  
  -- Count chat messages
  SELECT COUNT(*) INTO v_chat_count
  FROM session_chat_messages
  WHERE session_id = p_session_id::text;
  
  -- Count connection issues
  SELECT COUNT(*) INTO v_disconnection_count
  FROM session_connection_logs
  WHERE session_id = p_session_id::text 
  AND connection_state = 'disconnected';
  
  SELECT COUNT(*) INTO v_reconnection_count
  FROM session_connection_logs
  WHERE session_id = p_session_id::text 
  AND connection_state = 'connected'
  AND created_at > (
    SELECT MIN(created_at) FROM session_connection_logs 
    WHERE session_id = p_session_id::text
  );
  
  -- Update or insert analytics
  INSERT INTO session_analytics (
    session_id,
    total_participants,
    max_concurrent_participants,
    chat_messages_count,
    disconnection_count,
    reconnection_count
  ) VALUES (
    p_session_id,
    v_total_participants,
    v_max_concurrent,
    v_chat_count,
    v_disconnection_count,
    v_reconnection_count
  )
  ON CONFLICT (session_id) DO UPDATE SET
    total_participants = EXCLUDED.total_participants,
    max_concurrent_participants = GREATEST(session_analytics.max_concurrent_participants, EXCLUDED.max_concurrent_participants),
    chat_messages_count = EXCLUDED.chat_messages_count,
    disconnection_count = EXCLUDED.disconnection_count,
    reconnection_count = EXCLUDED.reconnection_count,
    updated_at = now();
END;
$$;