
import { supabase } from "@/integrations/supabase/client";

export async function refreshCalendlyToken(userId: string) {
  try {
    // Fetch current therapist settings
    const { data: settings, error: fetchError } = await supabase
      .from('therapist_settings')
      .select('refresh_token, access_token, token_expires_at')
      .eq('user_id', userId)
      .single();

    if (fetchError || !settings) {
      throw new Error('Could not fetch therapist settings');
    }

    // Check if token is still valid
    if (new Date(settings.token_expires_at) > new Date()) {
      return settings.access_token;
    }

    // Refresh token
    const tokenResponse = await fetch('https://auth.calendly.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: import.meta.env.VITE_CALENDLY_CLIENT_ID,
        client_secret: import.meta.env.VITE_CALENDLY_CLIENT_SECRET,
        refresh_token: settings.refresh_token
      })
    });

    const tokens = await tokenResponse.json();

    // Update settings with new token
    const { error: updateError } = await supabase
      .from('therapist_settings')
      .update({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      throw updateError;
    }

    return tokens.access_token;
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
}
