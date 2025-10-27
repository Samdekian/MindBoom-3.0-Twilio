
-- Create a hardcoded patient assignment to link the existing patient to a therapist
-- First, let's get the IDs we need and create the assignment
INSERT INTO patient_assignments (
  patient_id,
  therapist_id,
  status,
  start_date,
  assigned_by,
  assignment_reason,
  priority_level
) 
SELECT 
  p.id as patient_id,
  t.id as therapist_id,
  'active',
  CURRENT_DATE,
  t.id as assigned_by,
  'Initial patient assignment for testing',
  'medium'
FROM profiles p, profiles t
WHERE p.account_type = 'patient' 
  AND t.account_type = 'therapist'
  AND p.full_name = 'Rafael Paciente'
LIMIT 1;

-- Also ensure the user_invitations table exists and has proper structure for email invitations
-- (This table should already exist based on the schema, but let's make sure it's properly set up)
