-- Add test therapist data if none exists
INSERT INTO profiles (id, full_name, account_type, approval_status, accepting_new_patients, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Dr. ' || name || ' Smith',
  'therapist',
  'approved',
  true,
  now(),
  now()
FROM unnest(ARRAY['Sarah', 'Michael', 'Jessica']) AS name
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE account_type = 'therapist' AND full_name LIKE 'Dr. %');