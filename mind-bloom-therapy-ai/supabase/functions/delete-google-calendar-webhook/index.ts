
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

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  try {
    const { channelId, resourceId } = await req.json();
    
    if (!channelId) {
      throw new Error("Channel ID is required");
    }
    
    // Get the user's access token
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
    
    // Check if the user owns this webhook
    const { data: webhookConfig, error: webhookError } = await fetch(
      `${supabaseUrl}/rest/v1/google_calendar_webhook_configs?channel_id=eq.${channelId}`,
      {
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
      }
    ).then(r => r.json());
    
    if (webhookError || !webhookConfig?.[0]) {
      throw new Error(`Webhook not found: ${webhookError?.message || "No configuration found"}`);
    }
    
    if (webhookConfig[0].user_id !== userId) {
      throw new Error("You don't have permission to delete this webhook");
    }
    
    // Call the Google Calendar API to stop the webhook
    try {
      await fetch("https://www.googleapis.com/calendar/v3/channels/stop", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${settings[0].access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: channelId,
          resourceId: resourceId,
        }),
      });
    } catch (error) {
      console.warn("Error stopping webhook (might be already expired):", error);
      // We continue even if this fails, as we want to remove from our DB anyway
    }
    
    // Delete the webhook config from our database
    const { error: deleteError } = await fetch(
      `${supabaseUrl}/rest/v1/google_calendar_webhook_configs?channel_id=eq.${channelId}`,
      {
        method: "DELETE",
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
          "Prefer": "return=minimal",
        },
      }
    ).then(r => r.ok ? { error: null } : r.json());
    
    if (deleteError) {
      throw new Error(`Failed to delete webhook config: ${deleteError.message}`);
    }
    
    return new Response(
      JSON.stringify({ success: true, message: "Webhook deleted successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error deleting webhook:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "An error occurred while deleting the webhook",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
