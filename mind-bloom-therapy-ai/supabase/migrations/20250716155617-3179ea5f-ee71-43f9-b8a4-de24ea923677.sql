-- Create RLS policies for therapist_availability_slots (dropping any conflicting ones first)
DROP POLICY IF EXISTS "Therapists can manage their own availability slots" ON therapist_availability_slots;
CREATE POLICY "Therapists can manage their own availability slots"
ON therapist_availability_slots
FOR ALL 
USING (therapist_id = auth.uid())
WITH CHECK (therapist_id = auth.uid());

-- Create RLS policies for therapist_availability (dropping any conflicting ones first)
DROP POLICY IF EXISTS "Therapists can manage their own availability" ON therapist_availability;
CREATE POLICY "Therapists can manage their own availability"
ON therapist_availability
FOR ALL
USING (therapist_id = auth.uid())
WITH CHECK (therapist_id = auth.uid());