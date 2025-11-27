-- Fix RLS policies for instant_session_participants to avoid infinite recursion

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view participants in their sessions" ON public.instant_session_participants;

-- Create simplified policy that doesn't reference the same table
CREATE POLICY "Users can view participants in sessions they're in"
  ON public.instant_session_participants
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.instant_sessions
      WHERE id = session_id 
      AND therapist_id = auth.uid()
    )
  );