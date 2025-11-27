-- Ensure therapist_availability_slots table has proper RLS policies
CREATE POLICY IF NOT EXISTS "Therapists can manage their own availability slots"
ON therapist_availability_slots
FOR ALL 
USING (therapist_id = auth.uid())
WITH CHECK (therapist_id = auth.uid());

-- Ensure therapist_availability table has proper RLS policies  
CREATE POLICY IF NOT EXISTS "Therapists can manage their own availability"
ON therapist_availability
FOR ALL
USING (therapist_id = auth.uid())
WITH CHECK (therapist_id = auth.uid());

-- Add some default data for testing (only if tables are empty)
DO $$
BEGIN
  -- Check if we have any therapist profiles
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE account_type = 'therapist' LIMIT 1) THEN
    -- Insert test therapist data if none exists
    INSERT INTO profiles (id, full_name, account_type, approval_status, accepting_new_patients)
    SELECT 
      gen_random_uuid(),
      'Dr. ' || name || ' Smith',
      'therapist',
      'approved',
      true
    FROM unnest(ARRAY['Sarah', 'Michael', 'Jessica']) AS name
    WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE account_type = 'therapist');
  END IF;

  -- Add default availability slots for existing therapists (only if no slots exist)
  IF NOT EXISTS (SELECT 1 FROM therapist_availability_slots LIMIT 1) THEN
    INSERT INTO therapist_availability_slots (therapist_id, slot_date, slot_start_time, slot_end_time, is_available, slot_type, max_bookings, current_bookings)
    SELECT 
      p.id,
      CURRENT_DATE + generate_series(1, 7),
      '09:00'::time,
      '17:00'::time,
      true,
      'regular',
      1,
      0
    FROM profiles p 
    WHERE p.account_type = 'therapist' 
    AND p.approval_status = 'approved'
    AND NOT EXISTS (SELECT 1 FROM therapist_availability_slots WHERE therapist_id = p.id);
  END IF;
END $$;