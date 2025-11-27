
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const googleClientId = Deno.env.get("GOOGLE_CLIENT_ID");
  const googleClientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");

  try {
    const { eventId, calendarId = 'primary' } = await req.json();
    if (!eventId) {
      return new Response(
        JSON.stringify({ error: "Event ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user from auth header
    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user using Supabase Auth API
    const userResp = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { Authorization: authHeader, apikey: supabaseAnonKey },
    });
    const userData = await userResp.json();
    const userId = userData?.id;
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get therapist's Google Calendar tokens
    const settingsResp = await fetch(
      `${supabaseUrl}/rest/v1/therapist_settings?user_id=eq.${userId}`,
      {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
      }
    );

    if (!settingsResp.ok) {
      throw new Error(`Failed to fetch therapist settings: ${await settingsResp.text()}`);
    }

    const settings = await settingsResp.json();
    if (!settings || settings.length === 0 || !settings[0].access_token) {
      return new Response(
        JSON.stringify({ error: "Google Calendar not connected" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { access_token, refresh_token, token_expires_at } = settings[0];
    
    // Refresh token if expired
    let currentToken = access_token;
    const now = new Date();
    const tokenExpiry = new Date(token_expires_at);
    
    if (tokenExpiry <= new Date(now.getTime() + 5 * 60 * 1000)) {
      try {
        const refreshResp = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: googleClientId ?? "",
            client_secret: googleClientSecret ?? "",
            refresh_token: refresh_token,
            grant_type: "refresh_token",
          }).toString(),
        });
        
        if (!refreshResp.ok) {
          throw new Error(`Token refresh failed: ${await refreshResp.text()}`);
        }
        
        const refreshData = await refreshResp.json();
        currentToken = refreshData.access_token;
        
        // Update tokens in DB
        await fetch(`${supabaseUrl}/rest/v1/therapist_settings?user_id=eq.${userId}`, {
          method: "PATCH",
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
          },
          body: JSON.stringify({
            access_token: refreshData.access_token,
            token_expires_at: new Date(now.getTime() + refreshData.expires_in * 1000).toISOString(),
          }),
        });
      } catch (err) {
        console.error("Google token refresh error:", err);
        return new Response(
          JSON.stringify({ error: "Failed to refresh Google Calendar access" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Delete the event from Google Calendar
    const deleteResp = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      }
    );

    if (!deleteResp.ok) {
      throw new Error(`Failed to delete event: ${await deleteResp.text()}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Event successfully deleted" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error deleting Google Calendar event:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to delete event" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
