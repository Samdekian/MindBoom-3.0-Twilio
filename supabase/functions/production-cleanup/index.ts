import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('[Production Cleanup] Starting cleanup tasks');

    const results = {
      expiredSessions: 0,
      staleParticipants: 0,
      oldMetrics: 0,
      oldErrors: 0,
      oldHealthChecks: 0,
      totalCleaned: 0
    };

    // Clean up expired sessions
    const { error: sessionError } = await supabase.rpc('cleanup_expired_instant_sessions');
    if (sessionError) {
      console.error('[Production Cleanup] Session cleanup failed:', sessionError);
    } else {
      console.log('[Production Cleanup] Cleaned up expired sessions');
      results.expiredSessions = 1; // Function doesn't return count
    }

    // Clean up stale participants
    const { error: participantError } = await supabase.rpc('cleanup_stale_participants');
    if (participantError) {
      console.error('[Production Cleanup] Participant cleanup failed:', participantError);
    } else {
      console.log('[Production Cleanup] Cleaned up stale participants');
      results.staleParticipants = 1; // Function doesn't return count
    }

    // Clean up old monitoring data
    const { error: monitoringError } = await supabase.rpc('cleanup_monitoring_data');
    if (monitoringError) {
      console.error('[Production Cleanup] Monitoring cleanup failed:', monitoringError);
    } else {
      console.log('[Production Cleanup] Cleaned up old monitoring data');
      results.oldMetrics = 1; // Function doesn't return count
    }

    // Clean up old session states
    const { error: sessionStateError } = await supabase.rpc('cleanup_stale_session_states');
    if (sessionStateError) {
      console.error('[Production Cleanup] Session state cleanup failed:', sessionStateError);
    } else {
      console.log('[Production Cleanup] Cleaned up stale session states');
    }

    // Update session analytics for active sessions
    const { data: activeSessions } = await supabase
      .from('instant_sessions')
      .select('id')
      .eq('is_active', true);

    if (activeSessions && activeSessions.length > 0) {
      for (const session of activeSessions) {
        const { error: analyticsError } = await supabase.rpc('update_session_analytics_data', {
          p_session_id: session.id
        });
        
        if (analyticsError) {
          console.error(`[Production Cleanup] Analytics update failed for session ${session.id}:`, analyticsError);
        }
      }
      console.log(`[Production Cleanup] Updated analytics for ${activeSessions.length} active sessions`);
    }

    // Calculate total items cleaned
    results.totalCleaned = Object.values(results).reduce((sum, count) => sum + count, 0);

    // Log cleanup summary
    const { error: logError } = await supabase
      .from('audit_logs')
      .insert({
        user_id: null, // System operation
        activity_type: 'system_cleanup',
        resource_type: 'production_maintenance',
        resource_id: 'cleanup_job',
        metadata: {
          cleanup_results: results,
          timestamp: new Date().toISOString(),
          success: true
        }
      });

    if (logError) {
      console.error('[Production Cleanup] Failed to log cleanup activity:', logError);
    }

    console.log('[Production Cleanup] Cleanup completed:', results);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Production cleanup completed successfully',
        results: results,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[Production Cleanup] Cleanup failed:', error);
    
    // Log the error
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      await supabase
        .from('error_logs')
        .insert({
          error_message: `Production cleanup failed: ${error.message}`,
          error_stack: error.stack,
          context: 'production_cleanup',
          severity: 'critical',
          timestamp: new Date().toISOString()
        });
    } catch (logError) {
      console.error('[Production Cleanup] Failed to log cleanup error:', logError);
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Production cleanup failed',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});