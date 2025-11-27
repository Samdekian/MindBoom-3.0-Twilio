import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

console.log("Loading move-participant function...");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MoveParticipantRequest {
  participant_id: string;
  from_room_id: string | null;
  to_room_id: string;
  transition_type: 'manual' | 'auto' | 'self';
  reason?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🔄 [move-participant] Processing request...");

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
      console.error("❌ [move-participant] Authentication failed");
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request
    const {
      participant_id,
      from_room_id,
      to_room_id,
      transition_type,
      reason
    }: MoveParticipantRequest = await req.json();

    if (!participant_id || !to_room_id || !transition_type) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get participant info
    const { data: participant, error: participantError } = await supabase
      .from('instant_session_participants')
      .select('*, instant_sessions!inner(therapist_id)')
      .eq('id', participant_id)
      .single();

    if (participantError || !participant) {
      console.error("❌ [move-participant] Participant not found");
      return new Response(
        JSON.stringify({ success: false, error: 'Participant not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify authorization (therapist or self-move)
    const isTherapist = (participant as any).instant_sessions.therapist_id === user.id;
    const isSelf = participant.user_id === user.id && transition_type === 'self';

    if (!isTherapist && !isSelf) {
      console.error("❌ [move-participant] User not authorized");
      return new Response(
        JSON.stringify({ success: false, error: 'Not authorized' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get target room
    const { data: toRoom, error: toRoomError } = await supabase
      .from('breakout_rooms')
      .select('*')
      .eq('id', to_room_id)
      .single();

    if (toRoomError || !toRoom) {
      console.error("❌ [move-participant] Target room not found");
      return new Response(
        JSON.stringify({ success: false, error: 'Target room not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if target room has space
    if (toRoom.current_participants >= toRoom.max_participants) {
      return new Response(
        JSON.stringify({ success: false, error: 'Target room is full' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Deactivate participant from current room if exists
    if (from_room_id) {
      const { error: deactivateError } = await supabase
        .from('breakout_room_participants')
        .update({
          is_active: false,
          left_at: new Date().toISOString()
        })
        .eq('participant_id', participant_id)
        .eq('breakout_room_id', from_room_id)
        .eq('is_active', true);

      if (deactivateError) {
        console.error("❌ [move-participant] Error leaving old room:", deactivateError);
      }
    }

    // Add participant to new room
    const { error: joinError } = await supabase
      .from('breakout_room_participants')
      .insert({
        breakout_room_id: to_room_id,
        participant_id: participant_id,
        user_id: participant.user_id,
        participant_name: participant.participant_name
      });

    if (joinError) {
      console.error("❌ [move-participant] Error joining new room:", joinError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to join new room' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create transition record
    const { data: transition, error: transitionError } = await supabase
      .from('breakout_room_transitions')
      .insert({
        participant_id,
        from_room_id,
        to_room_id,
        moved_by: user.id,
        transition_type,
        reason: reason || null
      })
      .select()
      .single();

    if (transitionError) {
      console.error("❌ [move-participant] Error creating transition record:", transitionError);
    }

    // Log event
    await supabase.from('session_analytics_events').insert({
      session_id: participant.session_id,
      event_type: 'participant_moved',
      user_id: user.id,
      participant_id: participant_id,
      metadata: {
        from_room_id,
        to_room_id,
        transition_type,
        reason
      }
    });

    console.log("✅ [move-participant] Participant moved successfully");

    return new Response(
      JSON.stringify({
        success: true,
        transition
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("❌ [move-participant] Function error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

