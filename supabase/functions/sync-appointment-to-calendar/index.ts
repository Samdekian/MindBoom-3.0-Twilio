
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, errorResponse } from "./utils.ts";
import { syncGoogleCalendarAppointment } from "./providers/google.ts";
import { syncAppleCalendarAppointment } from "./providers/apple.ts";

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
    const { appointment, provider } = await req.json();
    if (!appointment || !appointment.id) {
      return errorResponse({ message: "Invalid appointment data", status: 400 });
    }

    // Parse JWT to get user ID
    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    if (!authHeader) {
      return errorResponse({ message: "Unauthorized", status: 401 });
    }

    // Get user using Supabase Auth API
    const userResp = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { Authorization: authHeader, apikey: supabaseAnonKey },
    });
    const userData = await userResp.json();
    const userId = userData?.id;
    if (!userId) {
      return errorResponse({ message: "User not found", status: 401 });
    }

    // Allow for easy extension to other providers in future
    switch ((provider || "google").toLowerCase()) {
      case "google":
        return await syncGoogleCalendarAppointment(
          req,
          appointment,
          userId,
          supabaseUrl,
          supabaseAnonKey,
          googleClientId,
          googleClientSecret
        );
      case "apple":
        return await syncAppleCalendarAppointment(
          req,
          appointment,
          userId,
          supabaseUrl,
          supabaseAnonKey
        );
      default:
        return errorResponse({ message: "Unsupported calendar provider", status: 400 });
    }
  } catch (error) {
    console.error("Error syncing appointment:", error);
    return errorResponse({ message: error.message || "Failed to sync appointment" });
  }
});
