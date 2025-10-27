-- Fix webrtc_recovery_data table RLS policies to prevent 406 errors
-- The 406 error suggests content negotiation issues, likely from strict RLS

-- Check if the table exists and update/create proper RLS policies
DO $$
BEGIN
    -- Create table if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'webrtc_recovery_data') THEN
        CREATE TABLE public.webrtc_recovery_data (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            session_id UUID NOT NULL,
            user_id UUID NOT NULL,
            connection_data JSONB DEFAULT '{}',
            recovery_attempts INTEGER DEFAULT 0,
            last_recovery_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            CONSTRAINT unique_session_user UNIQUE(session_id, user_id)
        );

        -- Enable RLS
        ALTER TABLE public.webrtc_recovery_data ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can read their own recovery data" ON public.webrtc_recovery_data;
    DROP POLICY IF EXISTS "Users can insert their own recovery data" ON public.webrtc_recovery_data;
    DROP POLICY IF EXISTS "Users can update their own recovery data" ON public.webrtc_recovery_data;
    DROP POLICY IF EXISTS "Users can delete their own recovery data" ON public.webrtc_recovery_data;

    -- Create updated RLS policies with better error handling
    CREATE POLICY "Users can read their own recovery data"
        ON public.webrtc_recovery_data
        FOR SELECT
        USING (
            auth.uid() IS NOT NULL AND 
            user_id = auth.uid()
        );

    CREATE POLICY "Users can insert their own recovery data"
        ON public.webrtc_recovery_data
        FOR INSERT
        WITH CHECK (
            auth.uid() IS NOT NULL AND 
            user_id = auth.uid()
        );

    CREATE POLICY "Users can update their own recovery data"
        ON public.webrtc_recovery_data
        FOR UPDATE
        USING (
            auth.uid() IS NOT NULL AND 
            user_id = auth.uid()
        )
        WITH CHECK (
            auth.uid() IS NOT NULL AND 
            user_id = auth.uid()
        );

    CREATE POLICY "Users can delete their own recovery data"
        ON public.webrtc_recovery_data
        FOR DELETE
        USING (
            auth.uid() IS NOT NULL AND 
            user_id = auth.uid()
        );

END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_webrtc_recovery_session_user ON public.webrtc_recovery_data(session_id, user_id);
CREATE INDEX IF NOT EXISTS idx_webrtc_recovery_user ON public.webrtc_recovery_data(user_id);
CREATE INDEX IF NOT EXISTS idx_webrtc_recovery_created_at ON public.webrtc_recovery_data(created_at);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_webrtc_recovery_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_webrtc_recovery_updated_at ON public.webrtc_recovery_data;
CREATE TRIGGER update_webrtc_recovery_updated_at
    BEFORE UPDATE ON public.webrtc_recovery_data
    FOR EACH ROW
    EXECUTE FUNCTION public.update_webrtc_recovery_updated_at();