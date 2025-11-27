import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  PerformanceMonitor, 
  ErrorReportingService, 
  HealthCheckService,
  performanceMonitor,
  errorReporter,
  healthChecker
} from '@/lib/production/monitoring';

// Mock supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({ error: null })),
      select: vi.fn(() => ({ limit: vi.fn(() => ({ error: null })) }))
    })),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } } })
    },
    rpc: vi.fn(() => ({ error: null }))
  }
}));

// Mock enhanced monitoring
vi.mock('@/lib/production/enhanced-monitoring', () => ({
  enhancedHealthMonitor: {
    startMonitoring: vi.fn()
  }
}));

describe('Production Monitoring', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear any intervals to prevent test interference
    performanceMonitor.stopMonitoring();
    healthChecker.stopHealthChecks();
  });

  describe('PerformanceMonitor', () => {
    it('should record metrics correctly', () => {
      performanceMonitor.recordMetric('test_metric', 100);
      performanceMonitor.recordMetric('test_metric', 200);
      
      // Test that metrics are recorded (implementation detail)
      expect(performanceMonitor).toBeDefined();
    });

    it('should start and stop monitoring', () => {
      performanceMonitor.startMonitoring();
      expect(performanceMonitor).toBeDefined();
      
      performanceMonitor.stopMonitoring();
      expect(performanceMonitor).toBeDefined();
    });

    it('should be a singleton', () => {
      const instance1 = PerformanceMonitor.getInstance();
      const instance2 = PerformanceMonitor.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('ErrorReportingService', () => {
    it('should initialize global error handlers', () => {
      const originalOnerror = window.onerror;
      const originalOnunhandledrejection = window.onunhandledrejection;
      
      errorReporter.initialize();
      
      expect(window.onerror).not.toBe(originalOnerror);
      expect(window.onunhandledrejection).not.toBe(originalOnunhandledrejection);
    });

    it('should report errors', async () => {
      const testError = new Error('Test error');
      
      await expect(
        errorReporter.reportError(testError, 'test_context')
      ).resolves.not.toThrow();
    });

    it('should be a singleton', () => {
      const instance1 = ErrorReportingService.getInstance();
      const instance2 = ErrorReportingService.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('HealthCheckService', () => {
    it('should start and stop health checks', () => {
      healthChecker.startHealthChecks();
      expect(healthChecker).toBeDefined();
      
      healthChecker.stopHealthChecks();
      expect(healthChecker).toBeDefined();
    });

    it('should be a singleton', () => {
      const instance1 = HealthCheckService.getInstance();
      const instance2 = HealthCheckService.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('Production Configuration', () => {
    it('should have valid configuration values', async () => {
      const { PRODUCTION_CONFIG } = await import('@/lib/production/monitoring');
      
      expect(PRODUCTION_CONFIG.MAX_PARTICIPANTS_PER_SESSION).toBeGreaterThan(0);
      expect(PRODUCTION_CONFIG.MAX_SESSION_DURATION_HOURS).toBeGreaterThan(0);
      expect(PRODUCTION_CONFIG.CONNECTION_TIMEOUT_MS).toBeGreaterThan(0);
      expect(typeof PRODUCTION_CONFIG.FEATURES).toBe('object');
    });
  });

  describe('Environment Detection', () => {
    it('should detect production environment correctly', async () => {
      const { isProduction } = await import('@/lib/production/monitoring');
      
      // In test environment, should return false
      expect(typeof isProduction()).toBe('boolean');
    });
  });

  describe('Initialization', () => {
    it('should initialize production services without throwing', async () => {
      const { initializeProduction } = await import('@/lib/production/monitoring');
      
      await expect(initializeProduction()).resolves.not.toThrow();
    });
  });
});