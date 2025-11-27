
import { useEffect, useCallback } from 'react';
import { useSecurityLogger } from '@/hooks/use-security-logger';

export const useSessionMonitor = (sessionId: string) => {
  const { logActivity } = useSecurityLogger();

  const logSessionEvent = useCallback((eventType: string, metadata?: Record<string, any>) => {
    logActivity.mutate({
      activity_type: eventType,
      resource_type: 'session',
      resource_id: sessionId,
      metadata,
    });
  }, [logActivity, sessionId]);

  const startMonitoring = useCallback(() => {
    logSessionEvent('session_started');
  }, [logSessionEvent]);

  const stopMonitoring = useCallback(() => {
    logSessionEvent('session_ended');
  }, [logSessionEvent]);

  useEffect(() => {
    startMonitoring();
    window.addEventListener('beforeunload', stopMonitoring);

    return () => {
      stopMonitoring();
      window.removeEventListener('beforeunload', stopMonitoring);
    };
  }, [startMonitoring, stopMonitoring]);

  return {
    logSessionEvent,
    startMonitoring,
    stopMonitoring,
  };
};
