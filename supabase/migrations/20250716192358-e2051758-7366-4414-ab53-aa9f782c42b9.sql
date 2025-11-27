-- Add foreign key constraints to patient_assignments table to enable PostgREST foreign key syntax
ALTER TABLE patient_assignments 
ADD CONSTRAINT patient_assignments_patient_id_fkey 
FOREIGN KEY (patient_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE patient_assignments 
ADD CONSTRAINT patient_assignments_therapist_id_fkey 
FOREIGN KEY (therapist_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Also add foreign key for assigned_by to track who made the assignment
ALTER TABLE patient_assignments 
ADD CONSTRAINT patient_assignments_assigned_by_fkey 
FOREIGN KEY (assigned_by) REFERENCES profiles(id) ON DELETE SET NULL;