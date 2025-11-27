import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SessionAnalytics {
  sessionId: string;
  totalParticipants: number;
  maxConcurrentParticipants: number;
  totalDurationSeconds: number;
  connectionQualityAvg: number;
  disconnectionCount: number;
  reconnectionCount: number;
  chatMessagesCount: number;
  recordingDurationSeconds: number;
}

interface UseSessionAnalyticsOptions {
  sessionId: string;
  trackingEnabled?: boolean;
  updateInterval?: number;
}

export function useSessionAnalytics({
  sessionId,
  trackingEnabled = true,
  updateInterval = 30000 // 30 seconds
}: UseSessionAnalyticsOptions) {
  const [analytics, setAnalytics] = useState<SessionAnalytics | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  // Track session start
  const trackSessionStart = useCallback(async () => {
    if (!trackingEnabled || !sessionId) return;

    try {
      // Initialize analytics record
      const { data, error } = await supabase
        .from('session_analytics')
        .upsert({
          session_id: sessionId,
          total_participants: 0,
          max_concurrent_participants: 0,
          total_duration_seconds: 0,
          connection_quality_avg: 0,
          disconnection_count: 0,
          reconnection_count: 0,
          chat_messages_count: 0,
          recording_duration_seconds: 0
        }, { onConflict: 'session_id' })
        .select()
        .single();

      if (error) throw error;

      setAnalytics({
        sessionId: data.session_id,
        totalParticipants: data.total_participants,
        maxConcurrentParticipants: data.max_concurrent_participants,
        totalDurationSeconds: data.total_duration_seconds,
        connectionQualityAvg: data.connection_quality_avg,
        disconnectionCount: data.disconnection_count,
        reconnectionCount: data.reconnection_count,
        chatMessagesCount: data.chat_messages_count,
        recordingDurationSeconds: data.recording_duration_seconds
      });

      setIsTracking(true);
      console.log('📊 Session analytics tracking started');

    } catch (error) {
      console.error('Error initializing session analytics:', error);
    }
  }, [sessionId, trackingEnabled]);

  // Update analytics data
  const updateAnalytics = useCallback(async () => {
    if (!isTracking || !sessionId) return;

    try {
      // Call the database function to update analytics
      const { error } = await supabase.rpc('update_session_analytics_data', {
        p_session_id: sessionId
      });

      if (error) throw error;

      // Fetch updated analytics
      const { data, error: fetchError } = await supabase
        .from('session_analytics')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (fetchError) throw fetchError;

      setAnalytics({
        sessionId: data.session_id,
        totalParticipants: data.total_participants,
        maxConcurrentParticipants: data.max_concurrent_participants,
        totalDurationSeconds: data.total_duration_seconds,
        connectionQualityAvg: data.connection_quality_avg,
        disconnectionCount: data.disconnection_count,
        reconnectionCount: data.reconnection_count,
        chatMessagesCount: data.chat_messages_count,
        recordingDurationSeconds: data.recording_duration_seconds
      });

    } catch (error) {
      console.error('Error updating session analytics:', error);
    }
  }, [isTracking, sessionId]);

  // Track participant join
  const trackParticipantJoin = useCallback(async (participantId: string) => {
    if (!isTracking) return;

    try {
      // This will be captured by the database function
      console.log('👥 Participant joined:', participantId);
      await updateAnalytics();
    } catch (error) {
      console.error('Error tracking participant join:', error);
    }
  }, [isTracking, updateAnalytics]);

  // Track participant leave
  const trackParticipantLeave = useCallback(async (participantId: string) => {
    if (!isTracking) return;

    try {
      console.log('👥 Participant left:', participantId);
      await updateAnalytics();
    } catch (error) {
      console.error('Error tracking participant leave:', error);
    }
  }, [isTracking, updateAnalytics]);

  // Track connection issue
  const trackConnectionIssue = useCallback(async (issueType: 'disconnection' | 'reconnection') => {
    if (!isTracking || !analytics) return;

    try {
      const updateField = issueType === 'disconnection' ? 'disconnection_count' : 'reconnection_count';
      const currentCount = issueType === 'disconnection' 
        ? analytics.disconnectionCount 
        : analytics.reconnectionCount;

      const { error } = await supabase
        .from('session_analytics')
        .update({ [updateField]: currentCount + 1 })
        .eq('session_id', sessionId);

      if (error) throw error;

      setAnalytics(prev => prev ? {
        ...prev,
        [issueType === 'disconnection' ? 'disconnectionCount' : 'reconnectionCount']: currentCount + 1
      } : null);

      console.log(`📊 Tracked ${issueType}:`, issueType);

    } catch (error) {
      console.error(`Error tracking ${issueType}:`, error);
    }
  }, [isTracking, analytics, sessionId]);

  // Track chat message
  const trackChatMessage = useCallback(async () => {
    if (!isTracking || !analytics) return;

    try {
      const newCount = analytics.chatMessagesCount + 1;

      const { error } = await supabase
        .from('session_analytics')
        .update({ chat_messages_count: newCount })
        .eq('session_id', sessionId);

      if (error) throw error;

      setAnalytics(prev => prev ? {
        ...prev,
        chatMessagesCount: newCount
      } : null);

    } catch (error) {
      console.error('Error tracking chat message:', error);
    }
  }, [isTracking, analytics, sessionId]);

  // Update session duration
  const updateSessionDuration = useCallback(async (durationSeconds: number) => {
    if (!isTracking) return;

    try {
      const { error } = await supabase
        .from('session_analytics')
        .update({ total_duration_seconds: durationSeconds })
        .eq('session_id', sessionId);

      if (error) throw error;

      setAnalytics(prev => prev ? {
        ...prev,
        totalDurationSeconds: durationSeconds
      } : null);

    } catch (error) {
      console.error('Error updating session duration:', error);
    }
  }, [isTracking, sessionId]);

  // Stop tracking
  const stopTracking = useCallback(async () => {
    setIsTracking(false);
    console.log('📊 Session analytics tracking stopped');
  }, []);

  // Get analytics summary
  const getAnalyticsSummary = useCallback(() => {
    if (!analytics) return null;

    return {
      participantEngagement: analytics.totalParticipants > 0 ? 
        (analytics.maxConcurrentParticipants / analytics.totalParticipants * 100).toFixed(1) + '%' : '0%',
      averageSessionLength: analytics.totalDurationSeconds > 0 ? 
        Math.round(analytics.totalDurationSeconds / 60) + ' minutes' : '0 minutes',
      connectionStability: analytics.disconnectionCount === 0 ? 'Excellent' :
        analytics.disconnectionCount <= 2 ? 'Good' : 'Poor',
      interactionLevel: analytics.chatMessagesCount > 10 ? 'High' :
        analytics.chatMessagesCount > 3 ? 'Medium' : 'Low'
    };
  }, [analytics]);

  // Initialize tracking on mount
  useEffect(() => {
    if (trackingEnabled && sessionId) {
      trackSessionStart();
    }
  }, [trackSessionStart, trackingEnabled, sessionId]);

  // Set up periodic updates
  useEffect(() => {
    if (!isTracking || !updateInterval) return;

    const interval = setInterval(updateAnalytics, updateInterval);
    return () => clearInterval(interval);
  }, [isTracking, updateAnalytics, updateInterval]);

  return {
    analytics,
    isTracking,
    trackParticipantJoin,
    trackParticipantLeave,
    trackConnectionIssue,
    trackChatMessage,
    updateSessionDuration,
    stopTracking,
    getAnalyticsSummary
  };
}