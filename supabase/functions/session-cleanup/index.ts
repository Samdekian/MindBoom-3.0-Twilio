// Edge function for cleanup and maintenance tasks
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CleanupOptions {
  staleParticipants?: boolean;
  expiredSessions?: boolean;
  oldErrors?: boolean;
  sessionAnalytics?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create service role client for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('🧹 Starting session cleanup and maintenance...');

    // Parse cleanup options from request
    const { options = {} }: { options?: CleanupOptions } = req.method === 'POST' 
      ? await req.json().catch(() => ({ options: {} }))
      : { options: {} };

    const results = {
      cleanupStaleParticipants: null as any,
      cleanupExpiredSessions: null as any,
      cleanupOldErrors: null as any,
      updateAnalytics: null as any,
      timestamp: new Date().toISOString()
    };

    // 1. Cleanup stale participants (default: enabled)
    if (options.staleParticipants !== false) {
      console.log('🧹 Cleaning up stale participants...');
      
      const { error: staleError } = await supabase.rpc('cleanup_stale_participants');
      
      if (staleError) {
        console.error('❌ Error cleaning stale participants:', staleError);
        results.cleanupStaleParticipants = { error: staleError.message };
      } else {
        console.log('✅ Stale participants cleaned up');
        results.cleanupStaleParticipants = { success: true };
      }
    }

    // 2. Cleanup expired sessions (default: enabled)
    if (options.expiredSessions !== false) {
      console.log('🧹 Cleaning up expired sessions...');
      
      const { error: expiredError } = await supabase.rpc('cleanup_expired_instant_sessions');
      
      if (expiredError) {
        console.error('❌ Error cleaning expired sessions:', expiredError);
        results.cleanupExpiredSessions = { error: expiredError.message };
      } else {
        console.log('✅ Expired sessions cleaned up');
        results.cleanupExpiredSessions = { success: true };
      }
    }

    // 3. Cleanup old errors (default: enabled, keep last 30 days)
    if (options.oldErrors !== false) {
      console.log('🧹 Cleaning up old error logs...');
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: deletedErrors, error: errorCleanupError } = await supabase
        .from('session_errors')
        .delete()
        .lt('created_at', thirtyDaysAgo.toISOString())
        .select('id');
      
      if (errorCleanupError) {
        console.error('❌ Error cleaning old errors:', errorCleanupError);
        results.cleanupOldErrors = { error: errorCleanupError.message };
      } else {
        const deletedCount = deletedErrors?.length || 0;
        console.log(`✅ Cleaned up ${deletedCount} old error logs`);
        results.cleanupOldErrors = { success: true, deletedCount };
      }
    }

    // 4. Update session analytics for active sessions (default: enabled)
    if (options.sessionAnalytics !== false) {
      console.log('📊 Updating session analytics...');
      
      // Get all active sessions
      const { data: activeSessions, error: sessionsError } = await supabase
        .from('instant_sessions')
        .select('id')
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString());
      
      if (sessionsError) {
        console.error('❌ Error fetching active sessions:', sessionsError);
        results.updateAnalytics = { error: sessionsError.message };
      } else {
        let updatedCount = 0;
        let errorCount = 0;
        
        for (const session of activeSessions || []) {
          try {
            const { error: analyticsError } = await supabase.rpc('update_session_analytics_data', {
              p_session_id: session.id
            });
            
            if (analyticsError) {
              console.error(`❌ Error updating analytics for session ${session.id}:`, analyticsError);
              errorCount++;
            } else {
              updatedCount++;
            }
          } catch (error) {
            console.error(`❌ Error updating analytics for session ${session.id}:`, error);
            errorCount++;
          }
        }
        
        console.log(`📊 Updated analytics for ${updatedCount} sessions (${errorCount} errors)`);
        results.updateAnalytics = { 
          success: true, 
          updatedCount, 
          errorCount,
          totalSessions: activeSessions?.length || 0 
        };
      }
    }

    // 5. Cleanup stale session states (additional cleanup)
    console.log('🧹 Cleaning up stale session states...');
    
    const { error: staleStatesError } = await supabase.rpc('cleanup_stale_session_states');
    
    if (staleStatesError) {
      console.error('❌ Error cleaning stale session states:', staleStatesError);
    } else {
      console.log('✅ Stale session states cleaned up');
    }

    console.log('🧹 Cleanup and maintenance completed');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Cleanup and maintenance completed successfully',
        results,
        executedAt: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Cleanup function error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        executedAt: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
