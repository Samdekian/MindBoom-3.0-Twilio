import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

console.log("Loading close-breakout-room function...");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CloseRoomRequest {
  breakout_room_id: string;
  reason?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🔚 [close-breakout-room] Processing request...");

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
      console.error("❌ [close-breakout-room] Authentication failed");
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request
    const { breakout_room_id, reason }: CloseRoomRequest = await req.json();

    if (!breakout_room_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing breakout_room_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get breakout room
    const { data: room, error: roomError } = await supabase
      .from('breakout_rooms')
      .select('*, instant_sessions!inner(therapist_id)')
      .eq('id', breakout_room_id)
      .single();

    if (roomError || !room) {
      console.error("❌ [close-breakout-room] Room not found");
      return new Response(
        JSON.stringify({ success: false, error: 'Room not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user is therapist for this session
    if ((room as any).instant_sessions.therapist_id !== user.id) {
      console.error("❌ [close-breakout-room] User not authorized");
      return new Response(
        JSON.stringify({ success: false, error: 'Not authorized' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Twilio credentials
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');

    if (!twilioAccountSid || !twilioAuthToken) {
      console.error("❌ [close-breakout-room] Missing Twilio credentials");
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Close Twilio room if it exists
    if (room.twilio_room_sid) {
      console.log("🎥 [close-breakout-room] Closing Twilio room:", room.twilio_room_sid);
      
      const twilioUrl = `https://video.twilio.com/v1/Rooms/${room.twilio_room_sid}`;
      const authHeaderTwilio = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

      const twilioResponse = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authHeaderTwilio}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'Status': 'completed'
        }).toString()
      });

      if (!twilioResponse.ok) {
        const errorText = await twilioResponse.text();
        console.error("❌ [close-breakout-room] Twilio API error:", errorText);
        // Continue anyway to update database
      } else {
        console.log("✅ [close-breakout-room] Twilio room closed");
      }
    }

    // Deactivate all participants in the room
    const { error: participantError } = await supabase
      .from('breakout_room_participants')
      .update({
        is_active: false,
        left_at: new Date().toISOString()
      })
      .eq('breakout_room_id', breakout_room_id)
      .eq('is_active', true);

    if (participantError) {
      console.error("❌ [close-breakout-room] Error deactivating participants:", participantError);
    }

    // Update room status
    const { error: updateError } = await supabase
      .from('breakout_rooms')
      .update({
        is_active: false,
        closed_at: new Date().toISOString()
      })
      .eq('id', breakout_room_id);

    if (updateError) {
      console.error("❌ [close-breakout-room] Database error:", updateError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to close room' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log event
    await supabase.from('session_analytics_events').insert({
      session_id: room.session_id,
      event_type: 'breakout_room_closed',
      user_id: user.id,
      metadata: {
        room_id: breakout_room_id,
        room_name: room.room_name,
        reason: reason || 'Manual close'
      }
    });

    console.log("✅ [close-breakout-room] Room closed successfully");

    return new Response(
      JSON.stringify({
        success: true,
        closed_room_id: breakout_room_id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("❌ [close-breakout-room] Function error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

