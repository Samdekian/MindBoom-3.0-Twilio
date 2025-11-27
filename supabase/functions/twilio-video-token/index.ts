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
    let { identity, roomName }: TokenRequest = await req.json();

    if (!identity || !roomName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: identity, roomName' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if this is a breakout room Twilio SID (starts with RM)
    if (roomName.startsWith('RM')) {
      console.log("🎥 [twilio-video-token] Checking breakout room:", roomName);
      
      // First, check if the breakout room exists (without join to avoid issues)
      const { data: breakoutRoom, error: breakoutError } = await supabase
        .from('breakout_rooms')
        .select('id, session_id, is_active, twilio_room_sid')
        .eq('twilio_room_sid', roomName)
        .eq('is_active', true)
        .single();

      if (breakoutError || !breakoutRoom) {
        console.error("❌ [twilio-video-token] Breakout room not found:", {
          error: breakoutError,
          roomName,
          errorCode: breakoutError?.code,
          errorMessage: breakoutError?.message,
          errorDetails: breakoutError?.details
        });
        return new Response(
          JSON.stringify({ error: 'Breakout room not found or inactive' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      console.log("✅ [twilio-video-token] Breakout room found:", {
        roomId: breakoutRoom.id,
        sessionId: breakoutRoom.session_id,
        isActive: breakoutRoom.is_active
      });

      // Then, fetch the session separately to check authorization
      const { data: session, error: sessionError } = await supabase
        .from('instant_sessions')
        .select('therapist_id, host_user_id')
        .eq('id', breakoutRoom.session_id)
        .single();

      if (sessionError || !session) {
        console.error("❌ [twilio-video-token] Session not found for breakout room:", {
          error: sessionError,
          sessionId: breakoutRoom.session_id,
          errorCode: sessionError?.code,
          errorMessage: sessionError?.message
        });
        return new Response(
          JSON.stringify({ error: 'Session not found for breakout room' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Check if user is therapist
      const isTherapist = session.therapist_id === user.id || session.host_user_id === user.id;
      
      // Check if user is participant in the session
      const { data: participantData } = await supabase
        .from('instant_session_participants')
        .select('id')
        .eq('session_id', breakoutRoom.session_id)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();
      
      const isParticipant = !!participantData;
      const isAuthorized = isTherapist || isParticipant;

      if (!isAuthorized) {
        console.error("❌ [twilio-video-token] User not authorized for breakout room:", {
          userId: user.id,
          isTherapist,
          isParticipant,
          sessionId: breakoutRoom.session_id,
          therapistId: session.therapist_id,
          hostUserId: session.host_user_id
        });
        return new Response(
          JSON.stringify({ error: 'Not authorized to join this breakout room' }),
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Use user's profile name or email
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      identity = profile?.full_name || user.email?.split('@')[0] || user.id;

      console.log(`🎥 [twilio-video-token] Generating token for breakout room: ${identity}, room: ${roomName}`);

    } else {
      // Original logic for main sessions
      // Handle roomName format: "session-{token}" or just "{token}" or "{uuid}"
      let sessionToken = roomName;
      let sessionId = roomName;
      
      // If roomName starts with "session-", extract the token
      if (roomName.startsWith('session-')) {
        sessionToken = roomName.replace('session-', '');
      }
      
      console.log("🎥 [twilio-video-token] Looking up session:", {
        roomName,
        sessionToken,
        sessionId
      });
      
      // Try to find session by token first, then by ID
      // Use maybeSingle() to avoid errors when no rows found
      let session = null;
      let sessionError = null;
      
      // First try with session_token
      const { data: sessionByToken, error: errorByToken } = await supabase
        .from('instant_sessions')
        .select('therapist_id, host_user_id')
        .eq('session_token', sessionToken)
        .maybeSingle();
      
      if (errorByToken) {
        // Real error occurred
        sessionError = errorByToken;
        console.error("❌ [twilio-video-token] Error querying by token:", errorByToken);
      } else if (sessionByToken) {
        // Found by token
        session = sessionByToken;
        console.log("✅ [twilio-video-token] Found session by token:", sessionToken);
      } else {
        // Token not found, try by ID
        console.log("🔄 [twilio-video-token] Token not found, trying by ID:", sessionId);
        const { data: sessionById, error: errorById } = await supabase
          .from('instant_sessions')
          .select('therapist_id, host_user_id')
          .eq('id', sessionId)
          .maybeSingle();
        
        if (errorById) {
          // Real error occurred
          sessionError = errorById;
          console.error("❌ [twilio-video-token] Error querying by ID:", errorById);
        } else if (sessionById) {
          // Found by ID
          session = sessionById;
          console.log("✅ [twilio-video-token] Found session by ID:", sessionId);
        } else {
          // Not found by either method
          console.error("❌ [twilio-video-token] Session not found by token or ID");
        }
      }

      if (sessionError || !session) {
        console.error("❌ [twilio-video-token] Session lookup failed:", {
          error: sessionError,
          roomName,
          sessionToken,
          sessionId,
          errorCode: sessionError?.code,
          errorMessage: sessionError?.message
        });
        return new Response(
          JSON.stringify({ error: 'Session not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Only therapist can generate tokens for main sessions
      const isTherapist = session.therapist_id === user.id || session.host_user_id === user.id;

      if (!isTherapist) {
        console.error("❌ [twilio-video-token] User not authorized for session");
        return new Response(
          JSON.stringify({ error: 'Not authorized to join this session' }),
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Enforce identity matches user's profile or email
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      const expectedIdentity = profile?.full_name || user.email?.split('@')[0] || user.id;

      if (identity !== expectedIdentity) {
        console.warn("⚠️ [twilio-video-token] Identity mismatch, using expected identity");
        identity = expectedIdentity;
      }

      console.log(`🎥 [twilio-video-token] Generating token for user: ${identity}, room: ${roomName}`);
    }

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

