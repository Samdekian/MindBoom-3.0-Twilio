
-- Create patient groups table for cohort management
CREATE TABLE public.patient_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  group_type TEXT NOT NULL DEFAULT 'custom' CHECK (group_type IN ('custom', 'condition', 'treatment', 'demographic')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patient group memberships table
CREATE TABLE public.patient_group_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  group_id UUID REFERENCES public.patient_groups(id) ON DELETE CASCADE NOT NULL,
  added_by UUID REFERENCES auth.users(id) NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  UNIQUE(patient_id, group_id)
);

-- Create patient tags table
CREATE TABLE public.patient_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6B7280',
  category TEXT DEFAULT 'general',
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  is_system_tag BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(name, created_by)
);

-- Create patient tag assignments table
CREATE TABLE public.patient_tag_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES public.patient_tags(id) ON DELETE CASCADE NOT NULL,
  assigned_by UUID REFERENCES auth.users(id) NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(patient_id, tag_id)
);

-- Create patient search criteria table for saved searches
CREATE TABLE public.patient_search_criteria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  criteria JSONB NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  is_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.patient_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_tag_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_search_criteria ENABLE ROW LEVEL SECURITY;

-- RLS policies for patient_groups
CREATE POLICY "Therapists can view their own groups" ON public.patient_groups
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Therapists can create groups" ON public.patient_groups
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Therapists can update their own groups" ON public.patient_groups
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Therapists can delete their own groups" ON public.patient_groups
  FOR DELETE USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage all groups" ON public.patient_groups
  FOR ALL USING (public.is_admin_bypass_rls(auth.uid()));

-- RLS policies for patient_group_memberships
CREATE POLICY "Therapists can view memberships for their groups" ON public.patient_group_memberships
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patient_groups pg 
      WHERE pg.id = group_id AND pg.created_by = auth.uid()
    )
  );

CREATE POLICY "Therapists can manage memberships for their groups" ON public.patient_group_memberships
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM patient_groups pg 
      WHERE pg.id = group_id AND pg.created_by = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all memberships" ON public.patient_group_memberships
  FOR ALL USING (public.is_admin_bypass_rls(auth.uid()));

-- RLS policies for patient_tags
CREATE POLICY "Therapists can view their own tags" ON public.patient_tags
  FOR SELECT USING (auth.uid() = created_by OR is_system_tag = true);

CREATE POLICY "Therapists can create tags" ON public.patient_tags
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Therapists can update their own tags" ON public.patient_tags
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Therapists can delete their own tags" ON public.patient_tags
  FOR DELETE USING (auth.uid() = created_by AND is_system_tag = false);

CREATE POLICY "Admins can manage all tags" ON public.patient_tags
  FOR ALL USING (public.is_admin_bypass_rls(auth.uid()));

-- RLS policies for patient_tag_assignments
CREATE POLICY "Therapists can view tag assignments for their patients" ON public.patient_tag_assignments
  FOR SELECT USING (
    auth.uid() = assigned_by OR
    EXISTS (
      SELECT 1 FROM patient_assignments pa 
      WHERE pa.patient_id = patient_tag_assignments.patient_id 
      AND pa.therapist_id = auth.uid() 
      AND pa.status = 'active'
    )
  );

CREATE POLICY "Therapists can manage tag assignments for their patients" ON public.patient_tag_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM patient_assignments pa 
      WHERE pa.patient_id = patient_tag_assignments.patient_id 
      AND pa.therapist_id = auth.uid() 
      AND pa.status = 'active'
    )
  );

CREATE POLICY "Admins can manage all tag assignments" ON public.patient_tag_assignments
  FOR ALL USING (public.is_admin_bypass_rls(auth.uid()));

-- RLS policies for patient_search_criteria
CREATE POLICY "Users can view their own saved searches" ON public.patient_search_criteria
  FOR SELECT USING (auth.uid() = created_by OR is_shared = true);

CREATE POLICY "Users can create saved searches" ON public.patient_search_criteria
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own saved searches" ON public.patient_search_criteria
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own saved searches" ON public.patient_search_criteria
  FOR DELETE USING (auth.uid() = created_by);

-- Function to search patients with advanced criteria
CREATE OR REPLACE FUNCTION public.search_patients_advanced(
  p_therapist_id UUID,
  p_search_text TEXT DEFAULT NULL,
  p_tags TEXT[] DEFAULT NULL,
  p_groups UUID[] DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_age_min INTEGER DEFAULT NULL,
  p_age_max INTEGER DEFAULT NULL,
  p_last_session_days INTEGER DEFAULT NULL
)
RETURNS TABLE(
  patient_id UUID,
  full_name TEXT,
  account_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  last_session_date TIMESTAMP WITH TIME ZONE,
  total_sessions BIGINT,
  tags TEXT[],
  groups TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    p.id as patient_id,
    p.full_name,
    p.account_type,
    p.created_at,
    last_appt.start_time as last_session_date,
    COALESCE(session_count.total, 0) as total_sessions,
    COALESCE(patient_tags.tag_names, ARRAY[]::TEXT[]) as tags,
    COALESCE(patient_groups.group_names, ARRAY[]::TEXT[]) as groups
  FROM profiles p
  
  -- Join with patient assignments to get therapist's patients
  JOIN patient_assignments pa ON p.id = pa.patient_id
  
  -- Get last session date
  LEFT JOIN LATERAL (
    SELECT start_time
    FROM appointments a
    WHERE a.patient_id = p.id 
    AND a.therapist_id = p_therapist_id
    AND a.status = 'completed'
    ORDER BY start_time DESC
    LIMIT 1
  ) last_appt ON true
  
  -- Get session count
  LEFT JOIN LATERAL (
    SELECT COUNT(*) as total
    FROM appointments a
    WHERE a.patient_id = p.id 
    AND a.therapist_id = p_therapist_id
    AND a.status = 'completed'
  ) session_count ON true
  
  -- Get patient tags
  LEFT JOIN LATERAL (
    SELECT array_agg(pt.name) as tag_names
    FROM patient_tag_assignments pta
    JOIN patient_tags pt ON pta.tag_id = pt.id
    WHERE pta.patient_id = p.id
  ) patient_tags ON true
  
  -- Get patient groups
  LEFT JOIN LATERAL (
    SELECT array_agg(pg.name) as group_names
    FROM patient_group_memberships pgm
    JOIN patient_groups pg ON pgm.group_id = pg.id
    WHERE pgm.patient_id = p.id
  ) patient_groups ON true
  
  WHERE pa.therapist_id = p_therapist_id
  AND pa.status = 'active'
  AND p.account_type = 'patient'
  
  -- Apply search filters
  AND (p_search_text IS NULL OR p.full_name ILIKE '%' || p_search_text || '%')
  AND (p_status IS NULL OR p.status = p_status)
  AND (p_tags IS NULL OR patient_tags.tag_names && p_tags)
  AND (p_groups IS NULL OR EXISTS (
    SELECT 1 FROM patient_group_memberships pgm2
    WHERE pgm2.patient_id = p.id AND pgm2.group_id = ANY(p_groups)
  ))
  AND (p_last_session_days IS NULL OR 
    last_appt.start_time IS NULL OR 
    last_appt.start_time >= CURRENT_DATE - INTERVAL '1 day' * p_last_session_days
  )
  
  ORDER BY p.full_name;
END;
$$;

-- Insert some default system tags
INSERT INTO public.patient_tags (name, color, category, created_by, is_system_tag) VALUES
  ('High Priority', '#EF4444', 'priority', (SELECT id FROM auth.users ORDER BY created_at LIMIT 1), true),
  ('New Patient', '#10B981', 'status', (SELECT id FROM auth.users ORDER BY created_at LIMIT 1), true),
  ('Anxiety', '#F59E0B', 'condition', (SELECT id FROM auth.users ORDER BY created_at LIMIT 1), true),
  ('Depression', '#8B5CF6', 'condition', (SELECT id FROM auth.users ORDER BY created_at LIMIT 1), true),
  ('PTSD', '#EF4444', 'condition', (SELECT id FROM auth.users ORDER BY created_at LIMIT 1), true),
  ('CBT', '#3B82F6', 'treatment', (SELECT id FROM auth.users ORDER BY created_at LIMIT 1), true),
  ('DBT', '#06B6D4', 'treatment', (SELECT id FROM auth.users ORDER BY created_at LIMIT 1), true);

-- Add updated_at triggers
CREATE TRIGGER update_patient_groups_updated_at
  BEFORE UPDATE ON public.patient_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_search_criteria_updated_at
  BEFORE UPDATE ON public.patient_search_criteria
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
