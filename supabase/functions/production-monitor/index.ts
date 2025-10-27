import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MonitoringData {
  type: 'performance' | 'error' | 'health' | 'session_analytics';
  data: any;
  timestamp: string;
  user_id?: string;
  session_id?: string;
}

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

    const monitoringData: MonitoringData = await req.json();
    
    console.log(`[Production Monitor] Received ${monitoringData.type} data`);

    let result;

    switch (monitoringData.type) {
      case 'performance':
        result = await handlePerformanceData(supabase, monitoringData);
        break;
      
      case 'error':
        result = await handleErrorData(supabase, monitoringData);
        break;
      
      case 'health':
        result = await handleHealthData(supabase, monitoringData);
        break;
      
      case 'session_analytics':
        result = await handleSessionAnalytics(supabase, monitoringData);
        break;
      
      default:
        throw new Error(`Unknown monitoring data type: ${monitoringData.type}`);
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[Production Monitor] Error processing data:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process monitoring data',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function handlePerformanceData(supabase: any, data: MonitoringData) {
  const performanceMetrics = data.data.metrics || [];
  
  if (performanceMetrics.length === 0) {
    return { message: 'No performance metrics to process' };
  }

  const { error } = await supabase
    .from('performance_metrics')
    .insert(performanceMetrics.map((metric: any) => ({
      metric_name: metric.name,
      count: metric.count || 1,
      average: metric.average || metric.value,
      min: metric.min || metric.value,
      max: metric.max || metric.value,
      timestamp: data.timestamp,
      user_id: data.user_id,
      session_id: data.session_id,
    })));

  if (error) {
    throw new Error(`Failed to insert performance metrics: ${error.message}`);
  }

  return { inserted: performanceMetrics.length };
}

async function handleErrorData(supabase: any, data: MonitoringData) {
  const errorData = data.data;
  
  const { error } = await supabase
    .from('error_logs')
    .insert({
      error_message: errorData.message,
      error_stack: errorData.stack,
      context: errorData.context,
      additional_data: errorData.additionalData,
      timestamp: data.timestamp,
      user_agent: errorData.userAgent,
      url: errorData.url,
      user_id: data.user_id,
      session_id: data.session_id,
      severity: errorData.severity || 'error',
    });

  if (error) {
    throw new Error(`Failed to insert error log: ${error.message}`);
  }

  // If this is a critical error, could trigger alerts here
  if (errorData.severity === 'critical') {
    console.warn('[Production Monitor] Critical error detected:', errorData.message);
  }

  return { logged: true };
}

async function handleHealthData(supabase: any, data: MonitoringData) {
  const healthData = data.data;
  
  const { error } = await supabase
    .from('health_checks')
    .insert({
      timestamp: data.timestamp,
      status: healthData.status,
      response_time_ms: healthData.responseTime,
      database_connected: healthData.databaseConnected,
      webrtc_available: healthData.webrtcAvailable,
      agora_sdk_loaded: healthData.agoraSdkLoaded,
      memory_usage_mb: healthData.memoryUsage,
      additional_checks: healthData.additionalChecks,
    });

  if (error) {
    throw new Error(`Failed to insert health check: ${error.message}`);
  }

  return { recorded: true };
}

async function handleSessionAnalytics(supabase: any, data: MonitoringData) {
  const analyticsData = data.data;
  
  // Update or insert session analytics
  const { error } = await supabase
    .from('session_analytics')
    .upsert({
      session_id: data.session_id,
      total_participants: analyticsData.totalParticipants,
      max_concurrent_participants: analyticsData.maxConcurrentParticipants,
      session_duration_minutes: analyticsData.sessionDurationMinutes,
      chat_messages_count: analyticsData.chatMessagesCount,
      disconnection_count: analyticsData.disconnectionCount,
      reconnection_count: analyticsData.reconnectionCount,
      average_bandwidth_kbps: analyticsData.averageBandwidthKbps,
      average_latency_ms: analyticsData.averageLatencyMs,
      quality_score: analyticsData.qualityScore,
      stability_score: analyticsData.stabilityScore,
    }, {
      onConflict: 'session_id'
    });

  if (error) {
    throw new Error(`Failed to upsert session analytics: ${error.message}`);
  }

  return { updated: true };
}