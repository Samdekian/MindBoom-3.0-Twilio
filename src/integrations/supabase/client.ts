
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

/**
 * Optimized Supabase client for Vercel deployment
 * 
 * Performance optimizations:
 * - keepalive: true for connection reuse (reduces cold start impact)
 * - PKCE flow for faster and more secure authentication
 * - Realtime disabled during auth (reduces overhead)
 * - Custom fetch with connection keepalive
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'mindbloom-auth', // Namespace to avoid conflicts
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    flowType: 'pkce', // More secure and faster than implicit flow
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Info': 'mindbloom-web@1.0.0',
    },
    // Custom fetch with keepalive for connection reuse
    fetch: (url, options = {}) => {
      return fetch(url, {
        ...options,
        keepalive: true, // Reuse connections for better performance
      });
    },
  },
  realtime: {
    // Optimize realtime connection params
    params: {
      eventsPerSecond: 2, // Rate limit realtime events
    },
  },
});

// Pre-warm the connection on client load (non-blocking)
// This reduces cold start impact by initiating connection early
if (typeof window !== 'undefined') {
  // Initialize session check in background (don't await)
  supabase.auth.getSession().catch(() => {
    // Silently fail - this is just a warm-up
  });
}

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
