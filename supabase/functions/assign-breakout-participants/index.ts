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
    console.log("🏗️ [assign-breakout-participants] Processing request...");
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("❌ [assign-breakout-participants] Missing authorization header");
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ [assign-breakout-participants] Missing Supabase configuration");
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("❌ [assign-breakout-participants] Authentication failed:", authError?.message);
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("✅ [assign-breakout-participants] User authenticated:", user.id);

    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error("❌ [assign-breakout-participants] Failed to parse request body:", parseError);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { session_id, assignments }: AssignRequest = requestBody;

    console.log("📝 [assign-breakout-participants] Request data:", {
      session_id,
      assignment_count: assignments?.length || 0,
      sample_assignment: assignments?.[0]
    });

    if (!session_id || !assignments || !Array.isArray(assignments)) {
      console.error("❌ [assign-breakout-participants] Missing required fields:", {
        has_session_id: !!session_id,
        has_assignments: !!assignments,
        is_array: Array.isArray(assignments)
      });
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: session_id and assignments array required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (assignments.length === 0) {
      console.log("⚠️ [assign-breakout-participants] No assignments to process");
      return new Response(
        JSON.stringify({ success: true, assigned_count: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user is therapist for this session
    const { data: session, error: sessionError } = await supabase
      .from('instant_sessions')
      .select('therapist_id')
      .eq('id', session_id)
      .single();

    if (sessionError) {
      console.error("❌ [assign-breakout-participants] Failed to fetch session:", sessionError);
      return new Response(
        JSON.stringify({ success: false, error: `Failed to verify session: ${sessionError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!session) {
      console.error("❌ [assign-breakout-participants] Session not found:", session_id);
      return new Response(
        JSON.stringify({ success: false, error: 'Session not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (session.therapist_id !== user.id) {
      console.error("❌ [assign-breakout-participants] User not authorized:", {
        user_id: user.id,
        therapist_id: session.therapist_id
      });
      return new Response(
        JSON.stringify({ success: false, error: 'Not authorized for this session' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("✅ [assign-breakout-participants] Session verified, therapist authorized");

    // Prepare insert data
    const insertData = assignments.map(a => ({
      breakout_room_id: a.breakout_room_id,
      participant_id: a.participant_id,
      user_id: a.user_id,
      participant_name: a.participant_name,
      is_active: true
    }));

    console.log("📝 [assign-breakout-participants] Inserting assignments:", {
      count: insertData.length,
      sample: insertData[0]
    });

    // Insert assignments using service role (bypasses RLS)
    const { data, error } = await supabase
      .from('breakout_room_participants')
      .insert(insertData)
      .select();

    if (error) {
      console.error("❌ [assign-breakout-participants] Insert error:", error);
      console.error("❌ [assign-breakout-participants] Error details:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message,
          details: error.details,
          code: error.code
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("✅ [assign-breakout-participants] Inserted assignments:", data?.length || 0);

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
    console.error("❌ [assign-breakout-participants] Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    console.error("❌ [assign-breakout-participants] Error details:", {
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
