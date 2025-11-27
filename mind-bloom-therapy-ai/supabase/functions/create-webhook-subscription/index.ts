
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const googleClientId = Deno.env.get("GOOGLE_CLIENT_ID");
const googleClientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { calendarId, userId } = await req.json();
    
    // Get user's Google Calendar tokens
    const { data: settings } = await fetch(
      `${supabaseUrl}/rest/v1/therapist_settings?user_id=eq.${userId}`,
      {
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
      }
    ).then(r => r.json());

    if (!settings?.[0]?.access_token) {
      throw new Error("Google Calendar not connected");
    }

    // Generate unique IDs for the webhook
    const channelId = crypto.randomUUID();
    const resourceId = `calendar-${calendarId}-${channelId}`;

    // Create webhook subscription with Google Calendar API
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/watch`,
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
          token: userId,
          expiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).getTime(), // 1 week
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create webhook: ${await response.text()}`);
    }

    const webhookData = await response.json();

    // Store webhook configuration
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
          expiration: new Date(webhookData.expiration).toISOString(),
        }),
      }
    ).then(r => r.json());

    if (insertError) {
      throw new Error(`Failed to store webhook config: ${insertError.message}`);
    }

    return new Response(
      JSON.stringify({ success: true, channelId, resourceId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
