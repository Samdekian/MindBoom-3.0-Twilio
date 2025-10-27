
import { createClient } from '@supabase/supabase-js';

// Get Supabase configuration from environment variables
// In production, these should be set via your hosting platform's environment variable system
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mlevmxueubhwfezfujxa.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sZXZteHVldWJod2ZlemZ1anhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MjY0NjgsImV4cCI6MjA1OTIwMjQ2OH0.hDfCn3jPrAf-Tmru1jB3W3liMUtw8QXzC-4jzt99A3I';

// Validate configuration in production
if (import.meta.env.VITE_APP_ENV === 'production') {
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.error('❌ Missing required Supabase environment variables in production mode');
    console.error('Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
});

// Add a helper function to check connection
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('roles').select('count').limit(1);
    if (error) {
      console.error('Supabase connection check failed:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase connection error:', err);
    return false;
  }
};
