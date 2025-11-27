
-- Add RLS policy to allow patients to insert their own appointments
CREATE POLICY "Patients can insert their own appointments" 
ON public.appointments 
FOR INSERT 
TO public 
WITH CHECK (patient_id = auth.uid());

-- Also add a policy to allow patients to view their own appointments
CREATE POLICY "Patients can view their own appointments" 
ON public.appointments 
FOR SELECT 
TO public 
USING (patient_id = auth.uid());

-- Add a policy to allow therapists to view appointments they are assigned to
CREATE POLICY "Therapists can view their assigned appointments" 
ON public.appointments 
FOR SELECT 
TO public 
USING (therapist_id = auth.uid());

-- Add a policy to allow therapists to update their assigned appointments
CREATE POLICY "Therapists can update their assigned appointments" 
ON public.appointments 
FOR UPDATE 
TO public 
USING (therapist_id = auth.uid());
