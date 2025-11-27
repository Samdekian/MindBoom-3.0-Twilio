-- Create mood entries table for tracking patient mood over time
CREATE TABLE public.mood_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  mood_value INTEGER NOT NULL CHECK (mood_value >= 1 AND mood_value <= 5),
  mood_label TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create resources table for storing patient resources
CREATE TABLE public.patient_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT NOT NULL DEFAULT 'article', -- 'article', 'video', 'audio', 'exercise'
  content_url TEXT,
  file_path TEXT,
  tags TEXT[],
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patient goals table for tracking therapy goals
CREATE TABLE public.patient_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  therapist_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed', 'paused', 'cancelled'
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_goals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for mood_entries
CREATE POLICY "Patients can view their own mood entries" 
ON public.mood_entries 
FOR SELECT 
USING (auth.uid() = patient_id);

CREATE POLICY "Patients can create their own mood entries" 
ON public.mood_entries 
FOR INSERT 
WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can update their own mood entries" 
ON public.mood_entries 
FOR UPDATE 
USING (auth.uid() = patient_id);

CREATE POLICY "Therapists can view patient mood entries" 
ON public.mood_entries 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM patient_assignments pa 
  WHERE pa.patient_id = mood_entries.patient_id 
  AND pa.therapist_id = auth.uid() 
  AND pa.status = 'active'
));

-- Create RLS policies for patient_resources
CREATE POLICY "Everyone can view active resources" 
ON public.patient_resources 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Therapists can manage resources" 
ON public.patient_resources 
FOR ALL 
USING (has_role(auth.uid(), 'therapist') OR has_role(auth.uid(), 'admin'));

-- Create RLS policies for patient_goals
CREATE POLICY "Patients can view their own goals" 
ON public.patient_goals 
FOR SELECT 
USING (auth.uid() = patient_id);

CREATE POLICY "Patients can update their own goals progress" 
ON public.patient_goals 
FOR UPDATE 
USING (auth.uid() = patient_id);

CREATE POLICY "Therapists can manage patient goals" 
ON public.patient_goals 
FOR ALL 
USING (auth.uid() = therapist_id OR EXISTS (
  SELECT 1 FROM patient_assignments pa 
  WHERE pa.patient_id = patient_goals.patient_id 
  AND pa.therapist_id = auth.uid() 
  AND pa.status = 'active'
));

-- Create update timestamp triggers
CREATE TRIGGER update_mood_entries_updated_at
BEFORE UPDATE ON public.mood_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patient_resources_updated_at
BEFORE UPDATE ON public.patient_resources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patient_goals_updated_at
BEFORE UPDATE ON public.patient_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();