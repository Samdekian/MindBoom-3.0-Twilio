-- Ensure session_status column exists in instant_sessions table (if not already added)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='instant_sessions' 
        AND column_name='session_status'
    ) THEN
        ALTER TABLE public.instant_sessions 
        ADD COLUMN session_status text DEFAULT 'created' 
        CHECK (session_status IN ('created', 'waiting', 'active', 'ended'));
    END IF;
END$$;