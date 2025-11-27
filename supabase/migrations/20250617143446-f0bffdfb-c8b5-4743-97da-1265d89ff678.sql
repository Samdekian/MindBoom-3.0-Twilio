
-- Create treatment_plans table for therapist treatment planning
CREATE TABLE public.treatment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create treatment_goals table for individual goals within plans
CREATE TABLE public.treatment_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  treatment_plan_id UUID NOT NULL REFERENCES public.treatment_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'on_hold')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create patient_notes table for session notes and progress tracking
CREATE TABLE public.patient_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  treatment_plan_id UUID REFERENCES public.treatment_plans(id) ON DELETE SET NULL,
  note_type TEXT NOT NULL DEFAULT 'session' CHECK (note_type IN ('session', 'progress', 'assessment', 'general')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_private BOOLEAN DEFAULT false,
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create session_recordings table for video session metadata
CREATE TABLE public.session_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  recording_url TEXT,
  storage_provider TEXT DEFAULT 'supabase',
  file_size_bytes BIGINT,
  duration_seconds INTEGER,
  recording_status TEXT NOT NULL DEFAULT 'pending' CHECK (recording_status IN ('pending', 'processing', 'ready', 'failed', 'deleted')),
  consent_given BOOLEAN NOT NULL DEFAULT false,
  retention_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX idx_treatment_plans_patient_id ON public.treatment_plans(patient_id);
CREATE INDEX idx_treatment_plans_therapist_id ON public.treatment_plans(therapist_id);
CREATE INDEX idx_treatment_plans_status ON public.treatment_plans(status);

CREATE INDEX idx_treatment_goals_plan_id ON public.treatment_goals(treatment_plan_id);
CREATE INDEX idx_treatment_goals_status ON public.treatment_goals(status);

CREATE INDEX idx_patient_notes_patient_id ON public.patient_notes(patient_id);
CREATE INDEX idx_patient_notes_therapist_id ON public.patient_notes(therapist_id);
CREATE INDEX idx_patient_notes_appointment_id ON public.patient_notes(appointment_id);
CREATE INDEX idx_patient_notes_note_type ON public.patient_notes(note_type);

CREATE INDEX idx_session_recordings_appointment_id ON public.session_recordings(appointment_id);
CREATE INDEX idx_session_recordings_status ON public.session_recordings(recording_status);

-- Add RLS policies for treatment_plans
ALTER TABLE public.treatment_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Therapists can manage their treatment plans"
ON public.treatment_plans
FOR ALL
USING (
  therapist_id = auth.uid() OR 
  public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Patients can view their treatment plans"
ON public.treatment_plans
FOR SELECT
USING (
  patient_id = auth.uid() OR 
  therapist_id = auth.uid() OR 
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Add RLS policies for treatment_goals
ALTER TABLE public.treatment_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Treatment goals access based on plan access"
ON public.treatment_goals
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.treatment_plans tp 
    WHERE tp.id = treatment_plan_id 
    AND (
      tp.therapist_id = auth.uid() OR 
      tp.patient_id = auth.uid() OR 
      public.has_role(auth.uid(), 'admin'::app_role)
    )
  )
);

-- Add RLS policies for patient_notes
ALTER TABLE public.patient_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Therapists can manage patient notes"
ON public.patient_notes
FOR ALL
USING (
  therapist_id = auth.uid() OR 
  public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Patients can view non-private notes"
ON public.patient_notes
FOR SELECT
USING (
  patient_id = auth.uid() AND is_private = false OR
  therapist_id = auth.uid() OR 
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Add RLS policies for session_recordings
ALTER TABLE public.session_recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Session recordings access based on appointment"
ON public.session_recordings
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
CREATE TRIGGER update_treatment_plans_updated_at
  BEFORE UPDATE ON public.treatment_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_timestamp();

CREATE TRIGGER update_treatment_goals_updated_at
  BEFORE UPDATE ON public.treatment_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_timestamp();

CREATE TRIGGER update_patient_notes_updated_at
  BEFORE UPDATE ON public.patient_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_timestamp();

CREATE TRIGGER update_session_recordings_updated_at
  BEFORE UPDATE ON public.session_recordings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_timestamp();
