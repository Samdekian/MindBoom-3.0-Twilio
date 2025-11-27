
-- Enable RLS on profiles table (if not already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to allow anyone to view approved therapist profiles
CREATE POLICY "Anyone can view approved therapist profiles" 
ON public.profiles 
FOR SELECT 
USING (
  account_type = 'therapist' 
  AND approval_status = 'approved'
);
