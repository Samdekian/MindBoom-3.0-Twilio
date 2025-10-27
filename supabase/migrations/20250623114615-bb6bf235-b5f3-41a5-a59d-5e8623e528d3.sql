
-- Create trigger function to auto-create patient-therapist relationships from inquiries
CREATE OR REPLACE FUNCTION public.auto_create_relationship_from_inquiry()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create or update patient-therapist relationship when inquiry is created
  INSERT INTO patient_therapist_relationships (
    patient_id,
    therapist_id,
    relationship_status,
    created_from_inquiry_id,
    relationship_notes
  ) VALUES (
    NEW.patient_id,
    NEW.therapist_id,
    'inquiry',
    NEW.id,
    'Relationship created from inquiry: ' || NEW.subject
  )
  ON CONFLICT (patient_id, therapist_id) 
  DO UPDATE SET
    relationship_status = CASE 
      WHEN patient_therapist_relationships.relationship_status = 'terminated' THEN 'inquiry'
      ELSE patient_therapist_relationships.relationship_status
    END,
    updated_at = now(),
    relationship_notes = COALESCE(patient_therapist_relationships.relationship_notes, '') || 
                        E'\n[' || now()::date || '] New inquiry: ' || NEW.subject;
  
  RETURN NEW;
END;
$$;

-- Create trigger for auto-creating relationships
DROP TRIGGER IF EXISTS trigger_auto_create_relationship ON patient_inquiries;
CREATE TRIGGER trigger_auto_create_relationship
  AFTER INSERT ON patient_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_relationship_from_inquiry();

-- Create trigger function to auto-update inquiry status and create notifications
CREATE OR REPLACE FUNCTION public.auto_update_inquiry_response()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- When inquiry gets a response, update relationship status if appropriate
  IF NEW.status = 'responded' AND OLD.status != 'responded' THEN
    -- Update relationship status to consultation_scheduled if inquiry was responded to
    UPDATE patient_therapist_relationships
    SET 
      relationship_status = CASE 
        WHEN relationship_status = 'inquiry' THEN 'consultation_scheduled'
        ELSE relationship_status
      END,
      updated_at = now()
    WHERE patient_id = NEW.patient_id 
      AND therapist_id = NEW.therapist_id;
    
    -- Create notification for patient about therapist response
    PERFORM create_notification(
      NEW.patient_id,
      'inquiry_responded',
      'Therapist Responded',
      'Your therapist has responded to your inquiry.',
      jsonb_build_object(
        'inquiry_id', NEW.id,
        'therapist_id', NEW.therapist_id,
        'subject', NEW.subject
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for auto-updating inquiry responses
DROP TRIGGER IF EXISTS trigger_auto_update_inquiry_response ON patient_inquiries;
CREATE TRIGGER trigger_auto_update_inquiry_response
  AFTER UPDATE ON patient_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_inquiry_response();

-- Create function to check for overdue inquiries and send escalation notifications
CREATE OR REPLACE FUNCTION public.escalate_overdue_inquiries()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  overdue_inquiry RECORD;
BEGIN
  -- Find inquiries that are pending for more than 24 hours
  FOR overdue_inquiry IN
    SELECT 
      pi.*,
      p.full_name as patient_name,
      t.full_name as therapist_name
    FROM patient_inquiries pi
    JOIN profiles p ON pi.patient_id = p.id
    JOIN profiles t ON pi.therapist_id = t.id
    WHERE pi.status = 'pending'
      AND pi.created_at < (now() - interval '24 hours')
      AND NOT EXISTS (
        SELECT 1 FROM notifications n 
        WHERE n.user_id = pi.therapist_id 
          AND n.type = 'inquiry_overdue'
          AND n.data->>'inquiry_id' = pi.id::text
          AND n.created_at > (now() - interval '24 hours')
      )
  LOOP
    -- Send escalation notification to therapist
    PERFORM create_notification(
      overdue_inquiry.therapist_id,
      'inquiry_overdue',
      'Urgent: Overdue Patient Inquiry',
      'You have an inquiry from ' || overdue_inquiry.patient_name || ' that has been waiting for over 24 hours.',
      jsonb_build_object(
        'inquiry_id', overdue_inquiry.id,
        'patient_id', overdue_inquiry.patient_id,
        'subject', overdue_inquiry.subject,
        'priority', 'urgent',
        'hours_overdue', EXTRACT(EPOCH FROM (now() - overdue_inquiry.created_at)) / 3600
      )
    );
    
    -- Optionally notify patient about delay
    PERFORM create_notification(
      overdue_inquiry.patient_id,
      'inquiry_delay_notice',
      'Your Inquiry Update',
      'We''ve sent a reminder to your therapist about your inquiry. They should respond soon.',
      jsonb_build_object(
        'inquiry_id', overdue_inquiry.id,
        'therapist_id', overdue_inquiry.therapist_id,
        'subject', overdue_inquiry.subject
      )
    );
  END LOOP;
END;
$$;

-- Create a simple scheduler table for running periodic tasks
CREATE TABLE IF NOT EXISTS public.scheduled_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_name TEXT NOT NULL UNIQUE,
  last_run TIMESTAMP WITH TIME ZONE,
  next_run TIMESTAMP WITH TIME ZONE,
  interval_minutes INTEGER NOT NULL DEFAULT 60,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert the escalation task
INSERT INTO scheduled_tasks (task_name, next_run, interval_minutes)
VALUES ('escalate_overdue_inquiries', now() + interval '1 hour', 60)
ON CONFLICT (task_name) DO NOTHING;

-- Create function to run scheduled tasks
CREATE OR REPLACE FUNCTION public.run_scheduled_tasks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  task_record RECORD;
BEGIN
  -- Process all active tasks that are due to run
  FOR task_record IN
    SELECT * FROM scheduled_tasks 
    WHERE is_active = true 
      AND next_run <= now()
  LOOP
    -- Run the specific task
    CASE task_record.task_name
      WHEN 'escalate_overdue_inquiries' THEN
        PERFORM escalate_overdue_inquiries();
      -- Add more tasks here as needed
    END CASE;
    
    -- Update the task schedule
    UPDATE scheduled_tasks 
    SET 
      last_run = now(),
      next_run = now() + (task_record.interval_minutes || ' minutes')::interval
    WHERE id = task_record.id;
  END LOOP;
END;
$$;
