import { useEffect, useRef, useCallback } from 'react';
import { performanceMonitor, errorReporter } from '@/lib/production/monitoring';

// Custom hook for monitoring component performance
export const usePerformanceMonitoring = (componentName: string) => {
  const renderStartTime = useRef<number>(0);
  const mountTime = useRef<number>(0);

  useEffect(() => {
    mountTime.current = performance.now();
    performanceMonitor.recordMetric(`${componentName}_mount_time`, mountTime.current);
    
    return () => {
      const unmountTime = performance.now();
      performanceMonitor.recordMetric(`${componentName}_lifetime`, unmountTime - mountTime.current);
    };
  }, [componentName]);

  const startRender = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  const endRender = useCallback(() => {
    if (renderStartTime.current > 0) {
      const renderTime = performance.now() - renderStartTime.current;
      performanceMonitor.recordMetric(`${componentName}_render_time`, renderTime);
      renderStartTime.current = 0;
    }
  }, [componentName]);

  return { startRender, endRender };
};

// Custom hook for error boundary functionality
export const useErrorReporting = (context: string) => {
  const reportError = useCallback((error: Error, additionalData?: Record<string, any>) => {
    errorReporter.reportError(error, context, additionalData);
  }, [context]);

  const reportAsyncError = useCallback(async (errorPromise: Promise<any>, operation: string) => {
    try {
      await errorPromise;
    } catch (error) {
      reportError(error as Error, { operation });
      throw error; // Re-throw so the caller can handle it
    }
  }, [reportError]);

  return { reportError, reportAsyncError };
};

// Custom hook for connection quality monitoring
export const useConnectionMonitoring = () => {
  const connectionStart = useRef<number>(0);
  const qualityChecks = useRef<number[]>([]);

  const startConnectionCheck = useCallback(() => {
    connectionStart.current = performance.now();
  }, []);

  const recordConnectionQuality = useCallback((quality: 'excellent' | 'good' | 'poor' | 'disconnected') => {
    if (connectionStart.current > 0) {
      const connectionTime = performance.now() - connectionStart.current;
      performanceMonitor.recordMetric('connection_establishment_time', connectionTime);
      connectionStart.current = 0;
    }

    // Map quality to numeric values for tracking
    const qualityScore = {
      excellent: 4,
      good: 3,
      poor: 2,
      disconnected: 1
    }[quality];

    qualityChecks.current.push(qualityScore);
    
    // Keep only recent checks
    if (qualityChecks.current.length > 20) {
      qualityChecks.current = qualityChecks.current.slice(-20);
    }

    performanceMonitor.recordMetric('connection_quality_score', qualityScore);
  }, []);

  const getAverageQuality = useCallback(() => {
    if (qualityChecks.current.length === 0) return 0;
    return qualityChecks.current.reduce((a, b) => a + b, 0) / qualityChecks.current.length;
  }, []);

  return {
    startConnectionCheck,
    recordConnectionQuality,
    getAverageQuality
  };
};

// Custom hook for session analytics
export const useSessionAnalytics = (sessionId?: string) => {
  const sessionStart = useRef<number>(0);
  const participantEvents = useRef<Array<{
    event: 'join' | 'leave' | 'reconnect';
    timestamp: number;
    participantId: string;
  }>>([]);

  useEffect(() => {
    if (sessionId) {
      sessionStart.current = performance.now();
      performanceMonitor.recordMetric('session_started', 1);
    }

    return () => {
      if (sessionStart.current > 0) {
        const sessionDuration = performance.now() - sessionStart.current;
        performanceMonitor.recordMetric('session_duration', sessionDuration);
        performanceMonitor.recordMetric('session_ended', 1);
      }
    };
  }, [sessionId]);

  const recordParticipantEvent = useCallback((
    event: 'join' | 'leave' | 'reconnect',
    participantId: string
  ) => {
    const eventRecord = {
      event,
      timestamp: performance.now(),
      participantId
    };

    participantEvents.current.push(eventRecord);
    performanceMonitor.recordMetric(`participant_${event}`, 1);

    // Calculate participation metrics
    if (event === 'join' || event === 'leave') {
      const currentParticipants = new Set();
      let maxConcurrent = 0;

      participantEvents.current.forEach(evt => {
        if (evt.event === 'join') {
          currentParticipants.add(evt.participantId);
        } else if (evt.event === 'leave') {
          currentParticipants.delete(evt.participantId);
        }
        maxConcurrent = Math.max(maxConcurrent, currentParticipants.size);
      });

      performanceMonitor.recordMetric('max_concurrent_participants', maxConcurrent);
    }
  }, []);

  const getSessionMetrics = useCallback(() => {
    const duration = sessionStart.current > 0 ? performance.now() - sessionStart.current : 0;
    const joinEvents = participantEvents.current.filter(e => e.event === 'join').length;
    const leaveEvents = participantEvents.current.filter(e => e.event === 'leave').length;
    const reconnectEvents = participantEvents.current.filter(e => e.event === 'reconnect').length;

    return {
      duration,
      totalJoins: joinEvents,
      totalLeaves: leaveEvents,
      totalReconnects: reconnectEvents,
      stabilityScore: reconnectEvents === 0 ? 1 : Math.max(0, 1 - (reconnectEvents / joinEvents))
    };
  }, []);

  return {
    recordParticipantEvent,
    getSessionMetrics
  };
};

// Custom hook for bandwidth monitoring
export const useBandwidthMonitoring = () => {
  const bandwidthTests = useRef<number[]>([]);
  const lastTestTime = useRef<number>(0);

  const measureBandwidth = useCallback(async (): Promise<number> => {
    const now = performance.now();
    
    // Don't test too frequently
    if (now - lastTestTime.current < 10000) {
      return bandwidthTests.current[bandwidthTests.current.length - 1] || 0;
    }

    lastTestTime.current = now;

    try {
      // Simple bandwidth test using a small image
      const testStart = performance.now();
      const testImage = new Image();
      const testSize = 50000; // 50KB test file
      
      await new Promise((resolve, reject) => {
        testImage.onload = resolve;
        testImage.onerror = reject;
        testImage.src = `data:image/jpeg;base64,${'/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8H//2Q=='.repeat(testSize / 100)}`;
      });

      const testEnd = performance.now();
      const duration = testEnd - testStart;
      const bandwidth = (testSize * 8) / (duration / 1000); // bits per second
      const bandwidthKbps = bandwidth / 1000;

      bandwidthTests.current.push(bandwidthKbps);
      
      // Keep only recent tests
      if (bandwidthTests.current.length > 10) {
        bandwidthTests.current = bandwidthTests.current.slice(-10);
      }

      performanceMonitor.recordMetric('bandwidth_kbps', bandwidthKbps);
      return bandwidthKbps;

    } catch (error) {
      errorReporter.reportError(error as Error, 'bandwidth_measurement_failed');
      return 0;
    }
  }, []);

  const getAverageBandwidth = useCallback(() => {
    if (bandwidthTests.current.length === 0) return 0;
    return bandwidthTests.current.reduce((a, b) => a + b, 0) / bandwidthTests.current.length;
  }, []);

  const getBandwidthQuality = useCallback(() => {
    const avgBandwidth = getAverageBandwidth();
    if (avgBandwidth >= 1000) return 'excellent';
    if (avgBandwidth >= 500) return 'good';
    if (avgBandwidth >= 200) return 'poor';
    return 'disconnected';
  }, [getAverageBandwidth]);

  return {
    measureBandwidth,
    getAverageBandwidth,
    getBandwidthQuality
  };
};
