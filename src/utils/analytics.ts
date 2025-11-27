/**
 * Analytics and monitoring utilities
 */

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

class Analytics {
  private sessionId: string;
  private events: AnalyticsEvent[] = [];
  private userId?: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  track(event: string, properties?: Record<string, any>) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId
    };

    this.events.push(analyticsEvent);

    // In production, send to analytics service
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(analyticsEvent);
    } else {
      console.log('Analytics Event:', analyticsEvent);
    }
  }

  private async sendToAnalytics(event: AnalyticsEvent) {
    try {
      // TODO: Send to your analytics service
      // Example: await fetch('/api/analytics', { method: 'POST', body: JSON.stringify(event) });
    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
  }

  // Business metrics tracking
  trackUserAction(action: string, context?: Record<string, any>) {
    this.track('user_action', { action, ...context });
  }

  trackPageView(page: string, properties?: Record<string, any>) {
    this.track('page_view', { page, ...properties });
  }

  trackError(error: Error, context?: Record<string, any>) {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      ...context
    });
  }

  trackPerformance(metric: string, value: number, context?: Record<string, any>) {
    this.track('performance', {
      metric,
      value,
      ...context
    });
  }

  // Session management
  startNewSession() {
    this.sessionId = this.generateSessionId();
    this.track('session_start');
  }

  endSession() {
    this.track('session_end', {
      duration: Date.now() - parseInt(this.sessionId.split('_')[1])
    });
  }

  getSessionMetrics() {
    return {
      sessionId: this.sessionId,
      eventCount: this.events.length,
      startTime: parseInt(this.sessionId.split('_')[1]),
      userId: this.userId
    };
  }
}

export const analytics = new Analytics();

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!this.instance) {
      this.instance = new PerformanceMonitor();
    }
    return this.instance;
  }

  startTiming(label: string): () => void {
    const start = performance.now();
    
    return () => {
      const duration = performance.now() - start;
      this.recordMetric(label, duration);
      
      // Track significant performance issues
      if (duration > 1000) { // More than 1 second
        analytics.trackPerformance(label, duration, { slow: true });
      }
      
      return duration;
    };
  }

  recordMetric(label: string, value: number) {
    const existing = this.metrics.get(label) || [];
    existing.push(value);
    
    // Keep only last 100 measurements
    if (existing.length > 100) {
      existing.shift();
    }
    
    this.metrics.set(label, existing);
  }

  getMetrics(label: string) {
    const values = this.metrics.get(label) || [];
    if (values.length === 0) return null;

    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return { avg, min, max, count: values.length };
  }

  getAllMetrics() {
    const result: Record<string, any> = {};
    for (const [label, values] of this.metrics.entries()) {
      result[label] = this.getMetrics(label);
    }
    return result;
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();
