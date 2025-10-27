
-- First, let's create the main relationship table
CREATE TABLE IF NOT EXISTS patient_therapist_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  relationship_status TEXT NOT NULL DEFAULT 'inquiry' CHECK (relationship_status IN ('inquiry', 'consultation_scheduled', 'consultation_completed', 'active', 'on_hold', 'completed', 'terminated')),
  start_date DATE,
  end_date DATE,
  termination_reason TEXT,
  created_from_inquiry_id UUID REFERENCES patient_inquiries(id),
  created_from_consultation_id UUID REFERENCES initial_consultations(id),
  relationship_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(patient_id, therapist_id)
);

-- Enable RLS
ALTER TABLE patient_therapist_relationships ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
CREATE POLICY "Users can view their own relationships" ON patient_therapist_relationships
  FOR SELECT USING (auth.uid() = patient_id OR auth.uid() = therapist_id);

CREATE POLICY "Users can create relationships for themselves" ON patient_therapist_relationships
  FOR INSERT WITH CHECK (auth.uid() = patient_id OR auth.uid() = therapist_id);

CREATE POLICY "Users can update their own relationships" ON patient_therapist_relationships
  FOR UPDATE USING (auth.uid() = patient_id OR auth.uid() = therapist_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_patient_therapist_relationships_patient_id ON patient_therapist_relationships(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_therapist_relationships_therapist_id ON patient_therapist_relationships(therapist_id);
CREATE INDEX IF NOT EXISTS idx_patient_therapist_relationships_status ON patient_therapist_relationships(relationship_status);
