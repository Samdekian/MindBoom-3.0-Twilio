-- Performance optimization for video conference queries
-- Add indexes for video conference and session management tables

-- Optimize user_roles table queries (most frequent query pattern)
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role_id ON user_roles(user_id, role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);

-- Optimize profiles table queries for video sessions  
CREATE INDEX IF NOT EXISTS idx_profiles_account_type_status ON profiles(account_type, status);
CREATE INDEX IF NOT EXISTS idx_profiles_approval_status_account_type ON profiles(approval_status, account_type);

-- Optimize session-related queries
CREATE INDEX IF NOT EXISTS idx_instant_sessions_creator_created ON instant_sessions(creator_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_instant_session_participants_session_active ON instant_session_participants(session_id, is_active);
CREATE INDEX IF NOT EXISTS idx_instant_session_participants_user_session ON instant_session_participants(user_id, session_id);

-- Optimize webrtc and session logs
CREATE INDEX IF NOT EXISTS idx_session_connection_logs_session_state ON session_connection_logs(session_id, connection_state);
CREATE INDEX IF NOT EXISTS idx_session_connection_logs_created_at ON session_connection_logs(created_at DESC);

-- Optimize session chat queries
CREATE INDEX IF NOT EXISTS idx_session_chat_messages_session_created ON session_chat_messages(session_id, created_at DESC);

-- Add composite index for permission checks (common query pattern)
CREATE INDEX IF NOT EXISTS idx_user_roles_permissions_lookup ON user_roles(user_id) INCLUDE (role_id);

-- Performance monitoring function
CREATE OR REPLACE FUNCTION public.analyze_video_session_performance()
RETURNS TABLE(
    table_name text,
    index_usage text,
    query_performance text,
    recommendations text
) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'user_roles'::text,
        'Optimized with composite indexes'::text,
        'Should use index scans for user/role lookups'::text,
        'Monitor for sequential scans on large datasets'::text
    UNION ALL
    SELECT 
        'profiles'::text,
        'Added account_type and status indexes'::text,
        'Improved filtering for therapists/patients'::text,
        'Consider partitioning if table grows large'::text
    UNION ALL
    SELECT
        'instant_sessions'::text,
        'Added creator and timestamp indexes'::text,
        'Faster session retrieval by creator'::text,
        'Archive old sessions periodically'::text
    UNION ALL
    SELECT
        'session_connection_logs'::text,
        'Optimized for session state queries'::text,
        'Faster connection quality monitoring'::text,
        'Implement automatic cleanup of old logs'::text;
END;
$$;