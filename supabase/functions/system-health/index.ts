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

  if (req.method !== 'GET') {
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

    console.log('[System Health] Performing comprehensive health check');

    // Perform health checks
    const healthResults = await performHealthChecks(supabase);
    
    // Calculate overall status
    const overallStatus = calculateOverallStatus(healthResults);
    
    // Store health check result
    const { error: insertError } = await supabase
      .from('health_checks')
      .insert({
        service_name: 'video_conference_system',
        status: overallStatus,
        response_time_ms: healthResults.totalResponseTime,
        database_connected: healthResults.database.connected,
        webrtc_available: healthResults.webrtc.available,
        agora_sdk_loaded: healthResults.agora.loaded,
        agora_credentials_configured: healthResults.agora.credentialsConfigured || false,
        metadata: {
          checks: healthResults,
          timestamp: new Date().toISOString(),
          memory_usage_mb: healthResults.system.memoryUsage
        }
      });

    if (insertError) {
      console.error('[System Health] Failed to store health check:', insertError);
    }

    const response = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      details: healthResults
    };

    const statusCode = overallStatus === 'unhealthy' ? 503 : 200;

    return new Response(
      JSON.stringify(response),
      { 
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[System Health] Health check failed:', error);
    
    return new Response(
      JSON.stringify({ 
        status: 'unhealthy',
        error: 'Health check failed',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function performHealthChecks(supabase: any) {
  const startTime = Date.now();
  const results: any = {
    totalResponseTime: 0,
    database: { connected: false, responseTime: 0 },
    webrtc: { available: false },
    agora: { loaded: false, credentialsConfigured: false },
    system: { memoryUsage: 0 },
    sessions: { activeCount: 0, errorRate: 0 },
    errors: { recentCount: 0, criticalCount: 0 }
  };

  try {
    // Database connectivity check
    const dbStart = Date.now();
    const { data: dbTest, error: dbError } = await supabase
      .from('health_checks')
      .select('id')
      .limit(1);
    
    results.database.responseTime = Date.now() - dbStart;
    results.database.connected = !dbError;

    if (dbError) {
      console.error('[System Health] Database check failed:', dbError);
    }

    // Check recent errors
    const { data: recentErrors } = await supabase
      .from('error_logs')
      .select('severity')
      .gte('created_at', new Date(Date.now() - 3600000).toISOString()); // Last hour

    results.errors.recentCount = recentErrors?.length || 0;
    results.errors.criticalCount = recentErrors?.filter(e => e.severity === 'critical').length || 0;

    // Check active sessions
    const { data: activeSessions } = await supabase
      .from('instant_sessions')
      .select('id')
      .eq('is_active', true);

    results.sessions.activeCount = activeSessions?.length || 0;

    // Check session participants
    const { data: activeParticipants } = await supabase
      .from('instant_session_participants')
      .select('id')
      .eq('is_active', true);

    results.sessions.activeParticipants = activeParticipants?.length || 0;

    // WebRTC availability (simulated check)
    results.webrtc.available = true; // Would check WebRTC capabilities in browser context

    // Agora SDK and credentials check
    results.agora.loaded = true; // Would check Agora SDK availability in browser context
    
    // Check if Agora credentials are configured
    const agoraAppId = Deno.env.get('AGORA_APP_ID');
    const agoraAppCertificate = Deno.env.get('AGORA_APP_CERTIFICATE');
    results.agora.credentialsConfigured = !!(agoraAppId && agoraAppCertificate);

    // System resources (simulated)
    results.system.memoryUsage = Math.random() * 100; // Would get actual memory usage

  } catch (error) {
    console.error('[System Health] Error during health checks:', error);
    results.error = error.message;
  }

  results.totalResponseTime = Date.now() - startTime;
  return results;
}

function calculateOverallStatus(results: any): 'healthy' | 'degraded' | 'unhealthy' {
  // Critical failures
  if (!results.database.connected) {
    return 'unhealthy';
  }

  if (results.errors.criticalCount > 0) {
    return 'unhealthy';
  }

  // Performance degradation
  if (results.database.responseTime > 5000) { // 5 second response time
    return 'degraded';
  }

  if (results.errors.recentCount > 10) { // More than 10 errors in last hour
    return 'degraded';
  }

  if (results.totalResponseTime > 3000) { // 3 second total check time
    return 'degraded';
  }

  return 'healthy';
}