/**
 * System monitoring utilities for health checks and performance
 */

interface HealthCheck {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  error?: string;
  lastCheck: Date;
}

// Define MemoryInfo interface for browsers that support it
interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface SystemMetrics {
  memoryUsage?: MemoryInfo;
  connectionCount?: number;
  errorRate?: number;
  avgResponseTime?: number;
}

class SystemMonitor {
  private healthChecks: Map<string, HealthCheck> = new Map();
  private metrics: SystemMetrics = {};
  private isMonitoring = false;
  private permissionMonitoringInterval?: NodeJS.Timeout;
  private permissionState: {
    camera: boolean;
    microphone: boolean;
    lastCheck: Date;
  } = {
    camera: false,
    microphone: false,
    lastCheck: new Date()
  };

  /**
   * Start system monitoring
   */
  start(intervalMs: number = 30000) {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('[SystemMonitor] Starting monitoring...');
    
    // Run initial health checks
    this.runHealthChecks();
    this.startPermissionMonitoring();
    
    // Set up periodic monitoring
    setInterval(() => {
      this.runHealthChecks();
      this.collectMetrics();
    }, intervalMs);
  }

  /**
   * Stop monitoring
   */
  stop() {
    this.isMonitoring = false;
    if (this.permissionMonitoringInterval) {
      clearInterval(this.permissionMonitoringInterval);
    }
    console.log('[SystemMonitor] Monitoring stopped');
  }

  /**
   * Register a health check
   */
  registerHealthCheck(name: string, checkFn: () => Promise<boolean>) {
    const check = async () => {
      const startTime = Date.now();
      
      try {
        const result = await checkFn();
        const responseTime = Date.now() - startTime;
        
        this.healthChecks.set(name, {
          name,
          status: result ? 'healthy' : 'degraded',
          responseTime,
          lastCheck: new Date()
        });
        
        return result;
      } catch (error) {
        this.healthChecks.set(name, {
          name,
          status: 'unhealthy',
          responseTime: Date.now() - startTime,
          error: error instanceof Error ? error.message : String(error),
          lastCheck: new Date()
        });
        
        return false;
      }
    };

    // Store the check function for later execution
    (this as any)[`_check_${name}`] = check;
  }

  /**
   * Run all registered health checks
   */
  private async runHealthChecks() {
    const checkPromises: Promise<any>[] = [];
    
    // Find all check functions
    for (const key of Object.keys(this)) {
      if (key.startsWith('_check_')) {
        const checkFn = (this as any)[key];
        if (typeof checkFn === 'function') {
          checkPromises.push(checkFn());
        }
      }
    }
    
    if (checkPromises.length > 0) {
      await Promise.allSettled(checkPromises);
    }
  }

  /**
   * Collect system metrics
   */
  private collectMetrics() {
    try {
      // Memory usage (if available)
      if ('memory' in performance) {
        this.metrics.memoryUsage = (performance as any).memory;
      }
      
      // Connection count estimation
      this.metrics.connectionCount = navigator.onLine ? 1 : 0;
      
      // Calculate error rate from health checks
      const checks = Array.from(this.healthChecks.values());
      const unhealthyCount = checks.filter(check => check.status === 'unhealthy').length;
      this.metrics.errorRate = checks.length > 0 ? (unhealthyCount / checks.length) * 100 : 0;
      
      // Average response time
      const responseTimes = checks
        .filter(check => check.responseTime !== undefined)
        .map(check => check.responseTime!);
      
      this.metrics.avgResponseTime = responseTimes.length > 0
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
        : 0;
        
    } catch (error) {
      console.error('[SystemMonitor] Error collecting metrics:', error);
    }
  }

  /**
   * Get current health status
   */
  getHealthStatus() {
    const checks = Array.from(this.healthChecks.values());
    const healthyCount = checks.filter(check => check.status === 'healthy').length;
    const degradedCount = checks.filter(check => check.status === 'degraded').length;
    const unhealthyCount = checks.filter(check => check.status === 'unhealthy').length;
    
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (unhealthyCount > 0) {
      overallStatus = 'unhealthy';
    } else if (degradedCount > 0) {
      overallStatus = 'degraded';
    }
    
    return {
      overall: overallStatus,
      checks: checks,
      summary: {
        total: checks.length,
        healthy: healthyCount,
        degraded: degradedCount,
        unhealthy: unhealthyCount
      }
    };
  }

  /**
   * Get current metrics
   */
  getMetrics(): SystemMetrics {
    return { ...this.metrics };
  }

  /**
   * Check if system is healthy
   */
  isHealthy(): boolean {
    const status = this.getHealthStatus();
    return status.overall === 'healthy';
  }

  /**
   * Start real-time permission monitoring
   */
  private startPermissionMonitoring() {
    this.checkPermissions();
    
    // Check permissions every 5 seconds
    this.permissionMonitoringInterval = setInterval(() => {
      this.checkPermissions();
    }, 5000);
  }

  /**
   * Check media permissions status using same method as unified permission handler
   */
  private async checkPermissions() {
    try {
      // Use getUserMedia as the authoritative source for permission detection
      // This matches the unified permission handler approach
      let cameraGranted = false;
      let micGranted = false;
      let errorMessage: string | undefined;
      
      try {
        // Test actual device access - most reliable method
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        // If we get here, permissions are granted
        cameraGranted = true;
        micGranted = true;
        
        // Stop tracks immediately
        stream.getTracks().forEach(track => track.stop());
        
        console.log('✅ [SystemMonitor] Device access test successful');
      } catch (deviceError: any) {
        console.log('🔍 [SystemMonitor] Device access test failed:', deviceError.name);
        
        // If getUserMedia fails, try navigator.permissions as fallback
        if (navigator.permissions) {
          try {
            const [cameraResult, microphoneResult] = await Promise.all([
              navigator.permissions.query({ name: 'camera' as PermissionName }),
              navigator.permissions.query({ name: 'microphone' as PermissionName })
            ]);
            
            cameraGranted = cameraResult.state === 'granted';
            micGranted = microphoneResult.state === 'granted';
            
            if (!cameraGranted || !micGranted) {
              errorMessage = `Permissions: camera=${cameraResult.state}, microphone=${microphoneResult.state}`;
            }
          } catch (permError) {
            errorMessage = deviceError.message || 'Device access failed';
          }
        } else {
          errorMessage = deviceError.message || 'Device access failed';
        }
      }
      
      // Detect permission changes
      if (cameraGranted !== this.permissionState.camera || 
          micGranted !== this.permissionState.microphone) {
        
        console.log('[SystemMonitor] Permission state changed:', {
          camera: { old: this.permissionState.camera, new: cameraGranted },
          microphone: { old: this.permissionState.microphone, new: micGranted }
        });
        
        // Update permission health check
        this.healthChecks.set('permissions', {
          name: 'permissions',
          status: (cameraGranted && micGranted) ? 'healthy' : 'degraded',
          lastCheck: new Date(),
          error: errorMessage
        });
      }
      
      this.permissionState = {
        camera: cameraGranted,
        microphone: micGranted,
        lastCheck: new Date()
      };
      
    } catch (error) {
      console.error('[SystemMonitor] Permission check completely failed:', error);
      this.healthChecks.set('permissions', {
        name: 'permissions',
        status: 'unhealthy',
        lastCheck: new Date(),
        error: error instanceof Error ? error.message : 'Permission check failed'
      });
    }
  }

  /**
   * Get current permission state
   */
  getPermissionState() {
    return { ...this.permissionState };
  }

  /**
   * Attempt automatic error recovery
   */
  async attemptAutoRecovery(errorType: string): Promise<boolean> {
    console.log(`[SystemMonitor] Attempting auto-recovery for: ${errorType}`);
    
    try {
      switch (errorType) {
        case 'database':
          // Re-run database health check
          return await this.retryHealthCheck('database');
          
        case 'permissions':
          // Try to request permissions again
          try {
            await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            await this.checkPermissions();
            return this.permissionState.camera && this.permissionState.microphone;
          } catch {
            return false;
          }
          
        case 'network':
          // Check network connectivity
          try {
            await fetch('/api/ping', { method: 'HEAD', cache: 'no-cache' });
            return true;
          } catch {
            return false;
          }
          
        default:
          console.warn(`[SystemMonitor] No auto-recovery strategy for: ${errorType}`);
          return false;
      }
    } catch (error) {
      console.error(`[SystemMonitor] Auto-recovery failed for ${errorType}:`, error);
      return false;
    }
  }

  /**
   * Retry a specific health check
   */
  private async retryHealthCheck(checkName: string): Promise<boolean> {
    const checkFn = (this as any)[`_check_${checkName}`];
    if (typeof checkFn === 'function') {
      try {
        return await checkFn();
      } catch (error) {
        console.error(`[SystemMonitor] Retry failed for ${checkName}:`, error);
        return false;
      }
    }
    return false;
  }
}

// Create singleton instance
export const systemMonitor = new SystemMonitor();

// Initialize with common health checks
export function initializeSystemMonitoring() {
  // Auth service health check
  systemMonitor.registerHealthCheck('auth', async () => {
    try {
      const { data } = await import('@/integrations/supabase/client')
        .then(module => module.supabase.auth.getSession());
      return true;
    } catch {
      return false;
    }
  });

  // Database connectivity check
  systemMonitor.registerHealthCheck('database', async () => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { error } = await supabase.from('audit_logs').select('count', { count: 'exact', head: true });
      return !error;
    } catch {
      return false;
    }
  });

  // WebRTC availability check
  systemMonitor.registerHealthCheck('webrtc', async () => {
    try {
      return !!(
        window.RTCPeerConnection &&
        navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia
      );
    } catch {
      return false;
    }
  });

  // WebRTC SDK check - native implementation
  systemMonitor.registerHealthCheck('webrtc', async () => {
    try {
      return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    } catch {
      return false;
    }
  });

  // Start monitoring
  systemMonitor.start();
}
