
-- Create consultation types table
CREATE TABLE IF NOT EXISTS consultation_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 15,
  price DECIMAL(10,2) DEFAULT 0.00,
  is_free BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create initial consultations table
CREATE TABLE IF NOT EXISTS initial_consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  consultation_type_id UUID NOT NULL REFERENCES consultation_types(id),
  appointment_id UUID REFERENCES appointments(id),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  reason_for_seeking TEXT,
  previous_therapy BOOLEAN DEFAULT false,
  urgency_level TEXT DEFAULT 'low' CHECK (urgency_level IN ('low', 'medium', 'high')),
  preferred_communication TEXT DEFAULT 'video' CHECK (preferred_communication IN ('video', 'phone', 'in-person')),
  specific_concerns TEXT,
  goals TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add consultation-specific fields to appointments table
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS consultation_type TEXT,
ADD COLUMN IF NOT EXISTS is_initial_consultation BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS consultation_notes TEXT;

-- Create patient intake forms table
CREATE TABLE IF NOT EXISTS patient_intake_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  therapist_id UUID REFERENCES profiles(id),
  form_type TEXT NOT NULL DEFAULT 'general' CHECK (form_type IN ('general', 'depression', 'anxiety', 'trauma', 'substance_abuse')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'reviewed', 'approved')),
  
  -- Basic information
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  
  -- Medical history
  current_medications TEXT,
  allergies TEXT,
  medical_conditions TEXT,
  previous_mental_health_treatment BOOLEAN DEFAULT false,
  previous_therapists TEXT,
  
  -- Current symptoms and concerns
  primary_concerns TEXT,
  symptoms_description TEXT,
  symptom_duration TEXT,
  triggers TEXT,
  
  -- Goals and preferences
  therapy_goals TEXT,
  preferred_therapy_style TEXT,
  session_frequency_preference TEXT,
  
  -- Additional information
  substance_use TEXT,
  sleep_patterns TEXT,
  support_system TEXT,
  cultural_considerations TEXT,
  
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id),
  therapist_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('consultation_booked', 'consultation_reminder', 'intake_form_submitted', 'intake_form_reviewed', 'appointment_scheduled', 'appointment_reminder', 'message_received', 'system_update')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT false,
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- Insert default consultation types
INSERT INTO consultation_types (name, description, duration_minutes, price, is_free) VALUES
('Free 15-minute Consultation', 'Brief introductory call to discuss your needs and determine if we''re a good fit', 15, 0.00, true),
('Full Initial Session', 'Complete 50-minute intake session to begin your therapeutic journey', 50, 150.00, false),
('Phone Consultation', '15-minute phone consultation for quick questions', 15, 0.00, true)
ON CONFLICT DO NOTHING;

-- Enable RLS on new tables
ALTER TABLE consultation_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE initial_consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_intake_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for consultation_types (read-only for authenticated users)
CREATE POLICY "Everyone can view consultation types" ON consultation_types
  FOR SELECT USING (auth.role() = 'authenticated');

-- RLS policies for initial_consultations
CREATE POLICY "Users can view their own consultations" ON initial_consultations
  FOR SELECT USING (auth.uid() = patient_id OR auth.uid() = therapist_id);

CREATE POLICY "Patients can create consultations" ON initial_consultations
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Therapists can update their consultations" ON initial_consultations
  FOR UPDATE USING (auth.uid() = therapist_id);

-- RLS policies for patient_intake_forms
CREATE POLICY "Users can view their own intake forms" ON patient_intake_forms
  FOR SELECT USING (auth.uid() = patient_id OR auth.uid() = therapist_id);

CREATE POLICY "Patients can manage their intake forms" ON patient_intake_forms
  FOR ALL USING (auth.uid() = patient_id);

CREATE POLICY "Therapists can view and update assigned intake forms" ON patient_intake_forms
  FOR ALL USING (auth.uid() = therapist_id);

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_initial_consultations_patient_id ON initial_consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_initial_consultations_therapist_id ON initial_consultations(therapist_id);
CREATE INDEX IF NOT EXISTS idx_patient_intake_forms_patient_id ON patient_intake_forms(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_intake_forms_therapist_id ON patient_intake_forms(therapist_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Create function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT '{}'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (p_user_id, p_type, p_title, p_message, p_data)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Create trigger to send consultation booking notifications
CREATE OR REPLACE FUNCTION notify_consultation_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Notify therapist
  PERFORM create_notification(
    NEW.therapist_id,
    'consultation_booked',
    'New Consultation Booked',
    'A new consultation has been booked with you.',
    jsonb_build_object('consultation_id', NEW.id, 'patient_id', NEW.patient_id)
  );
  
  -- Notify patient
  PERFORM create_notification(
    NEW.patient_id,
    'consultation_booked',
    'Consultation Confirmed',
    'Your consultation has been successfully booked.',
    jsonb_build_object('consultation_id', NEW.id, 'therapist_id', NEW.therapist_id)
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_consultation_booking
  AFTER INSERT ON initial_consultations
  FOR EACH ROW
  EXECUTE FUNCTION notify_consultation_booking();

-- Create trigger to notify intake form submission
CREATE OR REPLACE FUNCTION notify_intake_form_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.status = 'submitted' AND OLD.status = 'draft' THEN
    -- Notify therapist if assigned
    IF NEW.therapist_id IS NOT NULL THEN
      PERFORM create_notification(
        NEW.therapist_id,
        'intake_form_submitted',
        'New Intake Form Submitted',
        'A patient has submitted their intake form for review.',
        jsonb_build_object('form_id', NEW.id, 'patient_id', NEW.patient_id)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_intake_form_submission
  AFTER UPDATE ON patient_intake_forms
  FOR EACH ROW
  EXECUTE FUNCTION notify_intake_form_submission();
