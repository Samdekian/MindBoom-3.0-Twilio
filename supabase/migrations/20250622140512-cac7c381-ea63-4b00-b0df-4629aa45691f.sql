
-- Create patient inquiries table
CREATE TABLE IF NOT EXISTS patient_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  inquiry_type TEXT DEFAULT 'general' CHECK (inquiry_type IN ('general', 'consultation_request', 'insurance_question', 'scheduling', 'emergency')),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'responded', 'resolved', 'closed')),
  preferred_contact_method TEXT DEFAULT 'email' CHECK (preferred_contact_method IN ('email', 'phone', 'video_call', 'in_app')),
  patient_phone TEXT,
  patient_email TEXT,
  source TEXT DEFAULT 'website' CHECK (source IN ('website', 'referral', 'social_media', 'search', 'advertisement', 'directory')),
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  responded_at TIMESTAMPTZ,
  responded_by UUID REFERENCES profiles(id),
  response_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create therapist search settings table
CREATE TABLE IF NOT EXISTS therapist_search_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  is_featured BOOLEAN DEFAULT false,
  featured_until TIMESTAMPTZ,
  search_keywords TEXT[],
  profile_boost_score INTEGER DEFAULT 0,
  visibility_status TEXT DEFAULT 'public' CHECK (visibility_status IN ('public', 'limited', 'private')),
  allow_inquiries BOOLEAN DEFAULT true,
  auto_respond_enabled BOOLEAN DEFAULT false,
  auto_respond_message TEXT,
  max_inquiries_per_day INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create therapist analytics table
CREATE TABLE IF NOT EXISTS therapist_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  profile_views INTEGER DEFAULT 0,
  inquiry_count INTEGER DEFAULT 0,
  consultation_bookings INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0.00,
  response_time_minutes INTEGER DEFAULT 0,
  patient_source_breakdown JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(therapist_id, metric_date)
);

-- Create patient source attribution table
CREATE TABLE IF NOT EXISTS patient_source_attribution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('inquiry', 'consultation_booking', 'appointment_booking', 'profile_view')),
  source TEXT NOT NULL,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  referrer_url TEXT,
  device_type TEXT,
  location_data JSONB,
  converted_to_patient BOOLEAN DEFAULT false,
  conversion_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create inquiry responses table
CREATE TABLE IF NOT EXISTS inquiry_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id UUID NOT NULL REFERENCES patient_inquiries(id) ON DELETE CASCADE,
  responder_id UUID NOT NULL REFERENCES profiles(id),
  response_type TEXT DEFAULT 'message' CHECK (response_type IN ('message', 'consultation_offer', 'appointment_booking', 'referral')),
  content TEXT NOT NULL,
  attachments TEXT[],
  is_automated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE patient_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_search_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_source_attribution ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiry_responses ENABLE ROW LEVEL SECURITY;

-- RLS policies for patient_inquiries
CREATE POLICY "Users can view their own inquiries" ON patient_inquiries
  FOR SELECT USING (auth.uid() = patient_id OR auth.uid() = therapist_id);

CREATE POLICY "Patients can create inquiries" ON patient_inquiries
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Therapists can update their inquiries" ON patient_inquiries
  FOR UPDATE USING (auth.uid() = therapist_id);

-- RLS policies for therapist_search_settings
CREATE POLICY "Therapists can manage their search settings" ON therapist_search_settings
  FOR ALL USING (auth.uid() = therapist_id);

CREATE POLICY "Everyone can view public search settings" ON therapist_search_settings
  FOR SELECT USING (visibility_status = 'public');

-- RLS policies for therapist_analytics
CREATE POLICY "Therapists can view their own analytics" ON therapist_analytics
  FOR ALL USING (auth.uid() = therapist_id);

-- RLS policies for patient_source_attribution
CREATE POLICY "Users can view their own attribution data" ON patient_source_attribution
  FOR SELECT USING (auth.uid() = patient_id OR auth.uid() = therapist_id);

CREATE POLICY "System can create attribution data" ON patient_source_attribution
  FOR INSERT WITH CHECK (true);

-- RLS policies for inquiry_responses
CREATE POLICY "Users can view inquiry responses" ON inquiry_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patient_inquiries pi 
      WHERE pi.id = inquiry_id 
      AND (pi.patient_id = auth.uid() OR pi.therapist_id = auth.uid())
    )
  );

CREATE POLICY "Therapists can create responses" ON inquiry_responses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM patient_inquiries pi 
      WHERE pi.id = inquiry_id 
      AND pi.therapist_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patient_inquiries_therapist_id ON patient_inquiries(therapist_id);
CREATE INDEX IF NOT EXISTS idx_patient_inquiries_patient_id ON patient_inquiries(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_inquiries_status ON patient_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_patient_inquiries_created_at ON patient_inquiries(created_at);
CREATE INDEX IF NOT EXISTS idx_therapist_analytics_therapist_id ON therapist_analytics(therapist_id);
CREATE INDEX IF NOT EXISTS idx_therapist_analytics_date ON therapist_analytics(metric_date);
CREATE INDEX IF NOT EXISTS idx_patient_source_attribution_therapist_id ON patient_source_attribution(therapist_id);
CREATE INDEX IF NOT EXISTS idx_patient_source_attribution_patient_id ON patient_source_attribution(patient_id);

-- Function to track profile views
CREATE OR REPLACE FUNCTION track_profile_view(
  p_therapist_id UUID,
  p_viewer_id UUID DEFAULT NULL,
  p_source TEXT DEFAULT 'website',
  p_utm_source TEXT DEFAULT NULL,
  p_utm_medium TEXT DEFAULT NULL,
  p_utm_campaign TEXT DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update daily analytics
  INSERT INTO therapist_analytics (therapist_id, metric_date, profile_views)
  VALUES (p_therapist_id, CURRENT_DATE, 1)
  ON CONFLICT (therapist_id, metric_date)
  DO UPDATE SET 
    profile_views = therapist_analytics.profile_views + 1,
    updated_at = now();
  
  -- Track source attribution if viewer is identified
  IF p_viewer_id IS NOT NULL THEN
    INSERT INTO patient_source_attribution (
      patient_id, therapist_id, source_type, source, 
      utm_source, utm_medium, utm_campaign
    ) VALUES (
      p_viewer_id, p_therapist_id, 'profile_view', p_source,
      p_utm_source, p_utm_medium, p_utm_campaign
    );
  END IF;
END;
$$;

-- Function to calculate conversion rates
CREATE OR REPLACE FUNCTION calculate_therapist_conversion_rate(p_therapist_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS DECIMAL(5,2)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_inquiries INTEGER;
  v_conversions INTEGER;
  v_rate DECIMAL(5,2);
BEGIN
  -- Count inquiries for the date
  SELECT COUNT(*) INTO v_inquiries
  FROM patient_inquiries
  WHERE therapist_id = p_therapist_id
  AND DATE(created_at) = p_date;
  
  -- Count conversions (consultations booked)
  SELECT COUNT(*) INTO v_conversions
  FROM initial_consultations ic
  JOIN patient_inquiries pi ON ic.patient_id = pi.patient_id 
    AND ic.therapist_id = pi.therapist_id
  WHERE ic.therapist_id = p_therapist_id
  AND DATE(pi.created_at) = p_date
  AND DATE(ic.created_at) <= p_date + INTERVAL '7 days'; -- 7-day attribution window
  
  -- Calculate rate
  IF v_inquiries > 0 THEN
    v_rate := (v_conversions::DECIMAL / v_inquiries::DECIMAL) * 100;
  ELSE
    v_rate := 0.00;
  END IF;
  
  -- Update analytics table
  UPDATE therapist_analytics
  SET conversion_rate = v_rate, updated_at = now()
  WHERE therapist_id = p_therapist_id AND metric_date = p_date;
  
  RETURN v_rate;
END;
$$;

-- Trigger to create notifications for new inquiries
CREATE OR REPLACE FUNCTION notify_new_inquiry()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Notify therapist of new inquiry
  PERFORM create_notification(
    NEW.therapist_id,
    'inquiry_received',
    'New Patient Inquiry',
    'You have received a new inquiry from a potential patient.',
    jsonb_build_object(
      'inquiry_id', NEW.id,
      'patient_id', NEW.patient_id,
      'subject', NEW.subject,
      'priority', NEW.priority
    )
  );
  
  -- Update daily analytics
  INSERT INTO therapist_analytics (therapist_id, metric_date, inquiry_count)
  VALUES (NEW.therapist_id, CURRENT_DATE, 1)
  ON CONFLICT (therapist_id, metric_date)
  DO UPDATE SET 
    inquiry_count = therapist_analytics.inquiry_count + 1,
    updated_at = now();
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_new_inquiry
  AFTER INSERT ON patient_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_inquiry();

-- Function to update therapist response time metrics
CREATE OR REPLACE FUNCTION update_response_time_metrics()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_response_time_minutes INTEGER;
BEGIN
  -- Calculate response time in minutes
  SELECT EXTRACT(EPOCH FROM (NEW.responded_at - OLD.created_at)) / 60
  INTO v_response_time_minutes;
  
  -- Update average response time for the day
  UPDATE therapist_analytics
  SET response_time_minutes = (
    CASE 
      WHEN response_time_minutes = 0 THEN v_response_time_minutes
      ELSE (response_time_minutes + v_response_time_minutes) / 2
    END
  ),
  updated_at = now()
  WHERE therapist_id = NEW.therapist_id 
  AND metric_date = DATE(NEW.responded_at);
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_response_time
  AFTER UPDATE OF responded_at ON patient_inquiries
  FOR EACH ROW
  WHEN (OLD.responded_at IS NULL AND NEW.responded_at IS NOT NULL)
  EXECUTE FUNCTION update_response_time_metrics();
