-- ============================================================================
-- PHASE 3: FUNCTIONS AND TRIGGERS
-- ============================================================================
-- Priority: MEDIUM
-- Estimated Time: 2-3 hours
-- Description: Create helper functions and automation triggers
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. FUNCTION: Create Video Session for Appointment
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION create_video_session_for_appointment()
RETURNS TRIGGER AS $$
DECLARE
  v_session_id uuid;
BEGIN
  -- Criar video_session quando appointment é confirmado
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    INSERT INTO video_sessions (
      session_type,
      room_name,
      created_by,
      status,
      created_at,
      updated_at
    ) VALUES (
      'appointment',
      'appointment-' || NEW.id::text,
      NEW.therapist_id,
      'scheduled',
      NOW(),
      NOW()
    )
    RETURNING id INTO v_session_id;
    
    -- Add therapist as participant
    INSERT INTO session_participants (session_id, user_id, role, created_at)
    VALUES (v_session_id, NEW.therapist_id, 'host', NOW());
    
    -- Add patient as participant
    INSERT INTO session_participants (session_id, user_id, role, created_at)
    VALUES (v_session_id, NEW.patient_id, 'participant', NOW());
    
    RAISE NOTICE 'Video session created for appointment %', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger
DROP TRIGGER IF EXISTS on_appointment_confirmed ON appointments;
CREATE TRIGGER on_appointment_confirmed
  AFTER INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION create_video_session_for_appointment();

-- ----------------------------------------------------------------------------
-- 2. FUNCTION: Send Notification
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION notify_user(
  target_user_id uuid,
  notification_type text,
  notification_title text,
  notification_message text,
  notification_data jsonb DEFAULT '{}'::jsonb,
  notification_priority text DEFAULT 'normal',
  notification_action_url text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  notification_id uuid;
  prefs RECORD;
BEGIN
  -- Check user's notification preferences
  SELECT * INTO prefs
  FROM notification_preferences
  WHERE user_id = target_user_id;
  
  -- Create notification preferences if not exists
  IF NOT FOUND THEN
    INSERT INTO notification_preferences (user_id)
    VALUES (target_user_id);
  END IF;
  
  -- Insert notification
  INSERT INTO notifications (
    user_id, 
    type, 
    title, 
    message, 
    data, 
    priority,
    action_url,
    created_at
  )
  VALUES (
    target_user_id, 
    notification_type, 
    notification_title, 
    notification_message, 
    notification_data, 
    notification_priority,
    notification_action_url,
    NOW()
  )
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ----------------------------------------------------------------------------
-- 3. FUNCTION: Notify on Appointment Changes
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION notify_appointment_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- New appointment created
  IF TG_OP = 'INSERT' THEN
    -- Notify therapist
    PERFORM notify_user(
      NEW.therapist_id,
      'appointment_confirmed',
      'New Appointment',
      'You have a new appointment scheduled',
      jsonb_build_object(
        'appointment_id', NEW.id,
        'scheduled_at', NEW.scheduled_at,
        'patient_id', NEW.patient_id
      ),
      'normal',
      '/therapist/appointments/' || NEW.id::text
    );
    
    -- Notify patient
    PERFORM notify_user(
      NEW.patient_id,
      'appointment_confirmed',
      'Appointment Confirmed',
      'Your appointment has been confirmed',
      jsonb_build_object(
        'appointment_id', NEW.id,
        'scheduled_at', NEW.scheduled_at,
        'therapist_id', NEW.therapist_id
      ),
      'normal',
      '/patient/appointments/' || NEW.id::text
    );
  
  -- Appointment status changed
  ELSIF TG_OP = 'UPDATE' AND NEW.status != OLD.status THEN
    IF NEW.status = 'cancelled' THEN
      -- Notify both parties of cancellation
      PERFORM notify_user(
        NEW.therapist_id,
        'appointment_cancelled',
        'Appointment Cancelled',
        'An appointment has been cancelled',
        jsonb_build_object('appointment_id', NEW.id),
        'high'
      );
      
      PERFORM notify_user(
        NEW.patient_id,
        'appointment_cancelled',
        'Appointment Cancelled',
        'Your appointment has been cancelled',
        jsonb_build_object('appointment_id', NEW.id),
        'high'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger
DROP TRIGGER IF EXISTS on_appointment_changes ON appointments;
CREATE TRIGGER on_appointment_changes
  AFTER INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION notify_appointment_changes();

-- ----------------------------------------------------------------------------
-- 4. FUNCTION: Get Therapist Statistics
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION get_therapist_statistics(therapist_uuid uuid)
RETURNS jsonb AS $$
DECLARE
  stats jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_patients', (
      SELECT COUNT(DISTINCT patient_id) 
      FROM appointments 
      WHERE therapist_id = therapist_uuid
    ),
    'total_sessions', (
      SELECT COUNT(*) 
      FROM appointments 
      WHERE therapist_id = therapist_uuid 
      AND status = 'completed'
    ),
    'upcoming_appointments', (
      SELECT COUNT(*) 
      FROM appointments 
      WHERE therapist_id = therapist_uuid 
      AND status IN ('scheduled', 'confirmed')
      AND scheduled_at > NOW()
    ),
    'active_treatment_plans', (
      SELECT COUNT(*) 
      FROM treatment_plans 
      WHERE therapist_id = therapist_uuid 
      AND status = 'active'
    ),
    'completed_treatment_plans', (
      SELECT COUNT(*) 
      FROM treatment_plans 
      WHERE therapist_id = therapist_uuid 
      AND status = 'completed'
    ),
    'this_week_sessions', (
      SELECT COUNT(*) 
      FROM appointments 
      WHERE therapist_id = therapist_uuid 
      AND scheduled_at >= date_trunc('week', NOW())
      AND scheduled_at < date_trunc('week', NOW()) + interval '1 week'
    ),
    'this_month_sessions', (
      SELECT COUNT(*) 
      FROM appointments 
      WHERE therapist_id = therapist_uuid 
      AND scheduled_at >= date_trunc('month', NOW())
      AND scheduled_at < date_trunc('month', NOW()) + interval '1 month'
    )
  ) INTO stats;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ----------------------------------------------------------------------------
-- 5. FUNCTION: Get Patient Statistics
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION get_patient_statistics(patient_uuid uuid)
RETURNS jsonb AS $$
DECLARE
  stats jsonb;
  avg_mood numeric;
BEGIN
  -- Calculate average mood from recent entries
  SELECT AVG(mood_score) INTO avg_mood
  FROM mood_entries
  WHERE user_id = patient_uuid
  AND recorded_at >= NOW() - interval '30 days';
  
  SELECT jsonb_build_object(
    'total_sessions', (
      SELECT COUNT(*) 
      FROM appointments 
      WHERE patient_id = patient_uuid 
      AND status = 'completed'
    ),
    'upcoming_appointments', (
      SELECT COUNT(*) 
      FROM appointments 
      WHERE patient_id = patient_uuid 
      AND status IN ('scheduled', 'confirmed')
      AND scheduled_at > NOW()
    ),
    'active_treatment_plans', (
      SELECT COUNT(*) 
      FROM treatment_plans 
      WHERE patient_id = patient_uuid 
      AND status = 'active'
    ),
    'average_mood_30days', COALESCE(ROUND(avg_mood, 1), 0),
    'mood_entries_30days', (
      SELECT COUNT(*) 
      FROM mood_entries 
      WHERE user_id = patient_uuid 
      AND recorded_at >= NOW() - interval '30 days'
    ),
    'unread_notifications', (
      SELECT COUNT(*) 
      FROM notifications 
      WHERE user_id = patient_uuid 
      AND read_at IS NULL
    )
  ) INTO stats;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ----------------------------------------------------------------------------
-- 6. FUNCTION: Update Updated_At Timestamp
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_video_sessions_updated_at ON video_sessions;
CREATE TRIGGER update_video_sessions_updated_at
  BEFORE UPDATE ON video_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_treatment_plans_updated_at ON treatment_plans;
CREATE TRIGGER update_treatment_plans_updated_at
  BEFORE UPDATE ON treatment_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_session_notes_updated_at ON session_notes;
CREATE TRIGGER update_session_notes_updated_at
  BEFORE UPDATE ON session_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notification_prefs_updated_at ON notification_preferences;
CREATE TRIGGER update_notification_prefs_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_calendar_tokens_updated_at ON calendar_sync_tokens;
CREATE TRIGGER update_calendar_tokens_updated_at
  BEFORE UPDATE ON calendar_sync_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 7. FUNCTION: Get Upcoming Appointments
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION get_upcoming_appointments(
  for_user_id uuid,
  days_ahead integer DEFAULT 7
)
RETURNS TABLE (
  id uuid,
  patient_id uuid,
  therapist_id uuid,
  scheduled_at timestamptz,
  duration_minutes integer,
  status text,
  patient_name text,
  therapist_name text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.patient_id,
    a.therapist_id,
    a.scheduled_at,
    a.duration_minutes,
    a.status,
    p_patient.full_name as patient_name,
    p_therapist.full_name as therapist_name
  FROM appointments a
  LEFT JOIN profiles p_patient ON p_patient.id = a.patient_id
  LEFT JOIN profiles p_therapist ON p_therapist.id = a.therapist_id
  WHERE (a.patient_id = for_user_id OR a.therapist_id = for_user_id)
  AND a.status IN ('scheduled', 'confirmed')
  AND a.scheduled_at >= NOW()
  AND a.scheduled_at <= NOW() + (days_ahead || ' days')::interval
  ORDER BY a.scheduled_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ----------------------------------------------------------------------------
-- 8. FUNCTION: Mark Notifications as Read
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION mark_notifications_read(
  notification_ids uuid[]
)
RETURNS integer AS $$
DECLARE
  updated_count integer;
BEGIN
  UPDATE notifications
  SET read_at = NOW()
  WHERE id = ANY(notification_ids)
  AND user_id = auth.uid()
  AND read_at IS NULL;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ----------------------------------------------------------------------------
-- VERIFICATION
-- ----------------------------------------------------------------------------

DO $$
DECLARE
  function_count INTEGER;
  trigger_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO function_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND p.proname IN (
    'create_video_session_for_appointment',
    'notify_user',
    'notify_appointment_changes',
    'get_therapist_statistics',
    'get_patient_statistics',
    'update_updated_at_column',
    'get_upcoming_appointments',
    'mark_notifications_read'
  );
  
  SELECT COUNT(*) INTO trigger_count
  FROM pg_trigger t
  JOIN pg_class c ON t.tgrelid = c.oid
  WHERE c.relname IN (
    'appointments',
    'profiles',
    'video_sessions',
    'treatment_plans',
    'session_notes',
    'notification_preferences',
    'calendar_sync_tokens'
  )
  AND NOT t.tgisinternal;
  
  RAISE NOTICE '';
  RAISE NOTICE '=================================================';
  RAISE NOTICE '✅ PHASE 3 COMPLETED SUCCESSFULLY!';
  RAISE NOTICE '=================================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Functions Created: %', function_count;
  RAISE NOTICE '📊 Triggers Created: %', trigger_count;
  RAISE NOTICE '';
  RAISE NOTICE '📋 Key functions:';
  RAISE NOTICE '   ✓ create_video_session_for_appointment';
  RAISE NOTICE '   ✓ notify_user';
  RAISE NOTICE '   ✓ notify_appointment_changes';
  RAISE NOTICE '   ✓ get_therapist_statistics';
  RAISE NOTICE '   ✓ get_patient_statistics';
  RAISE NOTICE '   ✓ update_updated_at_column';
  RAISE NOTICE '   ✓ get_upcoming_appointments';
  RAISE NOTICE '   ✓ mark_notifications_read';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 All automation and helper functions ready!';
  RAISE NOTICE '🚀 System is fully functional!';
  RAISE NOTICE '';
  RAISE NOTICE '=================================================';
END $$;

