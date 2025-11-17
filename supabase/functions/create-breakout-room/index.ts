import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

console.log("Loading create-breakout-room function...");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateRoomRequest {
  session_id: string;
  room_name: string;
  max_participants: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🏗️ [create-breakout-room] Processing request...");

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("❌ [create-breakout-room] Authentication failed");
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request
    const { session_id, room_name, max_participants }: CreateRoomRequest = await req.json();

    if (!session_id || !room_name || !max_participants) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user is therapist for this session
    const { data: session, error: sessionError } = await supabase
      .from('instant_sessions')
      .select('therapist_id')
      .eq('id', session_id)
      .single();

    if (sessionError || !session || session.therapist_id !== user.id) {
      console.error("❌ [create-breakout-room] User not authorized for session");
      return new Response(
        JSON.stringify({ success: false, error: 'Not authorized for this session' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Twilio credentials
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');

    if (!twilioAccountSid || !twilioAuthToken) {
      console.error("❌ [create-breakout-room] Missing Twilio credentials");
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Twilio Video Room
    // Room name format: session-{session_id}-breakout-{room_name}
    const twilioRoomName = `${session_id}-${room_name.toLowerCase().replace(/\s+/g, '-')}`;
    const twilioUrl = `https://video.twilio.com/v1/Rooms`;
    const authHeaderTwilio = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

    console.log("🎥 [create-breakout-room] Creating Twilio room:", twilioRoomName);

    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeaderTwilio}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'UniqueName': twilioRoomName,
        'Type': 'group', // Group room supports up to 50 participants
        'MaxParticipants': max_participants.toString()
        // StatusCallback removed until twilio-room-status endpoint is implemented
        // 'StatusCallback': `${supabaseUrl}/functions/v1/twilio-room-status`,
        // 'StatusCallbackMethod': 'POST'
      }).toString()
    });

    if (!twilioResponse.ok) {
      const errorText = await twilioResponse.text();
      console.error("❌ [create-breakout-room] Twilio API error:", errorText);
      
      // Check if room already exists
      if (twilioResponse.status === 409) {
        console.log("ℹ️ [create-breakout-room] Room already exists, fetching existing room");
        // Fetch existing room
        const getRoomResponse = await fetch(`${twilioUrl}/${twilioRoomName}`, {
          headers: {
            'Authorization': `Basic ${authHeaderTwilio}`,
          }
        });
        
        if (getRoomResponse.ok) {
          const existingRoom = await getRoomResponse.json();
          const twilioRoomSid = existingRoom.sid;
          
          // Create database record
          const { data: breakoutRoom, error: dbError } = await supabase
            .from('breakout_rooms')
            .insert({
              session_id,
              room_name,
              twilio_room_sid: twilioRoomSid,
              max_participants,
              created_by: user.id
            })
            .select()
            .single();

          if (dbError) {
            throw new Error(`Database error: ${dbError.message}`);
          }

          return new Response(
            JSON.stringify({
              success: true,
              breakout_room: breakoutRoom,
              twilio_room_sid: twilioRoomSid
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create Twilio room' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const twilioRoom = await twilioResponse.json();
    const twilioRoomSid = twilioRoom.sid;

    console.log("✅ [create-breakout-room] Twilio room created:", twilioRoomSid);

    // Create database record
    const { data: breakoutRoom, error: dbError } = await supabase
      .from('breakout_rooms')
      .insert({
        session_id,
        room_name,
        twilio_room_sid: twilioRoomSid,
        max_participants,
        created_by: user.id
      })
      .select()
      .single();

    if (dbError) {
      console.error("❌ [create-breakout-room] Database error:", dbError);
      
      // Try to delete the Twilio room since DB insert failed
      await fetch(`${twilioUrl}/${twilioRoomSid}`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authHeaderTwilio}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'Status': 'completed'
        }).toString()
      });

      return new Response(
        JSON.stringify({ success: false, error: 'Database error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("✅ [create-breakout-room] Breakout room created successfully");

    return new Response(
      JSON.stringify({
        success: true,
        breakout_room: breakoutRoom,
        twilio_room_sid: twilioRoomSid
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("❌ [create-breakout-room] Function error:", error);
    console.error("❌ [create-breakout-room] Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    console.error("❌ [create-breakout-room] Error details:", {
      message: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : typeof error,
      cause: error instanceof Error ? error.cause : undefined
    });
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? error.name : String(error)
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

