
import { useCallback } from 'react';

interface ErrorReport {
  message: string;
  stack?: string;
  url: string;
  timestamp: number;
  userAgent: string;
  userId?: string;
}

export function useErrorReporting() {
  const reportError = useCallback((error: Error, context?: Record<string, any>) => {
    const report: ErrorReport = {
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      ...context
    };

    // In production, send to error monitoring service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to your error monitoring service (e.g., Sentry, LogRocket)
      console.error('Error reported:', report);
    } else {
      console.error('Development Error:', error, context);
    }
  }, []);

  const reportPerformanceIssue = useCallback((metric: string, value: number, threshold: number) => {
    if (value > threshold) {
      reportError(new Error(`Performance issue: ${metric} took ${value}ms (threshold: ${threshold}ms)`), {
        metric,
        value,
        threshold,
        type: 'performance'
      });
    }
  }, [reportError]);

  return {
    reportError,
    reportPerformanceIssue
  };
}
