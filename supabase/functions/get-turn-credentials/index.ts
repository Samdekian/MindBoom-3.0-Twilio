import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

console.log("Loading get-turn-credentials function...")

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TwilioTokenResponse {
  username: string;
  password: string;
  ice_servers: Array<{
    urls: string | string[];
    username?: string;
    credential?: string;
  }>;
  ttl: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🔧 [get-turn-credentials] Processing request...");

    // Get Twilio credentials from environment
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');

    if (!twilioAccountSid || !twilioAuthToken) {
      console.error("❌ [get-turn-credentials] Missing Twilio credentials");
      return new Response(
        JSON.stringify({ error: 'Twilio credentials not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create Twilio API request to get TURN credentials
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Tokens.json`;
    const authHeader = btoa(`${twilioAccountSid}:${twilioAuthToken}`);
    
    console.log("🔧 [get-turn-credentials] Requesting TURN credentials from Twilio...");

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.ok) {
      console.error("❌ [get-turn-credentials] Twilio API error:", response.status, response.statusText);
      return new Response(
        JSON.stringify({ error: 'Failed to get TURN credentials from Twilio' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const twilioData: TwilioTokenResponse = await response.json();
    console.log("✅ [get-turn-credentials] Received TURN credentials from Twilio");

    // Transform Twilio response to standard WebRTC format
    const iceServers = [
      // Keep existing STUN servers
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun.services.mozilla.com' },
      { urls: 'stun:stun.stunprotocol.org:3478' },
      
      // Add Twilio TURN servers with credentials
      ...twilioData.ice_servers.filter(server => 
        (Array.isArray(server.urls) ? server.urls.some(url => url.startsWith('turn:')) : server.urls.startsWith('turn:'))
      )
    ];

    const result = {
      iceServers,
      iceCandidatePoolSize: 10,
      iceTransportPolicy: 'all',
      credentials: {
        username: twilioData.username,
        credential: twilioData.password,
        ttl: twilioData.ttl
      }
    };

    console.log("✅ [get-turn-credentials] Returning ICE configuration");
    
    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error("❌ [get-turn-credentials] Function error:", error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
