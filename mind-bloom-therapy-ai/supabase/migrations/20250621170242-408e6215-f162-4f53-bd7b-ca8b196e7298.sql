
-- Extend profiles table with therapist-specific fields
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS years_experience INTEGER,
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS accepting_new_patients BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS languages_spoken TEXT[],
ADD COLUMN IF NOT EXISTS practice_type TEXT DEFAULT 'individual';

-- Create therapist_specializations table
CREATE TABLE IF NOT EXISTS therapist_specializations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create therapist_profile_specializations junction table
CREATE TABLE IF NOT EXISTS therapist_profile_specializations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  specialization_id UUID NOT NULL REFERENCES therapist_specializations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(therapist_id, specialization_id)
);

-- Create insurance_providers table
CREATE TABLE IF NOT EXISTS insurance_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  type TEXT DEFAULT 'health_insurance',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create therapist_insurance_providers junction table
CREATE TABLE IF NOT EXISTS therapist_insurance_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  insurance_provider_id UUID NOT NULL REFERENCES insurance_providers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(therapist_id, insurance_provider_id)
);

-- Create therapist_credentials table
CREATE TABLE IF NOT EXISTS therapist_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  credential_type TEXT NOT NULL, -- 'license', 'certification', 'degree', 'training'
  name TEXT NOT NULL,
  issuing_organization TEXT,
  credential_number TEXT,
  issue_date DATE,
  expiration_date DATE,
  verified BOOLEAN DEFAULT false,
  verification_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create therapist_education table
CREATE TABLE IF NOT EXISTS therapist_education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  institution_name TEXT NOT NULL,
  degree_type TEXT NOT NULL, -- 'Bachelor', 'Master', 'Doctorate', 'Certificate'
  field_of_study TEXT NOT NULL,
  graduation_year INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert common specializations
INSERT INTO therapist_specializations (name, description, category) VALUES
('Anxiety & Depression', 'Treatment of anxiety disorders and depression', 'mental_health'),
('Trauma & PTSD', 'Specialized treatment for trauma and post-traumatic stress', 'trauma'),
('Relationship Counseling', 'Couples and relationship therapy', 'relationships'),
('Family Therapy', 'Family systems and family counseling', 'family'),
('Addiction Counseling', 'Substance abuse and addiction treatment', 'addiction'),
('Child Psychology', 'Mental health treatment for children', 'developmental'),
('Adolescent Therapy', 'Mental health treatment for teenagers', 'developmental'),
('Grief Counseling', 'Bereavement and loss counseling', 'life_transitions'),
('Eating Disorders', 'Treatment of eating disorders and body image issues', 'eating_disorders'),
('ADHD & Learning Disabilities', 'Treatment for attention and learning challenges', 'neurodevelopmental'),
('Career Counseling', 'Career guidance and work-related stress', 'career'),
('LGBTQ+ Affirmative Therapy', 'Specialized therapy for LGBTQ+ individuals', 'identity'),
('Cognitive Behavioral Therapy (CBT)', 'Evidence-based CBT approach', 'therapy_approach'),
('Dialectical Behavior Therapy (DBT)', 'DBT for emotional regulation', 'therapy_approach'),
('EMDR', 'Eye Movement Desensitization and Reprocessing', 'therapy_approach'),
('Mindfulness-Based Therapy', 'Mindfulness and meditation-based treatment', 'therapy_approach')
ON CONFLICT (name) DO NOTHING;

-- Insert common insurance providers
INSERT INTO insurance_providers (name, type, description) VALUES
('Blue Cross Blue Shield', 'health_insurance', 'Major health insurance provider'),
('Aetna', 'health_insurance', 'Health insurance and benefits company'),
('Cigna', 'health_insurance', 'Global health insurance provider'),
('UnitedHealthcare', 'health_insurance', 'Largest health insurance company in the US'),
('Humana', 'health_insurance', 'Health insurance and wellness company'),
('Kaiser Permanente', 'health_insurance', 'Integrated health care system'),
('Medicaid', 'government', 'State and federal health insurance program'),
('Medicare', 'government', 'Federal health insurance for seniors'),
('Tricare', 'government', 'Military health insurance'),
('Self-Pay', 'private_pay', 'Private payment without insurance'),
('Employee Assistance Program (EAP)', 'eap', 'Employer-sponsored mental health benefits')
ON CONFLICT (name) DO NOTHING;

-- Add RLS policies
ALTER TABLE therapist_specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_profile_specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_insurance_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_education ENABLE ROW LEVEL SECURITY;

-- RLS policies for specializations (read-only for all authenticated users)
CREATE POLICY "Everyone can view specializations" ON therapist_specializations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Everyone can view insurance providers" ON insurance_providers
  FOR SELECT USING (auth.role() = 'authenticated');

-- RLS policies for therapist profile specializations
CREATE POLICY "Therapists can manage their specializations" ON therapist_profile_specializations
  FOR ALL USING (auth.uid() = therapist_id);

CREATE POLICY "Everyone can view therapist specializations" ON therapist_profile_specializations
  FOR SELECT USING (auth.role() = 'authenticated');

-- RLS policies for therapist insurance providers
CREATE POLICY "Therapists can manage their insurance providers" ON therapist_insurance_providers
  FOR ALL USING (auth.uid() = therapist_id);

CREATE POLICY "Everyone can view therapist insurance" ON therapist_insurance_providers
  FOR SELECT USING (auth.role() = 'authenticated');

-- RLS policies for therapist credentials
CREATE POLICY "Therapists can manage their credentials" ON therapist_credentials
  FOR ALL USING (auth.uid() = therapist_id);

CREATE POLICY "Everyone can view verified credentials" ON therapist_credentials
  FOR SELECT USING (auth.role() = 'authenticated' AND verified = true);

-- RLS policies for therapist education
CREATE POLICY "Therapists can manage their education" ON therapist_education
  FOR ALL USING (auth.uid() = therapist_id);

CREATE POLICY "Everyone can view therapist education" ON therapist_education
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_therapist_profile_specializations_therapist_id ON therapist_profile_specializations(therapist_id);
CREATE INDEX IF NOT EXISTS idx_therapist_insurance_providers_therapist_id ON therapist_insurance_providers(therapist_id);
CREATE INDEX IF NOT EXISTS idx_therapist_credentials_therapist_id ON therapist_credentials(therapist_id);
CREATE INDEX IF NOT EXISTS idx_therapist_education_therapist_id ON therapist_education(therapist_id);
CREATE INDEX IF NOT EXISTS idx_profiles_accepting_new_patients ON profiles(accepting_new_patients) WHERE account_type = 'therapist';
CREATE INDEX IF NOT EXISTS idx_profiles_hourly_rate ON profiles(hourly_rate) WHERE account_type = 'therapist';
