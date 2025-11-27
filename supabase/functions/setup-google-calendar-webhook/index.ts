
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const googleClientId = Deno.env.get("GOOGLE_CLIENT_ID");
  const googleClientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  try {
    const { calendarId } = await req.json();
    
    if (!calendarId) {
      throw new Error("Calendar ID is required");
    }
    
    // Get the user's ID from the JWT
    const authHeader = req.headers.get("authorization") || "";
    const { data: userData, error: userError } = await fetch(
      `${supabaseUrl}/auth/v1/user`,
      {
        headers: {
          Authorization: authHeader,
          apikey: supabaseServiceKey,
        },
      }
    ).then(r => r.json());
    
    if (userError) {
      throw new Error(`Authentication error: ${userError.message}`);
    }
    
    const userId = userData.id;
    
    // Get the user's Google access token
    const { data: settings, error: settingsError } = await fetch(
      `${supabaseUrl}/rest/v1/therapist_settings?user_id=eq.${userId}`,
      {
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
      }
    ).then(r => r.json());
    
    if (settingsError) {
      throw new Error(`Failed to get user settings: ${settingsError.message}`);
    }
    
    if (!settings?.[0]?.access_token) {
      throw new Error("Google Calendar not connected");
    }
    
    // Check if the token is expired
    const tokenExpiryTime = new Date(settings[0].token_expires_at);
    if (tokenExpiryTime < new Date()) {
      // Refresh the token
      const refreshResp = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: googleClientId ?? "",
          client_secret: googleClientSecret ?? "",
          refresh_token: settings[0].refresh_token,
          grant_type: "refresh_token",
        }).toString(),
      });
      
      if (!refreshResp.ok) {
        throw new Error(`Failed to refresh token: ${await refreshResp.text()}`);
      }
      
      const refreshData = await refreshResp.json();
      const now = new Date();
      
      // Update the access token in the database
      await fetch(
        `${supabaseUrl}/rest/v1/therapist_settings?user_id=eq.${userId}`,
        {
          method: "PATCH",
          headers: {
            apikey: supabaseServiceKey,
            Authorization: `Bearer ${supabaseServiceKey}`,
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
          },
          body: JSON.stringify({
            access_token: refreshData.access_token,
            token_expires_at: new Date(now.getTime() + refreshData.expires_in * 1000).toISOString(),
          }),
        }
      );
      
      // Use the new token
      settings[0].access_token = refreshData.access_token;
    }
    
    // Generate a unique ID for the webhook
    const channelId = crypto.randomUUID();
    const webhookExpiration = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    // Create the webhook with Google Calendar API
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/watch`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${settings[0].access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: channelId,
          type: "web_hook",
          address: `${supabaseUrl}/functions/v1/google-calendar-webhook`,
          token: userId, // Store user ID in token for identification
          expiration: webhookExpiration.getTime().toString(),
        }),
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to create webhook: ${await response.text()}`);
    }
    
    const webhookData = await response.json();
    
    // Store the webhook configuration in the database
    const { error: insertError } = await fetch(
      `${supabaseUrl}/rest/v1/google_calendar_webhook_configs`,
      {
        method: "POST",
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal",
        },
        body: JSON.stringify({
          user_id: userId,
          calendar_id: calendarId,
          channel_id: channelId,
          resource_id: webhookData.resourceId,
          expiration_time: webhookExpiration.toISOString(),
        }),
      }
    ).then(r => r.ok ? { error: null } : r.json());
    
    if (insertError) {
      throw new Error(`Failed to store webhook config: ${insertError.message}`);
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        channel_id: channelId,
        expiration: webhookExpiration.toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error setting up webhook:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "An error occurred while setting up the webhook",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
