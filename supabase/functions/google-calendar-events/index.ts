
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
    // Parse JWT to get user ID from the Authorization header
    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user using Supabase Auth API
    const userResp = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { Authorization: authHeader, apikey: supabaseAnonKey },
    });
    const userData = await userResp.json();
    const userId = userData?.id;
    
    if (!userId) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user's Google Calendar tokens and selected calendar
    const settingsResp = await fetch(`${supabaseUrl}/rest/v1/therapist_settings?user_id=eq.${userId}`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    });
    
    const settings = await settingsResp.json();
    if (!settings || settings.length === 0 || !settings[0].access_token) {
      return new Response(JSON.stringify({ error: "Google Calendar not connected" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { access_token, refresh_token, token_expires_at, google_calendar_id } = settings[0];
    const calendarId = google_calendar_id || 'primary'; // Use selected calendar or default to primary
    
    // Check if token needs refresh
    let currentToken = access_token;
    const now = new Date();
    const tokenExpiry = new Date(token_expires_at);
    
    // If token is expired or will expire in the next 5 minutes, refresh it
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
          throw new Error(`Failed to refresh token: ${await refreshResp.text()}`);
        }
        
        const refreshData = await refreshResp.json();
        currentToken = refreshData.access_token;
        
        // Update tokens in database
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
      } catch (refreshError) {
        console.error("Token refresh error:", refreshError);
        // Continue with existing token even if refresh fails
      }
    }
    
    // Now fetch calendar events from the selected calendar
    const timeMin = new Date();
    const timeMax = new Date();
    timeMax.setDate(timeMax.getDate() + 30); // Next 30 days
    
    const calendarResp = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?timeMin=${timeMin.toISOString()}&timeMax=${timeMax.toISOString()}&maxResults=10&singleEvents=true&orderBy=startTime`,
      {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      }
    );
    
    if (!calendarResp.ok) {
      throw new Error(`Failed to fetch calendar events: ${await calendarResp.text()}`);
    }
    
    const calendarData = await calendarResp.json();
    
    return new Response(JSON.stringify({ 
      events: calendarData.items || [],
      calendarId: calendarId,
      calendarTitle: calendarData.summary || "Calendar"
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Google Calendar events error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
