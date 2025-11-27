
-- Create table for appointment notification preferences
CREATE TABLE IF NOT EXISTS public.appointment_notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  notification_type TEXT NOT NULL CHECK (notification_type IN ('email', 'sms', 'both', 'none')),
  reminder_time_hours INTEGER NOT NULL DEFAULT 24,
  phone_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Ensure one record per user per appointment
  UNIQUE (appointment_id, user_id)
);

-- Add RLS policies
ALTER TABLE public.appointment_notification_preferences ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own notification preferences
CREATE POLICY "Users can view their own notification preferences" 
  ON public.appointment_notification_preferences 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Allow users to create notification preferences for their appointments
CREATE POLICY "Users can create notification preferences for their appointments" 
  ON public.appointment_notification_preferences 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their notification preferences
CREATE POLICY "Users can update their notification preferences" 
  ON public.appointment_notification_preferences 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Allow users to delete their notification preferences
CREATE POLICY "Users can delete their notification preferences" 
  ON public.appointment_notification_preferences 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_appointment_notification_preferences_updated_at
BEFORE UPDATE ON public.appointment_notification_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
