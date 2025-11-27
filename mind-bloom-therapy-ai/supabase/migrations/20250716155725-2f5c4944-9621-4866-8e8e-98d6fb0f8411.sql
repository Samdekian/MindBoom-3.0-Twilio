-- Add test availability slots for existing therapists
INSERT INTO therapist_availability_slots (therapist_id, slot_date, slot_start_time, slot_end_time, is_available, slot_type, max_bookings, current_bookings, created_at, updated_at)
SELECT 
  p.id,
  CURRENT_DATE + (d.day_num || ' days')::interval,
  '09:00'::time + (h.hour_num || ' hours')::interval,
  '09:00'::time + ((h.hour_num + 1) || ' hours')::interval,
  true,
  'regular',
  1,
  0,
  now(),
  now()
FROM profiles p 
CROSS JOIN generate_series(1, 5) AS d(day_num)
CROSS JOIN generate_series(0, 7) AS h(hour_num)
WHERE p.account_type = 'therapist' 
AND p.approval_status = 'approved'
AND NOT EXISTS (SELECT 1 FROM therapist_availability_slots WHERE therapist_id = p.id)
LIMIT 20;