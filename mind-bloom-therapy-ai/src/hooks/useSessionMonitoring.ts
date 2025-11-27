import { useEffect, useRef, useState } from 'react';
import { logSecurityEvent } from '@/utils/security/security-event-logger';

interface SessionMetrics {
  startTime: number;
  endTime?: number;
  duration: number;
  participantCount: number;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
  errors: string[];
  reconnectionAttempts: number;
  bandwidthUsage: number;
}

interface UseSessionMonitoringProps {
  sessionId: string;
  userId?: string;
  onMetricsUpdate?: (metrics: SessionMetrics) => void;
}

export const useSessionMonitoring = ({ 
  sessionId, 
  userId,
  onMetricsUpdate 
}: UseSessionMonitoringProps) => {
  const [metrics, setMetrics] = useState<SessionMetrics>({
    startTime: Date.now(),
    duration: 0,
    participantCount: 0,
    connectionQuality: 'good',
    errors: [],
    reconnectionAttempts: 0,
    bandwidthUsage: 0
  });

  const metricsRef = useRef(metrics);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Update metrics ref when state changes
  useEffect(() => {
    metricsRef.current = metrics;
  }, [metrics]);

  // Start monitoring session
  useEffect(() => {
    const startTime = Date.now();
    
    // Log session start
    logSecurityEvent({
      eventType: 'video_session_started',
      userId,
      resourceType: 'video_session',
      resourceId: sessionId,
      severity: 'low',
      metadata: {
        startTime,
        userAgent: navigator.userAgent,
        connection: (navigator as any).connection?.effectiveType || 'unknown'
      }
    });

    // Update duration every second
    intervalRef.current = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        duration: Date.now() - startTime
      }));
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      // Log session end
      const endTime = Date.now();
      const finalMetrics = {
        ...metricsRef.current,
        endTime,
        duration: endTime - startTime
      };

      logSecurityEvent({
        eventType: 'video_session_ended',
        userId,
        resourceType: 'video_session',
        resourceId: sessionId,
        severity: 'low',
        metadata: finalMetrics
      });
    };
  }, [sessionId, userId]);

  // Call metrics update callback
  useEffect(() => {
    onMetricsUpdate?.(metrics);
  }, [metrics, onMetricsUpdate]);

  const updateParticipantCount = (count: number) => {
    setMetrics(prev => ({ ...prev, participantCount: count }));
  };

  const updateConnectionQuality = (quality: SessionMetrics['connectionQuality']) => {
    setMetrics(prev => ({ ...prev, connectionQuality: quality }));
    
    if (quality === 'poor') {
      logSecurityEvent({
        eventType: 'connection_quality_degraded',
        userId,
        resourceType: 'video_session',
        resourceId: sessionId,
        severity: 'medium',
        metadata: { quality, timestamp: Date.now() }
      });
    }
  };

  const recordError = (error: string) => {
    setMetrics(prev => ({
      ...prev,
      errors: [...prev.errors, error].slice(-10) // Keep last 10 errors
    }));

    logSecurityEvent({
      eventType: 'video_session_error',
      userId,
      resourceType: 'video_session',
      resourceId: sessionId,
      severity: 'medium',
      metadata: { error, timestamp: Date.now() }
    });
  };

  const recordReconnectionAttempt = () => {
    setMetrics(prev => ({
      ...prev,
      reconnectionAttempts: prev.reconnectionAttempts + 1
    }));

    logSecurityEvent({
      eventType: 'video_session_reconnection',
      userId,
      resourceType: 'video_session',
      resourceId: sessionId,
      severity: 'medium',
      metadata: { 
        attempt: metricsRef.current.reconnectionAttempts + 1,
        timestamp: Date.now() 
      }
    });
  };

  const updateBandwidthUsage = (usage: number) => {
    setMetrics(prev => ({ ...prev, bandwidthUsage: usage }));
  };

  return {
    metrics,
    updateParticipantCount,
    updateConnectionQuality,
    recordError,
    recordReconnectionAttempt,
    updateBandwidthUsage
  };
};