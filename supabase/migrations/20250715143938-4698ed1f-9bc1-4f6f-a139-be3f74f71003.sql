-- Enable real-time for patient tables
ALTER publication supabase_realtime ADD TABLE mood_entries;
ALTER publication supabase_realtime ADD TABLE patient_goals;
ALTER publication supabase_realtime ADD TABLE patient_resources;
ALTER publication supabase_realtime ADD TABLE appointments;
ALTER publication supabase_realtime ADD TABLE patient_inquiries;
ALTER publication supabase_realtime ADD TABLE inquiry_responses;
ALTER publication supabase_realtime ADD TABLE notifications;

-- Set replica identity to full for complete row data in real-time updates
ALTER TABLE mood_entries REPLICA IDENTITY FULL;
ALTER TABLE patient_goals REPLICA IDENTITY FULL;
ALTER TABLE patient_resources REPLICA IDENTITY FULL;
ALTER TABLE appointments REPLICA IDENTITY FULL;
ALTER TABLE patient_inquiries REPLICA IDENTITY FULL;
ALTER TABLE inquiry_responses REPLICA IDENTITY FULL;
ALTER TABLE notifications REPLICA IDENTITY FULL;