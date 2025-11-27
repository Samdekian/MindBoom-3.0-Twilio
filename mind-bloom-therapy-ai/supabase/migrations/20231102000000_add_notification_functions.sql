
-- Create the appointment_notification_logs table
CREATE TABLE IF NOT EXISTS public.appointment_notification_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  notification_status TEXT NOT NULL,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add RLS policy for appointments_notification_logs
ALTER TABLE public.appointment_notification_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view notification logs
CREATE POLICY "Only admins can view notification logs"
  ON public.appointment_notification_logs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Create function to get upcoming appointments that need reminders
CREATE OR REPLACE FUNCTION public.get_upcoming_appointment_reminders()
RETURNS TABLE (
  appointment_id UUID,
  title TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  patient_email TEXT,
  patient_name TEXT,
  therapist_name TEXT,
  notification_type TEXT,
  phone_number TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id as appointment_id,
    a.title,
    a.start_time,
    a.end_time,
    u.email as patient_email,
    p_profile.full_name as patient_name,
    t_profile.full_name as therapist_name,
    np.notification_type,
    np.phone_number
  FROM appointments a
  JOIN appointment_notification_preferences np ON a.id = np.appointment_id
  JOIN auth.users u ON np.user_id = u.id
  JOIN profiles p_profile ON a.patient_id = p_profile.id
  JOIN profiles t_profile ON a.therapist_id = t_profile.id
  LEFT JOIN appointment_notification_logs nl ON 
    a.id = nl.appointment_id AND 
    nl.notification_status = 'sent' AND
    nl.created_at > NOW() - INTERVAL '1 day'
  WHERE 
    -- Appointment status is valid
    a.status IN ('scheduled', 'confirmed') AND
    
    -- Appointment is in the future
    a.start_time > NOW() AND
    
    -- Appointment is within reminder window
    a.start_time <= NOW() + (np.reminder_time_hours * INTERVAL '1 hour') AND
    
    -- No successful notification sent in the last day
    nl.id IS NULL AND
    
    -- User wants notifications
    np.notification_type != 'none';
END;
$$;
