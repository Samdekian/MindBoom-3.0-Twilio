
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { processCalendarChanges } from "./utils/processing.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const headers = req.headers;
    const channelId = headers.get("X-Goog-Channel-ID");
    const resourceId = headers.get("X-Goog-Resource-ID");
    const resourceState = headers.get("X-Goog-Resource-State");

    // Log webhook event
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    const { error: logError } = await fetch(
      `${supabaseUrl}/rest/v1/google_calendar_webhooks`,
      {
        method: "POST",
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal",
        },
        body: JSON.stringify({
          channel_id: channelId,
          resource_id: resourceId,
          resource_state: resourceState,
          headers: Object.fromEntries(headers.entries()),
          processed: false,
        }),
      }
    ).then(r => r.json());

    if (logError) {
      throw logError;
    }

    // Process changes in the background
    EdgeRuntime.waitUntil(
      processCalendarChanges(
        channelId, 
        resourceId, 
        resourceState,
        supabaseUrl,
        supabaseServiceKey
      )
    );

    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

