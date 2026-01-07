import { supabase } from '@/integrations/supabase/client';
import { enhancedHealthMonitor } from './enhanced-monitoring';

// Production configuration
export const PRODUCTION_CONFIG = {
  // Video conference limits
  MAX_PARTICIPANTS_PER_SESSION: 20,
  MAX_SESSION_DURATION_HOURS: 4,
  SESSION_CLEANUP_INTERVAL_MINUTES: 5,
  
  // Performance thresholds
  MIN_BANDWIDTH_KBPS: 100,
  TARGET_BANDWIDTH_KBPS: 500,
  MAX_BANDWIDTH_KBPS: 2000,
  
  // Connection timeouts
  CONNECTION_TIMEOUT_MS: 10000,
  RECONNECTION_ATTEMPTS: 3,
  RECONNECTION_DELAY_MS: 2000,
  
  // Analytics
  ANALYTICS_BATCH_SIZE: 50,
  ANALYTICS_FLUSH_INTERVAL_MS: 30000,
  
  // Error reporting
  ERROR_REPORTING_ENABLED: true,
  DETAILED_ERROR_LOGGING: false, // Set to false in production
  
  // Feature flags
  FEATURES: {
    RECORDING_ENABLED: false,
    SCREEN_SHARING_ENABLED: true,
    CHAT_ENABLED: true,
    BANDWIDTH_OPTIMIZATION: true,
    AUTOMATIC_RECONNECTION: true,
  }
};

// Environment detection
export const isProduction = () => {
  return window.location.hostname !== 'localhost' && 
         !window.location.hostname.includes('127.0.0.1') &&
         !window.location.hostname.includes('.local');
};

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  private flushInterval: NodeJS.Timeout | null = null;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMonitoring() {
    if (this.flushInterval) return;
    
    this.flushInterval = setInterval(() => {
      this.flushMetrics();
    }, PRODUCTION_CONFIG.ANALYTICS_FLUSH_INTERVAL_MS);
  }

  stopMonitoring() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    this.flushMetrics();
  }

  recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // Keep only recent values to prevent memory leaks
    if (values.length > PRODUCTION_CONFIG.ANALYTICS_BATCH_SIZE) {
      values.splice(0, values.length - PRODUCTION_CONFIG.ANALYTICS_BATCH_SIZE);
    }
  }

  private async flushMetrics() {
    if (this.metrics.size === 0) return;

    const metricsToFlush = new Map(this.metrics);
    this.metrics.clear();

    try {
      const aggregatedMetrics = Array.from(metricsToFlush.entries()).map(([name, values]) => ({
        metric_name: name,
        count: values.length,
        average: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        timestamp: new Date().toISOString(),
      }));

      const { error } = await supabase.from('performance_metrics').insert(aggregatedMetrics);
      // Silently ignore table not found errors - monitoring is optional
      if (error && !error.message?.includes('404') && !error.message?.includes('relation')) {
        console.warn('Performance metrics flush warning:', error.message);
      }
    } catch (error: any) {
      // Silently ignore network/table errors - monitoring shouldn't spam console
      if (error?.message && !error.message.includes('ERR_CONNECTION') && !error.message.includes('404')) {
        console.warn('Performance metrics flush warning:', error.message);
      }
      // Don't throw - monitoring shouldn't break the app
    }
  }
}

// Error reporting service
export class ErrorReportingService {
  private static instance: ErrorReportingService;
  private errorQueue: Array<{
    error: Error;
    context: string;
    timestamp: string;
    userId?: string;
    sessionId?: string;
  }> = [];

  static getInstance(): ErrorReportingService {
    if (!ErrorReportingService.instance) {
      ErrorReportingService.instance = new ErrorReportingService();
    }
    return ErrorReportingService.instance;
  }

  initialize() {
    if (!PRODUCTION_CONFIG.ERROR_REPORTING_ENABLED) return;

    // Global error handler
    window.onerror = (message, source, lineno, colno, error) => {
      this.reportError(error || new Error(String(message)), 'global_error', {
        source,
        lineno,
        colno,
      });
    };

    // Unhandled promise rejection handler
    window.onunhandledrejection = (event) => {
      this.reportError(
        new Error(event.reason),
        'unhandled_promise_rejection'
      );
    };
  }

  async reportError(
    error: Error,
    context: string,
    additionalData?: Record<string, any>
  ) {
    try {
      const errorReport = {
        error_message: error.message,
        error_stack: error.stack,
        context,
        additional_data: additionalData,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        url: window.location.href,
        user_id: await this.getCurrentUserId(),
      };

      // In production, batch errors to avoid overwhelming the database
      if (isProduction()) {
        this.errorQueue.push({
          error,
          context,
          timestamp: errorReport.timestamp,
          userId: errorReport.user_id,
        });

        if (this.errorQueue.length >= 10) {
          await this.flushErrors();
        }
      } else {
        // In development, log immediately
        await supabase.from('error_logs').insert([errorReport]);
      }

      // Always log to console in development
      if (PRODUCTION_CONFIG.DETAILED_ERROR_LOGGING) {
        console.error(`[${context}]`, error, additionalData);
      }
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }

  private async flushErrors() {
    if (this.errorQueue.length === 0) return;

    const errorsToFlush = [...this.errorQueue];
    this.errorQueue = [];

    try {
      const errorReports = errorsToFlush.map(item => ({
        error_message: item.error.message,
        error_stack: item.error.stack,
        context: item.context,
        timestamp: item.timestamp,
        user_id: item.userId,
        user_agent: navigator.userAgent,
        url: window.location.href,
      }));

      await supabase.from('error_logs').insert(errorReports);
    } catch (error) {
      console.error('Failed to flush error reports:', error);
      // Put errors back in queue for retry
      this.errorQueue.unshift(...errorsToFlush);
    }
  }

  private async getCurrentUserId(): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id || null;
    } catch {
      return null;
    }
  }
}

// Health check service
export class HealthCheckService {
  private static instance: HealthCheckService;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  static getInstance(): HealthCheckService {
    if (!HealthCheckService.instance) {
      HealthCheckService.instance = new HealthCheckService();
    }
    return HealthCheckService.instance;
  }

  startHealthChecks() {
    if (this.healthCheckInterval) return;

    this.performHealthCheck(); // Initial check
    
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 60000); // Check every minute
  }

  stopHealthChecks() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  private async performHealthCheck() {
    const startTime = performance.now();
    const healthData = {
      timestamp: new Date().toISOString(),
      status: 'healthy' as 'healthy' | 'degraded' | 'unhealthy',
      response_time_ms: 0,
      database_connected: false,
      webrtc_available: false,
    };

    try {
      // Test database connection
      const { error: dbError } = await supabase.from('health_checks').select('id').limit(1);
      healthData.database_connected = !dbError;

      // Test WebRTC availability
      healthData.webrtc_available = !!(window as any).RTCPeerConnection;

      healthData.response_time_ms = performance.now() - startTime;

      // Determine overall health status
      if (!healthData.database_connected || !healthData.webrtc_available) {
        healthData.status = 'unhealthy';
      } else if (healthData.response_time_ms > 5000) {
        healthData.status = 'degraded';
      }

      // Record health check
      await supabase.from('health_checks').insert([{
        ...healthData,
        service_name: 'client_monitoring'
      }]);

      // Record performance metric
      PerformanceMonitor.getInstance().recordMetric('health_check_response_time', healthData.response_time_ms);

    } catch (error) {
      healthData.status = 'unhealthy';
      healthData.response_time_ms = performance.now() - startTime;
      
      ErrorReportingService.getInstance().reportError(
        error as Error,
        'health_check_failed'
      );
    }
  }
}

// Production initialization
export const initializeProduction = async () => {
  try {
    // Initialize error reporting
    ErrorReportingService.getInstance().initialize();

    // Start performance monitoring
    PerformanceMonitor.getInstance().startMonitoring();

    // Start enhanced health monitoring
    enhancedHealthMonitor.startMonitoring();

    // Clean up old sessions and participants
    await cleanupExpiredSessions();

    console.log('Production services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize production services:', error);
    // Don't throw - app should still work even if monitoring fails
  }
};

// Cleanup utility
const cleanupExpiredSessions = async () => {
  try {
    const { error } = await supabase.rpc('cleanup_expired_instant_sessions');
    if (error) {
      throw error;
    }
  } catch (error) {
    ErrorReportingService.getInstance().reportError(
      error as Error,
      'session_cleanup_failed'
    );
  }
};

// Export singleton instances
export const performanceMonitor = PerformanceMonitor.getInstance();
export const errorReporter = ErrorReportingService.getInstance();
export const healthChecker = HealthCheckService.getInstance();
