-- Create chat_usage table for tracking AI chat token usage
CREATE TABLE IF NOT EXISTS chat_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add index for faster queries by user_id
CREATE INDEX IF NOT EXISTS idx_chat_usage_user_id ON chat_usage(user_id);

-- Add index for created_at for analytics
CREATE INDEX IF NOT EXISTS idx_chat_usage_created_at ON chat_usage(created_at);

-- Enable Row Level Security
ALTER TABLE chat_usage ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only view their own chat usage
CREATE POLICY "Users can view own chat usage"
  ON chat_usage
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own chat usage
CREATE POLICY "Users can insert own chat usage"
  ON chat_usage
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Service role can do anything (for edge functions)
CREATE POLICY "Service role has full access"
  ON chat_usage
  FOR ALL
  USING (auth.role() = 'service_role');

