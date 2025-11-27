import { supabase } from '@/integrations/supabase/client';
import { PerformanceMonitor, ErrorReportingService } from './monitoring';

export interface SystemHealthMetrics {
  database: {
    connected: boolean;
    responseTime: number;
    errorRate: number;
  };
  webrtc: {
    available: boolean;
    supportLevel: 'full' | 'partial' | 'none';
  };
  network: {
    online: boolean;
    effectiveType?: string;
    rtt?: number;
    downlink?: number;
  };
  performance: {
    totalResponseTime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
}

export class EnhancedHealthMonitor {
  private static instance: EnhancedHealthMonitor;
  private healthInterval: NodeJS.Timeout | null = null;
  private retryCount = 0;
  private maxRetries = 3;
  private backoffDelay = 1000;

  static getInstance(): EnhancedHealthMonitor {
    if (!EnhancedHealthMonitor.instance) {
      EnhancedHealthMonitor.instance = new EnhancedHealthMonitor();
    }
    return EnhancedHealthMonitor.instance;
  }

  startMonitoring(intervalMs = 60000) {
    if (this.healthInterval) return;

    this.performHealthCheck(); // Initial check
    this.healthInterval = setInterval(() => {
      this.performHealthCheck();
    }, intervalMs);
  }

  stopMonitoring() {
    if (this.healthInterval) {
      clearInterval(this.healthInterval);
      this.healthInterval = null;
    }
  }

  async performHealthCheck(): Promise<SystemHealthMetrics> {
    const startTime = performance.now();
    const metrics: SystemHealthMetrics = {
      database: { connected: false, responseTime: 0, errorRate: 0 },
      webrtc: { available: false, supportLevel: 'none' },
      network: { online: navigator.onLine },
      performance: { totalResponseTime: 0, memoryUsage: 0, cpuUsage: 0 }
    };

    try {
      // Database health check with retry logic
      await this.checkDatabaseHealth(metrics);
      
      // WebRTC capability check
      this.checkWebRTCSupport(metrics);
      
      // Network quality check
      await this.checkNetworkQuality(metrics);
      
      // Performance metrics
      this.collectPerformanceMetrics(metrics, startTime);
      
      // Store health check result
      await this.storeHealthCheck(metrics);
      
      // Reset retry count on success
      this.retryCount = 0;
      
      return metrics;
      
    } catch (error) {
      await this.handleHealthCheckError(error, metrics);
      throw error;
    }
  }

  private async checkDatabaseHealth(metrics: SystemHealthMetrics) {
    const dbStart = performance.now();
    let attempts = 0;
    
    while (attempts <= this.maxRetries) {
      try {
        const { error } = await supabase
          .from('health_checks')
          .select('id')
          .limit(1);
        
        metrics.database.responseTime = performance.now() - dbStart;
        metrics.database.connected = !error;
        
        if (!error) break;
        
        attempts++;
        if (attempts <= this.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, this.backoffDelay * attempts));
        }
      } catch (error) {
        attempts++;
        if (attempts > this.maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, this.backoffDelay * attempts));
      }
    }
  }

  private checkWebRTCSupport(metrics: SystemHealthMetrics) {
    const hasRTCPeerConnection = !!(window as any).RTCPeerConnection;
    const hasGetUserMedia = !!(navigator.mediaDevices?.getUserMedia);
    const hasMediaDevices = !!navigator.mediaDevices;
    
    if (hasRTCPeerConnection && hasGetUserMedia && hasMediaDevices) {
      metrics.webrtc.available = true;
      metrics.webrtc.supportLevel = 'full';
    } else if (hasRTCPeerConnection) {
      metrics.webrtc.available = true;
      metrics.webrtc.supportLevel = 'partial';
    } else {
      metrics.webrtc.available = false;
      metrics.webrtc.supportLevel = 'none';
    }
  }

  private async checkNetworkQuality(metrics: SystemHealthMetrics) {
    metrics.network.online = navigator.onLine;
    
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      metrics.network.effectiveType = connection?.effectiveType;
      metrics.network.rtt = connection?.rtt;
      metrics.network.downlink = connection?.downlink;
    }
    
    // Ping test for real network latency
    if (metrics.network.online) {
      try {
        const pingStart = performance.now();
        await fetch('/health', { method: 'HEAD', cache: 'no-cache' }).catch(() => {});
        metrics.network.rtt = performance.now() - pingStart;
      } catch {
        // Ping failed, keep existing RTT or set to 0
      }
    }
  }

  private collectPerformanceMetrics(metrics: SystemHealthMetrics, startTime: number) {
    metrics.performance.totalResponseTime = performance.now() - startTime;
    
    // Memory usage (if available)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      metrics.performance.memoryUsage = memory.usedJSHeapSize / (1024 * 1024); // MB
    }
    
    // Estimate CPU usage based on processing time
    metrics.performance.cpuUsage = Math.min(metrics.performance.totalResponseTime / 10, 100);
  }

  private async storeHealthCheck(metrics: SystemHealthMetrics) {
    const overallStatus = this.calculateOverallStatus(metrics);
    
    const healthData = {
      service_name: 'enhanced_client_monitoring',
      status: overallStatus,
      response_time_ms: Math.round(metrics.performance.totalResponseTime),
      database_connected: metrics.database.connected,
      webrtc_available: metrics.webrtc.available,
      metadata: {
        webrtc_support: metrics.webrtc.supportLevel,
        network_type: metrics.network.effectiveType,
        network_rtt: metrics.network.rtt,
        memory_usage_mb: metrics.performance.memoryUsage,
        timestamp: new Date().toISOString()
      }
    };

    await supabase.from('health_checks').insert([healthData]);
    
    // Record performance metrics
    PerformanceMonitor.getInstance().recordMetric('health_check_response_time', metrics.performance.totalResponseTime);
    PerformanceMonitor.getInstance().recordMetric('database_response_time', metrics.database.responseTime);
    PerformanceMonitor.getInstance().recordMetric('memory_usage_mb', metrics.performance.memoryUsage);
  }

  private calculateOverallStatus(metrics: SystemHealthMetrics): 'healthy' | 'degraded' | 'unhealthy' {
    // Critical failures
    if (!metrics.database.connected || !metrics.network.online) {
      return 'unhealthy';
    }
    
    if (!metrics.webrtc.available || metrics.webrtc.supportLevel === 'none') {
      return 'unhealthy';
    }
    
    // Performance degradation
    if (metrics.database.responseTime > 5000) {
      return 'degraded';
    }
    
    if (metrics.performance.totalResponseTime > 3000) {
      return 'degraded';
    }
    
    if (metrics.webrtc.supportLevel === 'partial') {
      return 'degraded';
    }
    
    return 'healthy';
  }

  private async handleHealthCheckError(error: any, metrics: SystemHealthMetrics) {
    this.retryCount++;
    
    const errorContext = {
      retryCount: this.retryCount,
      metrics,
      timestamp: new Date().toISOString()
    };
    
    ErrorReportingService.getInstance().reportError(
      error,
      'health_check_failed',
      errorContext
    );
    
    // If we've exceeded retries, record unhealthy status
    if (this.retryCount >= this.maxRetries) {
      try {
        await supabase.from('health_checks').insert([{
          service_name: 'enhanced_client_monitoring',
          status: 'unhealthy',
          response_time_ms: Math.round(metrics.performance.totalResponseTime),
          database_connected: false,
          webrtc_available: metrics.webrtc.available,
          error_message: error.message,
          metadata: {
            error_context: errorContext,
            timestamp: new Date().toISOString()
          }
        }]);
      } catch (storeError) {
        console.error('Failed to store error health check:', storeError);
      }
    }
  }

  async getHealthStatus(): Promise<SystemHealthMetrics | null> {
    try {
      return await this.performHealthCheck();
    } catch (error) {
      console.error('Failed to get health status:', error);
      return null;
    }
  }
}

// Export singleton instance
export const enhancedHealthMonitor = EnhancedHealthMonitor.getInstance();
