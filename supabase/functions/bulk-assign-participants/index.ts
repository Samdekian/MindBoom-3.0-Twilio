import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

console.log("Loading bulk-assign-participants function...");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BulkAssignRequest {
  session_id: string;
  assignments: Array<{
    participant_id: string;
    breakout_room_id: string;
  }>;
  transition_type: 'manual' | 'auto';
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("📋 [bulk-assign-participants] Processing request...");

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
      console.error("❌ [bulk-assign-participants] Authentication failed");
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request
    const { session_id, assignments, transition_type }: BulkAssignRequest = await req.json();

    if (!session_id || !assignments || assignments.length === 0) {
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
      console.error("❌ [bulk-assign-participants] User not authorized");
      return new Response(
        JSON.stringify({ success: false, error: 'Not authorized' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let assignedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Process each assignment
    for (const assignment of assignments) {
      try {
        // Get participant info
        const { data: participant } = await supabase
          .from('instant_session_participants')
          .select('user_id, participant_name')
          .eq('id', assignment.participant_id)
          .single();

        if (!participant) {
          errors.push(`Participant ${assignment.participant_id} not found`);
          failedCount++;
          continue;
        }

        // Add to breakout room
        const { error: insertError } = await supabase
          .from('breakout_room_participants')
          .insert({
            breakout_room_id: assignment.breakout_room_id,
            participant_id: assignment.participant_id,
            user_id: participant.user_id,
            participant_name: participant.participant_name
          });

        if (insertError) {
          errors.push(`Failed to assign ${assignment.participant_id}: ${insertError.message}`);
          failedCount++;
          continue;
        }

        // Create transition record
        await supabase
          .from('breakout_room_transitions')
          .insert({
            participant_id: assignment.participant_id,
            from_room_id: null,
            to_room_id: assignment.breakout_room_id,
            moved_by: user.id,
            transition_type,
            reason: 'Initial assignment'
          });

        assignedCount++;

      } catch (error) {
        console.error("❌ [bulk-assign-participants] Error assigning participant:", error);
        errors.push(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        failedCount++;
      }
    }

    // Log event
    await supabase.from('session_analytics_events').insert({
      session_id,
      event_type: 'bulk_assignment',
      user_id: user.id,
      metadata: {
        assigned_count: assignedCount,
        failed_count: failedCount,
        transition_type
      }
    });

    console.log(`✅ [bulk-assign-participants] Completed: ${assignedCount} assigned, ${failedCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        assigned_count: assignedCount,
        failed_count: failedCount,
        errors: errors.length > 0 ? errors : undefined
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("❌ [bulk-assign-participants] Function error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

