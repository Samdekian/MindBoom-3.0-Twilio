
-- Create RLS policy to allow therapists to view profiles of their assigned patients
CREATE POLICY "Therapists can view their assigned patients' profiles" 
ON public.profiles 
FOR SELECT 
USING (
  account_type = 'patient' 
  AND EXISTS (
    SELECT 1 FROM patient_assignments pa
    WHERE pa.patient_id = profiles.id 
    AND pa.therapist_id = auth.uid()
    AND pa.status = 'active'
  )
);

-- Also allow therapists to view other therapist profiles (for collaboration)
CREATE POLICY "Therapists can view other therapist profiles" 
ON public.profiles 
FOR SELECT 
USING (
  account_type = 'therapist' 
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() 
    AND r.name = 'therapist'
  )
);
