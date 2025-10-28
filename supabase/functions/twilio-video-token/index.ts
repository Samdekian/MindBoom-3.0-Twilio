import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

console.log("Loading twilio-video-token function...");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TokenRequest {
  identity: string;
  roomName: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🎥 [twilio-video-token] Processing request...");

    // Get Twilio credentials from environment
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioApiKeySid = Deno.env.get('TWILIO_API_KEY_SID');
    const twilioApiKeySecret = Deno.env.get('TWILIO_API_KEY_SECRET');

    if (!twilioAccountSid || !twilioApiKeySid || !twilioApiKeySecret) {
      console.error("❌ [twilio-video-token] Missing Twilio credentials");
      return new Response(
        JSON.stringify({ error: 'Twilio Video credentials not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify user is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create Supabase client to verify user
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("❌ [twilio-video-token] Authentication failed:", authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse request body
    const { identity, roomName }: TokenRequest = await req.json();

    if (!identity || !roomName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: identity, roomName' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`🎥 [twilio-video-token] Generating token for user: ${identity}, room: ${roomName}`);

    // Generate Twilio Video Access Token using Twilio's JWT format
    // Token structure: header.payload.signature
    const header = {
      cty: "twilio-fpa;v=1",
      typ: "JWT",
      alg: "HS256"
    };

    const now = Math.floor(Date.now() / 1000);
    const expiry = now + 3600; // Token valid for 1 hour

    const payload = {
      jti: `${twilioApiKeySid}-${now}`,
      iss: twilioApiKeySid,
      sub: twilioAccountSid,
      exp: expiry,
      grants: {
        identity: identity,
        video: {
          room: roomName
        }
      }
    };

    // Encode header and payload
    const encoder = new TextEncoder();
    const base64url = (data: Uint8Array): string => {
      const base64 = btoa(String.fromCharCode(...data));
      return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    };

    const headerEncoded = base64url(encoder.encode(JSON.stringify(header)));
    const payloadEncoded = base64url(encoder.encode(JSON.stringify(payload)));
    const signatureInput = `${headerEncoded}.${payloadEncoded}`;

    // Generate signature using HMAC SHA-256
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(twilioApiKeySecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(signatureInput)
    );

    const signatureEncoded = base64url(new Uint8Array(signature));
    const accessToken = `${signatureInput}.${signatureEncoded}`;

    console.log("✅ [twilio-video-token] Token generated successfully");

    // Log token generation for audit
    await supabase.from('session_analytics_events').insert({
      session_id: roomName,
      event_type: 'token_generated',
      user_id: user.id,
      participant_name: identity,
      metadata: {
        room_name: roomName,
        token_expiry: new Date(expiry * 1000).toISOString()
      }
    });

    return new Response(
      JSON.stringify({
        token: accessToken,
        identity: identity,
        roomName: roomName,
        expiresAt: new Date(expiry * 1000).toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error("❌ [twilio-video-token] Function error:", error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

