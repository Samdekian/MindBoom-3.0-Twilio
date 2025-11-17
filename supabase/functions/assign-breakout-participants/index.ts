import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Assignment {
  breakout_room_id: string;
  participant_id: string;
  user_id: string | null;
  participant_name: string;
}

interface AssignRequest {
  session_id: string;
  assignments: Assignment[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { session_id, assignments }: AssignRequest = await req.json();

    if (!session_id || !assignments || !Array.isArray(assignments)) {
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
      return new Response(
        JSON.stringify({ success: false, error: 'Not authorized for this session' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert assignments using service role (bypasses RLS)
    const { data, error } = await supabase
      .from('breakout_room_participants')
      .insert(assignments.map(a => ({
        breakout_room_id: a.breakout_room_id,
        participant_id: a.participant_id,
        user_id: a.user_id,
        participant_name: a.participant_name,
        is_active: true
      })))
      .select();

    if (error) {
      console.error("❌ [assign-breakout-participants] Insert error:", error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update room participant counts
    const roomIds = [...new Set(assignments.map(a => a.breakout_room_id))];
    for (const roomId of roomIds) {
      const { count } = await supabase
        .from('breakout_room_participants')
        .select('*', { count: 'exact', head: true })
        .eq('breakout_room_id', roomId)
        .eq('is_active', true);

      await supabase
        .from('breakout_rooms')
        .update({ current_participants: count || 0 })
        .eq('id', roomId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        assigned_count: data?.length || 0
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("❌ [assign-breakout-participants] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
