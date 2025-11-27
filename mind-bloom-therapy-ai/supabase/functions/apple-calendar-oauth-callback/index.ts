
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

  // Currently just a placeholder - will be fully implemented when
  // Apple Calendar integration is ready
  return new Response(
    JSON.stringify({ 
      success: false,
      message: "Apple Calendar integration is under development",
    }), 
    {
      status: 501, // Not Implemented
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
});
