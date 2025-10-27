/**
 * Authentication Migration Monitoring System
 * Tracks migration progress and system stability during the transition
 */

interface MigrationStats {
  totalComponents: number;
  migratedComponents: number;
  compatibilityLayerUsage: number;
  errorCount: number;
  performanceMetrics: {
    authCheckTime: number;
    roleCheckTime: number;
    permissionCheckTime: number;
  };
  lastUpdated: Date;
}

interface MigrationEvent {
  id: string;
  timestamp: Date;
  type: 'migration' | 'error' | 'warning' | 'performance';
  component: string;
  message: string;
  details?: Record<string, any>;
}

class AuthMigrationMonitor {
  private events: MigrationEvent[] = [];
  private stats: MigrationStats = {
    totalComponents: 177,
    migratedComponents: 0,
    compatibilityLayerUsage: 177,
    errorCount: 0,
    performanceMetrics: {
      authCheckTime: 0,
      roleCheckTime: 0,
      permissionCheckTime: 0
    },
    lastUpdated: new Date()
  };

  // Track component migration
  logMigration(componentName: string, fromSystem: string, toSystem: string) {
    const event: MigrationEvent = {
      id: `migration-${Date.now()}`,
      timestamp: new Date(),
      type: 'migration',
      component: componentName,
      message: `Migrated from ${fromSystem} to ${toSystem}`,
      details: { fromSystem, toSystem }
    };
    
    this.events.push(event);
    this.updateStats();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 [Migration] ${componentName}: ${fromSystem} → ${toSystem}`);
    }
  }

  // Track authentication errors
  logError(componentName: string, error: Error, context?: Record<string, any>) {
    const event: MigrationEvent = {
      id: `error-${Date.now()}`,
      timestamp: new Date(),
      type: 'error',
      component: componentName,
      message: error.message,
      details: { 
        stack: error.stack,
        context
      }
    };
    
    this.events.push(event);
    this.stats.errorCount++;
    this.stats.lastUpdated = new Date();
    
    console.error(`❌ [Migration Error] ${componentName}:`, error);
  }

  // Track performance metrics
  logPerformance(operation: 'auth' | 'role' | 'permission', duration: number, component: string) {
    const event: MigrationEvent = {
      id: `perf-${Date.now()}`,
      timestamp: new Date(),
      type: 'performance',
      component,
      message: `${operation} check took ${duration}ms`,
      details: { operation, duration }
    };
    
    this.events.push(event);
    
    // Update performance metrics
    switch (operation) {
      case 'auth':
        this.stats.performanceMetrics.authCheckTime = duration;
        break;
      case 'role':
        this.stats.performanceMetrics.roleCheckTime = duration;
        break;
      case 'permission':
        this.stats.performanceMetrics.permissionCheckTime = duration;
        break;
    }
    
    this.stats.lastUpdated = new Date();
    
    if (duration > 100) {
      console.warn(`⚠️ [Performance] Slow ${operation} check in ${component}: ${duration}ms`);
    }
  }

  // Get current migration statistics
  getStats(): MigrationStats {
    return { ...this.stats };
  }

  // Get recent events
  getRecentEvents(limit: number = 50): MigrationEvent[] {
    return this.events
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Get events by type
  getEventsByType(type: MigrationEvent['type']): MigrationEvent[] {
    return this.events.filter(event => event.type === type);
  }

  // Update statistics
  private updateStats() {
    const migrationEvents = this.getEventsByType('migration');
    this.stats.migratedComponents = migrationEvents.length;
    this.stats.compatibilityLayerUsage = Math.max(0, this.stats.totalComponents - migrationEvents.length);
    this.stats.lastUpdated = new Date();
  }

  // Generate migration report
  generateReport(): string {
    const stats = this.getStats();
    const errors = this.getEventsByType('error');
    const warnings = this.getEventsByType('warning');
    const recentEvents = this.getRecentEvents(10);
    
    const progressPercentage = ((stats.migratedComponents / stats.totalComponents) * 100).toFixed(1);
    
    return `
# Auth Migration Report
Generated: ${new Date().toISOString()}

## Progress
- Total Components: ${stats.totalComponents}
- Migrated: ${stats.migratedComponents} (${progressPercentage}%)
- Still Using Compatibility Layer: ${stats.compatibilityLayerUsage}

## System Health
- Total Errors: ${stats.errorCount}
- Recent Warnings: ${warnings.length}
- Performance Issues: ${recentEvents.filter(e => e.type === 'performance' && e.details?.duration > 100).length}

## Performance Metrics
- Auth Check Time: ${stats.performanceMetrics.authCheckTime}ms
- Role Check Time: ${stats.performanceMetrics.roleCheckTime}ms
- Permission Check Time: ${stats.performanceMetrics.permissionCheckTime}ms

## Recent Activity
${recentEvents.slice(0, 5).map(event => 
  `- ${event.timestamp.toISOString()}: ${event.type.toUpperCase()} in ${event.component} - ${event.message}`
).join('\n')}
    `.trim();
  }

  // Clear old events (keep last 1000)
  cleanupEvents() {
    if (this.events.length > 1000) {
      this.events = this.events
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 1000);
    }
  }
}

// Singleton instance
export const authMigrationMonitor = new AuthMigrationMonitor();

// Helper function to measure performance
export function measureAuthPerformance<T>(
  operation: 'auth' | 'role' | 'permission',
  component: string,
  fn: () => T
): T {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  
  authMigrationMonitor.logPerformance(operation, duration, component);
  
  return result;
}

// Helper function to measure async performance
export async function measureAuthPerformanceAsync<T>(
  operation: 'auth' | 'role' | 'permission',
  component: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  
  authMigrationMonitor.logPerformance(operation, duration, component);
  
  return result;
}
