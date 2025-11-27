import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SessionAnalyticsEvent {
  sessionId: string;
  eventType: 'session_start' | 'session_end' | 'participant_join' | 'participant_leave' | 'quality_change' | 'error_occurred';
  participantId?: string;
  participantName?: string;
  metadata?: Record<string, any>;
  timestamp: string;
  userId?: string;
}

interface SessionMetrics {
  sessionId: string;
  totalDuration: number;
  participantCount: number;
  maxConcurrentParticipants: number;
  averageConnectionQuality: number;
  disconnectionCount: number;
  reconnectionCount: number;
  errorCount: number;
  bandwidthUsage?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, ...payload } = await req.json();

    console.log(`📊 Session Analytics: ${action}`, payload);

    switch (action) {
      case 'track_event':
        return await trackSessionEvent(supabase, payload as SessionAnalyticsEvent);
      
      case 'calculate_metrics':
        return await calculateSessionMetrics(supabase, payload.sessionId);
      
      case 'get_session_report':
        return await getSessionReport(supabase, payload.sessionId);
      
      case 'monitor_session_health':
        return await monitorSessionHealth(supabase, payload.sessionId);
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('❌ Session Analytics Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function trackSessionEvent(supabase: any, event: SessionAnalyticsEvent) {
  console.log(`📈 Tracking event: ${event.eventType} for session ${event.sessionId}`);
  
  // Store the analytics event
  const { error: insertError } = await supabase
    .from('session_analytics_events')
    .insert([{
      session_id: event.sessionId,
      event_type: event.eventType,
      participant_id: event.participantId,
      participant_name: event.participantName,
      metadata: event.metadata || {},
      user_id: event.userId,
      created_at: event.timestamp || new Date().toISOString()
    }]);

  if (insertError) {
    console.error('Failed to insert analytics event:', insertError);
    throw insertError;
  }

  // Update real-time metrics based on event type
  await updateRealtimeMetrics(supabase, event);

  return new Response(
    JSON.stringify({ 
      success: true,
      eventTracked: event.eventType,
      timestamp: new Date().toISOString()
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function updateRealtimeMetrics(supabase: any, event: SessionAnalyticsEvent) {
  const sessionId = event.sessionId;
  
  switch (event.eventType) {
    case 'session_start':
      await supabase
        .from('session_analytics')
        .upsert({
          session_id: sessionId,
          session_started_at: event.timestamp,
          status: 'active'
        });
      break;
      
    case 'session_end':
      const sessionEndTime = new Date(event.timestamp);
      const { data: sessionData } = await supabase
        .from('session_analytics')
        .select('session_started_at')
        .eq('session_id', sessionId)
        .single();
      
      if (sessionData?.session_started_at) {
        const startTime = new Date(sessionData.session_started_at);
        const duration = Math.floor((sessionEndTime.getTime() - startTime.getTime()) / 1000);
        
        await supabase
          .from('session_analytics')
          .update({
            session_ended_at: event.timestamp,
            total_duration_seconds: duration,
            status: 'completed'
          })
          .eq('session_id', sessionId);
      }
      break;
      
    case 'participant_join':
      await supabase.rpc('increment_participant_count', { 
        session_id_param: sessionId 
      });
      break;
      
    case 'participant_leave':
      await supabase.rpc('decrement_participant_count', { 
        session_id_param: sessionId 
      });
      break;
      
    case 'quality_change':
      if (event.metadata?.quality) {
        await supabase
          .from('session_quality_metrics')
          .insert({
            session_id: sessionId,
            participant_id: event.participantId,
            connection_quality: event.metadata.quality,
            network_quality: event.metadata.networkQuality,
            timestamp: event.timestamp
          });
      }
      break;
      
    case 'error_occurred':
      await supabase.rpc('increment_error_count', { 
        session_id_param: sessionId 
      });
      break;
  }
}

async function calculateSessionMetrics(supabase: any, sessionId: string) {
  console.log(`📊 Calculating metrics for session: ${sessionId}`);
  
  // Get basic session data
  const { data: sessionData } = await supabase
    .from('session_analytics')
    .select('*')
    .eq('session_id', sessionId)
    .single();
  
  if (!sessionData) {
    throw new Error('Session not found');
  }
  
  // Get participant events
  const { data: events } = await supabase
    .from('session_analytics_events')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });
  
  // Calculate metrics
  const joinEvents = events?.filter(e => e.event_type === 'participant_join') || [];
  const leaveEvents = events?.filter(e => e.event_type === 'participant_leave') || [];
  const errorEvents = events?.filter(e => e.event_type === 'error_occurred') || [];
  
  const metrics: SessionMetrics = {
    sessionId,
    totalDuration: sessionData.total_duration_seconds || 0,
    participantCount: joinEvents.length,
    maxConcurrentParticipants: sessionData.max_concurrent_participants || 0,
    averageConnectionQuality: await calculateAverageQuality(supabase, sessionId),
    disconnectionCount: leaveEvents.filter(e => e.metadata?.reason === 'disconnect').length,
    reconnectionCount: events?.filter(e => e.event_type === 'participant_join' && e.metadata?.isReconnection).length || 0,
    errorCount: errorEvents.length
  };
  
  return new Response(
    JSON.stringify({ 
      success: true,
      metrics,
      timestamp: new Date().toISOString()
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function calculateAverageQuality(supabase: any, sessionId: string) {
  const { data: qualityData } = await supabase
    .from('session_quality_metrics')
    .select('connection_quality')
    .eq('session_id', sessionId);
  
  if (!qualityData || qualityData.length === 0) return 0;
  
  const qualityMap = { 'excellent': 4, 'good': 3, 'poor': 2, 'disconnected': 1 };
  const totalQuality = qualityData.reduce((sum, q) => sum + (qualityMap[q.connection_quality as keyof typeof qualityMap] || 0), 0);
  
  return Math.round((totalQuality / qualityData.length) * 100) / 100;
}

async function getSessionReport(supabase: any, sessionId: string) {
  console.log(`📋 Generating session report for: ${sessionId}`);
  
  const [metricsResponse, { data: events }, { data: participants }] = await Promise.all([
    calculateSessionMetrics(supabase, sessionId),
    supabase
      .from('session_analytics_events')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true }),
    supabase
      .from('instant_session_participants')
      .select('*')
      .eq('session_id', sessionId)
  ]);
  
  const metrics = JSON.parse(await metricsResponse.text()).metrics;
  
  const report = {
    sessionId,
    generatedAt: new Date().toISOString(),
    summary: metrics,
    events: events || [],
    participants: participants || [],
    timeline: generateTimeline(events || []),
    recommendations: generateRecommendations(metrics)
  };
  
  return new Response(
    JSON.stringify({ 
      success: true,
      report,
      timestamp: new Date().toISOString()
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function monitorSessionHealth(supabase: any, sessionId: string) {
  console.log(`🏥 Monitoring session health for: ${sessionId}`);
  
  const { data: recentEvents } = await supabase
    .from('session_analytics_events')
    .select('*')
    .eq('session_id', sessionId)
    .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Last 5 minutes
    .order('created_at', { ascending: false });
  
  const errors = recentEvents?.filter(e => e.event_type === 'error_occurred') || [];
  const disconnections = recentEvents?.filter(e => e.event_type === 'participant_leave' && e.metadata?.reason === 'disconnect') || [];
  
  const healthStatus = {
    sessionId,
    timestamp: new Date().toISOString(),
    status: errors.length > 3 ? 'critical' : disconnections.length > 2 ? 'warning' : 'healthy',
    metrics: {
      recentErrors: errors.length,
      recentDisconnections: disconnections.length,
      activeParticipants: await getActiveParticipantCount(supabase, sessionId)
    },
    alerts: generateHealthAlerts(errors, disconnections)
  };
  
  // Store health check
  await supabase
    .from('health_checks')
    .insert({
      service_name: `session_${sessionId}`,
      status: healthStatus.status,
      metadata: healthStatus.metrics,
      response_time_ms: null,
      error_message: healthStatus.status === 'critical' ? 'Multiple errors detected' : null
    });
  
  return new Response(
    JSON.stringify({ 
      success: true,
      health: healthStatus
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getActiveParticipantCount(supabase: any, sessionId: string) {
  const { data, error } = await supabase
    .from('instant_session_participants')
    .select('id')
    .eq('session_id', sessionId)
    .eq('is_active', true);
  
  return data?.length || 0;
}

function generateTimeline(events: any[]) {
  return events.map(event => ({
    timestamp: event.created_at,
    type: event.event_type,
    participant: event.participant_name || event.participant_id,
    description: generateEventDescription(event)
  }));
}

function generateEventDescription(event: any) {
  switch (event.event_type) {
    case 'session_start':
      return 'Session started';
    case 'session_end':
      return 'Session ended';
    case 'participant_join':
      return `${event.participant_name || 'Participant'} joined the session`;
    case 'participant_leave':
      return `${event.participant_name || 'Participant'} left the session`;
    case 'quality_change':
      return `Connection quality changed to ${event.metadata?.quality || 'unknown'}`;
    case 'error_occurred':
      return `Error: ${event.metadata?.error || 'Unknown error'}`;
    default:
      return `Unknown event: ${event.event_type}`;
  }
}

function generateRecommendations(metrics: SessionMetrics) {
  const recommendations = [];
  
  if (metrics.averageConnectionQuality < 2.5) {
    recommendations.push('Consider implementing adaptive bitrate streaming to improve connection quality');
  }
  
  if (metrics.disconnectionCount > 3) {
    recommendations.push('High disconnection rate detected. Review network stability and implement better reconnection logic');
  }
  
  if (metrics.errorCount > 5) {
    recommendations.push('Multiple errors detected. Review error logs and implement additional error handling');
  }
  
  if (metrics.maxConcurrentParticipants > 10) {
    recommendations.push('Large session detected. Consider implementing stream optimization for better performance');
  }
  
  return recommendations;
}

function generateHealthAlerts(errors: any[], disconnections: any[]) {
  const alerts = [];
  
  if (errors.length > 3) {
    alerts.push({
      level: 'critical',
      message: `High error rate: ${errors.length} errors in the last 5 minutes`,
      action: 'Investigate error logs and consider session restart'
    });
  }
  
  if (disconnections.length > 2) {
    alerts.push({
      level: 'warning',
      message: `Multiple disconnections: ${disconnections.length} participants disconnected recently`,
      action: 'Monitor network quality and connection stability'
    });
  }
  
  return alerts;
}