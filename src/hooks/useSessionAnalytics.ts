import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AnalyticsEvent {
  sessionId: string;
  eventType: 'session_start' | 'session_end' | 'participant_join' | 'participant_leave' | 'quality_change' | 'error_occurred';
  participantId?: string;
  participantName?: string;
  metadata?: Record<string, any>;
  userId?: string;
}

export const useSessionAnalytics = () => {
  const trackEvent = useCallback(async (event: AnalyticsEvent) => {
    try {
      console.log('📊 Tracking analytics event:', event);
      
      // Track via edge function
      const { data, error } = await supabase.functions.invoke('session-analytics', {
        body: {
          action: 'track_event',
          ...event,
          timestamp: new Date().toISOString()
        }
      });

      if (error) {
        console.error('Failed to track analytics event:', error);
        return;
      }

      console.log('✅ Analytics event tracked successfully:', data);
    } catch (error) {
      console.error('Analytics tracking error:', error);
      // Don't show user errors for analytics failures
    }
  }, []);

  const trackSessionStart = useCallback((sessionId: string, userId?: string) => {
    trackEvent({
      sessionId,
      eventType: 'session_start',
      userId,
      metadata: {
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      }
    });
  }, [trackEvent]);

  const trackSessionEnd = useCallback((sessionId: string, duration: number, userId?: string) => {
    trackEvent({
      sessionId,
      eventType: 'session_end',
      userId,
      metadata: {
        duration,
        endedAt: Date.now()
      }
    });
  }, [trackEvent]);

  const trackParticipantJoin = useCallback((
    sessionId: string, 
    participantId: string, 
    participantName?: string, 
    userId?: string
  ) => {
    trackEvent({
      sessionId,
      eventType: 'participant_join',
      participantId,
      participantName,
      userId,
      metadata: {
        joinedAt: Date.now()
      }
    });
  }, [trackEvent]);

  const trackParticipantLeave = useCallback((
    sessionId: string, 
    participantId: string, 
    participantName?: string, 
    reason?: string,
    userId?: string
  ) => {
    trackEvent({
      sessionId,
      eventType: 'participant_leave',
      participantId,
      participantName,
      userId,
      metadata: {
        leftAt: Date.now(),
        reason
      }
    });
  }, [trackEvent]);

  const trackQualityChange = useCallback((
    sessionId: string, 
    quality: string, 
    networkQuality?: any,
    participantId?: string,
    userId?: string
  ) => {
    trackEvent({
      sessionId,
      eventType: 'quality_change',
      participantId,
      userId,
      metadata: {
        quality,
        networkQuality,
        timestamp: Date.now()
      }
    });
  }, [trackEvent]);

  const trackError = useCallback((
    sessionId: string, 
    error: string, 
    stack?: string,
    participantId?: string,
    userId?: string
  ) => {
    trackEvent({
      sessionId,
      eventType: 'error_occurred',
      participantId,
      userId,
      metadata: {
        error,
        stack,
        timestamp: Date.now(),
        userAgent: navigator.userAgent
      }
    });
  }, [trackEvent]);

  const getSessionReport = useCallback(async (sessionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('session-analytics', {
        body: {
          action: 'get_session_report',
          sessionId
        }
      });

      if (error) {
        throw error;
      }

      return data.report;
    } catch (error) {
      console.error('Failed to get session report:', error);
      toast.error('Failed to generate session report');
      return null;
    }
  }, []);

  const getSessionMetrics = useCallback(async (sessionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('session-analytics', {
        body: {
          action: 'calculate_metrics',
          sessionId
        }
      });

      if (error) {
        throw error;
      }

      return data.metrics;
    } catch (error) {
      console.error('Failed to get session metrics:', error);
      toast.error('Failed to get session metrics');
      return null;
    }
  }, []);

  return {
    trackEvent,
    trackSessionStart,
    trackSessionEnd,
    trackParticipantJoin,
    trackParticipantLeave,
    trackQualityChange,
    trackError,
    getSessionReport,
    getSessionMetrics
  };
};