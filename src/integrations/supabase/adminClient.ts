
// WARNING: DEVELOPMENT USE ONLY
// This client uses a fallback to the regular client to avoid API key issues
// NEVER use this in production or expose it to the browser in a real application

import { supabase } from './client';

// Export the regular supabase client as a fallback to avoid API key issues
export const adminSupabase = supabase;
