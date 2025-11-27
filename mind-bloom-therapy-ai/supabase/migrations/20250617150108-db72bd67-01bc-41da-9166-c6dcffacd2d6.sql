
-- Create tables for enhanced messaging system
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  thread_id UUID,
  subject TEXT,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'direct' CHECK (message_type IN ('direct', 'session_prep', 'progress_update', 'system')),
  is_read BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  attachment_urls TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create table for therapist availability slots
CREATE TABLE public.therapist_availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slot_date DATE NOT NULL,
  slot_start_time TIME NOT NULL,
  slot_end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  slot_type TEXT DEFAULT 'regular' CHECK (slot_type IN ('regular', 'emergency', 'consultation')),
  max_bookings INTEGER DEFAULT 1,
  current_bookings INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create table for appointment reminders
CREATE TABLE public.appointment_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('email', 'sms', 'push', 'in_app')),
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  content TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create table for session materials
CREATE TABLE public.session_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  material_type TEXT NOT NULL CHECK (material_type IN ('homework', 'reading', 'exercise', 'assessment', 'resource')),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  file_urls TEXT[],
  due_date DATE,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create table for appointment conflicts tracking
CREATE TABLE public.appointment_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  conflict_type TEXT NOT NULL CHECK (conflict_type IN ('scheduling', 'resource', 'therapist_unavailable', 'patient_conflict')),
  conflict_description TEXT NOT NULL,
  suggested_resolution TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'escalated')),
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX idx_messages_thread_id ON public.messages(thread_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);

CREATE INDEX idx_therapist_availability_slots_therapist_date ON public.therapist_availability_slots(therapist_id, slot_date);
CREATE INDEX idx_therapist_availability_slots_available ON public.therapist_availability_slots(is_available);

CREATE INDEX idx_appointment_reminders_appointment_id ON public.appointment_reminders(appointment_id);
CREATE INDEX idx_appointment_reminders_scheduled_for ON public.appointment_reminders(scheduled_for);
CREATE INDEX idx_appointment_reminders_status ON public.appointment_reminders(status);

CREATE INDEX idx_session_materials_appointment_id ON public.session_materials(appointment_id);
CREATE INDEX idx_session_materials_therapist_id ON public.session_materials(therapist_id);

CREATE INDEX idx_appointment_conflicts_appointment_id ON public.appointment_conflicts(appointment_id);
CREATE INDEX idx_appointment_conflicts_status ON public.appointment_conflicts(status);

-- Add RLS policies for messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own messages"
ON public.messages
FOR SELECT
USING (
  sender_id = auth.uid() OR 
  recipient_id = auth.uid() OR 
  public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Users can send messages"
ON public.messages
FOR INSERT
WITH CHECK (
  sender_id = auth.uid()
);

CREATE POLICY "Users can update their sent messages"
ON public.messages
FOR UPDATE
USING (
  sender_id = auth.uid() OR 
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Add RLS policies for therapist availability slots
ALTER TABLE public.therapist_availability_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Therapists can manage their availability"
ON public.therapist_availability_slots
FOR ALL
USING (
  therapist_id = auth.uid() OR 
  public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Patients can view therapist availability"
ON public.therapist_availability_slots
FOR SELECT
USING (
  is_available = true OR
  public.has_role(auth.uid(), 'therapist'::app_role) OR
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Add RLS policies for appointment reminders
ALTER TABLE public.appointment_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Appointment reminders access based on appointment"
ON public.appointment_reminders
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.appointments a 
    WHERE a.id = appointment_id 
    AND (
      a.patient_id = auth.uid() OR 
      a.therapist_id = auth.uid() OR 
      public.has_role(auth.uid(), 'admin'::app_role)
    )
  )
);

-- Add RLS policies for session materials
ALTER TABLE public.session_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Session materials access based on appointment"
ON public.session_materials
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.appointments a 
    WHERE a.id = appointment_id 
    AND (
      a.patient_id = auth.uid() OR 
      a.therapist_id = auth.uid() OR 
      public.has_role(auth.uid(), 'admin'::app_role)
    )
  )
);

-- Add RLS policies for appointment conflicts
ALTER TABLE public.appointment_conflicts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Appointment conflicts access based on appointment"
ON public.appointment_conflicts
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.appointments a 
    WHERE a.id = appointment_id 
    AND (
      a.patient_id = auth.uid() OR 
      a.therapist_id = auth.uid() OR 
      public.has_role(auth.uid(), 'admin'::app_role)
    )
  )
);

-- Add updated_at triggers
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_timestamp();

CREATE TRIGGER update_therapist_availability_slots_updated_at
  BEFORE UPDATE ON public.therapist_availability_slots
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_timestamp();

CREATE TRIGGER update_session_materials_updated_at
  BEFORE UPDATE ON public.session_materials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_timestamp();

-- Create function to check real-time availability
CREATE OR REPLACE FUNCTION public.check_therapist_availability(
  p_therapist_id UUID,
  p_date DATE,
  p_start_time TIME,
  p_end_time TIME
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  slot_available BOOLEAN := false;
  conflict_count INTEGER := 0;
BEGIN
  -- Check if therapist has availability slot for this time
  SELECT EXISTS (
    SELECT 1 FROM public.therapist_availability_slots 
    WHERE therapist_id = p_therapist_id
    AND slot_date = p_date
    AND slot_start_time <= p_start_time
    AND slot_end_time >= p_end_time
    AND is_available = true
    AND current_bookings < max_bookings
  ) INTO slot_available;
  
  -- Check for appointment conflicts
  SELECT COUNT(*) INTO conflict_count
  FROM public.appointments
  WHERE therapist_id = p_therapist_id
  AND DATE(appointments.start_time) = p_date
  AND EXTRACT(HOUR FROM appointments.start_time) * 60 + EXTRACT(MINUTE FROM appointments.start_time) < EXTRACT(HOUR FROM p_end_time) * 60 + EXTRACT(MINUTE FROM p_end_time)
  AND EXTRACT(HOUR FROM appointments.end_time) * 60 + EXTRACT(MINUTE FROM appointments.end_time) > EXTRACT(HOUR FROM p_start_time) * 60 + EXTRACT(MINUTE FROM p_start_time)
  AND status NOT IN ('cancelled', 'completed');
  
  RETURN slot_available AND conflict_count = 0;
END;
$$;

-- Create function to automatically create appointment reminders
CREATE OR REPLACE FUNCTION public.create_appointment_reminders(p_appointment_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  appointment_start TIMESTAMPTZ;
  reminder_times INTEGER[] := ARRAY[1440, 60, 15]; -- 24 hours, 1 hour, 15 minutes before
  reminder_time INTEGER;
BEGIN
  -- Get appointment start time
  SELECT appointments.start_time INTO appointment_start
  FROM public.appointments
  WHERE id = p_appointment_id;
  
  -- Create reminders at different intervals
  FOREACH reminder_time IN ARRAY reminder_times
  LOOP
    INSERT INTO public.appointment_reminders (
      appointment_id,
      reminder_type,
      scheduled_for,
      content
    ) VALUES (
      p_appointment_id,
      'email',
      appointment_start - (reminder_time || ' minutes')::INTERVAL,
      CASE 
        WHEN reminder_time = 1440 THEN 'Reminder: You have an appointment tomorrow'
        WHEN reminder_time = 60 THEN 'Reminder: You have an appointment in 1 hour'
        WHEN reminder_time = 15 THEN 'Reminder: You have an appointment in 15 minutes'
      END
    );
  END LOOP;
END;
$$;

-- Create trigger to automatically create reminders for new appointments
CREATE OR REPLACE FUNCTION public.trigger_create_appointment_reminders()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only create reminders for scheduled appointments
  IF NEW.status = 'scheduled' THEN
    PERFORM public.create_appointment_reminders(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER create_appointment_reminders_trigger
  AFTER INSERT ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_create_appointment_reminders();
