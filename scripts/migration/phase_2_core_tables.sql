-- ============================================================================
-- PHASE 2: CORE TABLES CREATION
-- ============================================================================
-- Priority: HIGH
-- Estimated Time: 2-3 hours
-- Description: Create essential tables for core functionality
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TREATMENT_PLANS TABLE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS treatment_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  therapist_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  goals jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  start_date timestamptz DEFAULT NOW(),
  end_date timestamptz,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE treatment_plans ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "treatment_plans_select_own" ON treatment_plans
  FOR SELECT USING (patient_id = auth.uid() OR therapist_id = auth.uid());

CREATE POLICY "treatment_plans_insert_therapist" ON treatment_plans
  FOR INSERT WITH CHECK (therapist_id = auth.uid());

CREATE POLICY "treatment_plans_update_therapist" ON treatment_plans
  FOR UPDATE USING (therapist_id = auth.uid());

CREATE POLICY "treatment_plans_delete_therapist" ON treatment_plans
  FOR DELETE USING (therapist_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_treatment_plans_patient ON treatment_plans(patient_id);
CREATE INDEX IF NOT EXISTS idx_treatment_plans_therapist ON treatment_plans(therapist_id);
CREATE INDEX IF NOT EXISTS idx_treatment_plans_status ON treatment_plans(status);

-- ----------------------------------------------------------------------------
-- 2. SESSION_NOTES TABLE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS session_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES video_sessions(id) ON DELETE CASCADE,
  therapist_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  patient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  notes text, -- Shared notes visible to patient
  private_notes text, -- Only therapist can see
  mood_rating integer CHECK (mood_rating BETWEEN 1 AND 10),
  session_quality integer CHECK (session_quality BETWEEN 1 AND 10),
  homework_assigned text,
  next_steps text,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE session_notes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "session_notes_select_therapist" ON session_notes
  FOR SELECT USING (therapist_id = auth.uid());

CREATE POLICY "session_notes_select_patient" ON session_notes
  FOR SELECT USING (patient_id = auth.uid() AND notes IS NOT NULL);

CREATE POLICY "session_notes_insert_therapist" ON session_notes
  FOR INSERT WITH CHECK (therapist_id = auth.uid());

CREATE POLICY "session_notes_update_therapist" ON session_notes
  FOR UPDATE USING (therapist_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_session_notes_session ON session_notes(session_id);
CREATE INDEX IF NOT EXISTS idx_session_notes_therapist ON session_notes(therapist_id);
CREATE INDEX IF NOT EXISTS idx_session_notes_patient ON session_notes(patient_id);

-- ----------------------------------------------------------------------------
-- 3. MOOD_ENTRIES TABLE (Mood Tracker)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS mood_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mood_score integer NOT NULL CHECK (mood_score BETWEEN 1 AND 10),
  energy_level integer CHECK (energy_level BETWEEN 1 AND 10),
  stress_level integer CHECK (stress_level BETWEEN 1 AND 10),
  anxiety_level integer CHECK (anxiety_level BETWEEN 1 AND 10),
  sleep_quality integer CHECK (sleep_quality BETWEEN 1 AND 10),
  notes text,
  tags text[],
  recorded_at timestamptz DEFAULT NOW(),
  created_at timestamptz DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;

-- Policies (user can do everything with their own entries)
CREATE POLICY "mood_entries_all_own" ON mood_entries
  USING (user_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mood_entries_user ON mood_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_entries_recorded ON mood_entries(recorded_at);
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_recorded ON mood_entries(user_id, recorded_at DESC);

-- ----------------------------------------------------------------------------
-- 4. NOTIFICATIONS TABLE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN (
    'appointment_reminder',
    'appointment_confirmed',
    'appointment_cancelled',
    'session_starting',
    'new_message',
    'treatment_plan_updated',
    'therapist_approved',
    'therapist_rejected',
    'system'
  )),
  title text NOT NULL,
  message text,
  data jsonb DEFAULT '{}'::jsonb,
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  read_at timestamptz,
  action_url text,
  created_at timestamptz DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "notifications_delete_own" ON notifications
  FOR DELETE USING (user_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- ----------------------------------------------------------------------------
-- 5. NOTIFICATION_PREFERENCES TABLE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email_enabled boolean DEFAULT true,
  push_enabled boolean DEFAULT true,
  sms_enabled boolean DEFAULT false,
  appointment_reminders boolean DEFAULT true,
  appointment_changes boolean DEFAULT true,
  session_updates boolean DEFAULT true,
  new_messages boolean DEFAULT true,
  treatment_updates boolean DEFAULT true,
  marketing boolean DEFAULT false,
  weekly_summary boolean DEFAULT true,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "notification_prefs_all_own" ON notification_preferences
  USING (user_id = auth.uid());

-- Index
CREATE INDEX IF NOT EXISTS idx_notification_prefs_user ON notification_preferences(user_id);

-- ----------------------------------------------------------------------------
-- 6. CALENDAR_SYNC_TOKENS TABLE (for Google/Apple Calendar sync)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS calendar_sync_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider text NOT NULL CHECK (provider IN ('google', 'apple', 'outlook')),
  access_token text NOT NULL,
  refresh_token text,
  token_expires_at timestamptz,
  calendar_id text,
  sync_enabled boolean DEFAULT true,
  last_sync_at timestamptz,
  sync_errors jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE calendar_sync_tokens ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "calendar_tokens_all_own" ON calendar_sync_tokens
  USING (user_id = auth.uid());

-- Index
CREATE INDEX IF NOT EXISTS idx_calendar_tokens_user ON calendar_sync_tokens(user_id);

-- ----------------------------------------------------------------------------
-- 7. ADD MISSING INDEXES TO EXISTING TABLES
-- ----------------------------------------------------------------------------

-- Appointments indexes
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_therapist ON appointments(therapist_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled ON appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_scheduled ON appointments(patient_id, scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_therapist_scheduled ON appointments(therapist_id, scheduled_at DESC);

-- Video sessions indexes
CREATE INDEX IF NOT EXISTS idx_video_sessions_created_by ON video_sessions(created_by);
CREATE INDEX IF NOT EXISTS idx_video_sessions_status ON video_sessions(status);
CREATE INDEX IF NOT EXISTS idx_video_sessions_room_name ON video_sessions(room_name);
CREATE INDEX IF NOT EXISTS idx_video_sessions_type_status ON video_sessions(session_type, status);

-- Session participants indexes
CREATE INDEX IF NOT EXISTS idx_session_participants_session ON session_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_session_participants_user ON session_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_session_participants_session_user ON session_participants(session_id, user_id);

-- Breakout rooms indexes
CREATE INDEX IF NOT EXISTS idx_breakout_rooms_session ON breakout_rooms(main_session_id);
CREATE INDEX IF NOT EXISTS idx_breakout_rooms_status ON breakout_rooms(status);
CREATE INDEX IF NOT EXISTS idx_breakout_room_participants_room ON breakout_room_participants(breakout_room_id);
CREATE INDEX IF NOT EXISTS idx_breakout_room_participants_user ON breakout_room_participants(user_id);

-- User roles indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role_id);

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_account_type ON profiles(account_type);
CREATE INDEX IF NOT EXISTS idx_profiles_approval_status ON profiles(approval_status);

-- ----------------------------------------------------------------------------
-- VERIFICATION
-- ----------------------------------------------------------------------------

DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN (
    'treatment_plans',
    'session_notes',
    'mood_entries',
    'notifications',
    'notification_preferences',
    'calendar_sync_tokens'
  );
  
  RAISE NOTICE '';
  RAISE NOTICE '=================================================';
  RAISE NOTICE '✅ PHASE 2 COMPLETED SUCCESSFULLY!';
  RAISE NOTICE '=================================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Core Tables Created: %', table_count;
  RAISE NOTICE '';
  RAISE NOTICE '📋 Tables created:';
  RAISE NOTICE '   ✓ treatment_plans';
  RAISE NOTICE '   ✓ session_notes';
  RAISE NOTICE '   ✓ mood_entries';
  RAISE NOTICE '   ✓ notifications';
  RAISE NOTICE '   ✓ notification_preferences';
  RAISE NOTICE '   ✓ calendar_sync_tokens';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 All core functionality tables are ready!';
  RAISE NOTICE '📈 Performance indexes added!';
  RAISE NOTICE '🔒 RLS policies configured!';
  RAISE NOTICE '';
  RAISE NOTICE '=================================================';
END $$;

-- Display all new tables
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = t.table_name) as policy_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN (
  'treatment_plans',
  'session_notes',
  'mood_entries',
  'notifications',
  'notification_preferences',
  'calendar_sync_tokens'
)
ORDER BY table_name;

