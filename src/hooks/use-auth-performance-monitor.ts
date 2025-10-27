import { useState, useEffect, useRef } from "react";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { roleCacheManager } from "@/utils/rbac/role-cache-manager";

export type OperationType = 
  | 'login'
  | 'signup'
  | 'logout'
  | 'role_fetch'
  | 'permission_check'
  | 'role_check'
  | 'consistency_check'
  | 'refresh_roles'
  | 'role_assignment';

export interface OperationMetrics {
  operation: OperationType;
  duration: number;
  timestamp: Date;
  success: boolean;
  details?: Record<string, any>;
}

export interface AuthPerformanceReport {
  averageLoginTime?: number;
  averageRoleFetchTime?: number;
  averagePermissionCheckTime?: number;
  cacheHitRate: number;
  operationsCount: number;
  errorRate: number;
  metrics: OperationMetrics[];
}

export function useAuthPerformanceMonitor(enableDetailedMonitoring = false) {
  const { user, loading } = useAuthRBAC();
  const [operationMetrics, setOperationMetrics] = useState<OperationMetrics[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [report, setReport] = useState<AuthPerformanceReport>({
    cacheHitRate: 0,
    operationsCount: 0,
    errorRate: 0,
    metrics: []
  });
  
  // Keep track of original function implementations for patching
  const originalFunctions = useRef<Record<string, Function>>({});
  const authRBAC = useAuthRBAC();
  
  // Start monitoring auth operations
  const startMonitoring = () => {
    if (isMonitoring) return;
    
    setIsMonitoring(true);
    
    if (enableDetailedMonitoring) {
      // Patch RBAC functions for monitoring - in a real implementation,
      // we would monkey patch the methods to track performance
      // This is just a placeholder implementation
      patchRBACFunctions();
    }
  };
  
  // Stop monitoring auth operations
  const stopMonitoring = () => {
    if (!isMonitoring) return;
    
    setIsMonitoring(false);
    
    if (enableDetailedMonitoring) {
      // Restore original functions
      unpatchRBACFunctions();
    }
  };
  
  // Record a new operation metric
  const recordOperation = (
    operation: OperationType,
    duration: number,
    success: boolean,
    details?: Record<string, any>
  ) => {
    if (!isMonitoring) return;
    
    const metric: OperationMetrics = {
      operation,
      duration,
      timestamp: new Date(),
      success,
      details
    };
    
    setOperationMetrics(prev => {
      // Keep only the last 100 operations to avoid memory issues
      const updated = [...prev, metric];
      if (updated.length > 100) {
        return updated.slice(-100);
      }
      return updated;
    });
  };
  
  // Measure performance of a function call
  const measure = async <T>(
    operation: OperationType,
    fn: () => Promise<T>,
    details?: Record<string, any>
  ): Promise<T> => {
    if (!isMonitoring) {
      return fn();
    }
    
    const start = performance.now();
    let success = true;
    
    try {
      const result = await fn();
      return result;
    } catch (error) {
      success = false;
      throw error;
    } finally {
      const end = performance.now();
      const duration = end - start;
      
      recordOperation(operation, duration, success, details);
    }
  };
  
  // Generate a performance report
  const generateReport = () => {
    // Filter metrics by operation type
    const loginMetrics = operationMetrics.filter(m => m.operation === 'login');
    const roleFetchMetrics = operationMetrics.filter(m => m.operation === 'role_fetch');
    const permissionCheckMetrics = operationMetrics.filter(m => m.operation === 'permission_check');
    const allMetrics = operationMetrics;
    
    // Calculate average login time
    const averageLoginTime = loginMetrics.length > 0
      ? loginMetrics.reduce((sum, m) => sum + m.duration, 0) / loginMetrics.length
      : undefined;
    
    // Calculate average role fetch time
    const averageRoleFetchTime = roleFetchMetrics.length > 0
      ? roleFetchMetrics.reduce((sum, m) => sum + m.duration, 0) / roleFetchMetrics.length
      : undefined;
    
    // Calculate average permission check time
    const averagePermissionCheckTime = permissionCheckMetrics.length > 0
      ? permissionCheckMetrics.reduce((sum, m) => sum + m.duration, 0) / permissionCheckMetrics.length
      : undefined;
    
    // Calculate cache hit rate from role cache manager
    const cacheStats = roleCacheManager.getStats();
    const totalCacheRequests = cacheStats.hits + cacheStats.misses;
    const cacheHitRate = totalCacheRequests > 0
      ? (cacheStats.hits / totalCacheRequests) * 100
      : 0;
    
    // Calculate error rate
    const failedOperations = allMetrics.filter(m => !m.success);
    const errorRate = allMetrics.length > 0
      ? (failedOperations.length / allMetrics.length) * 100
      : 0;
    
    const newReport: AuthPerformanceReport = {
      averageLoginTime,
      averageRoleFetchTime,
      averagePermissionCheckTime,
      cacheHitRate,
      operationsCount: allMetrics.length,
      errorRate,
      metrics: enableDetailedMonitoring ? allMetrics : []
    };
    
    setReport(newReport);
    return newReport;
  };
  
  // Reset all metrics
  const resetMetrics = () => {
    setOperationMetrics([]);
    roleCacheManager.resetStats();
  };
  
  // Patch RBAC functions to measure performance
  const patchRBACFunctions = () => {
    // In a real implementation, we would monkey patch methods like
    // hasRole, hasPermission, etc. to track their performance
    // This is just a placeholder implementation
    if (!originalFunctions.current.hasRole) {
      originalFunctions.current.hasRole = authRBAC.hasRole;
      originalFunctions.current.hasPermission = authRBAC.hasPermission;
    }
  };
  
  // Restore original functions
  const unpatchRBACFunctions = () => {
    // Restore original functions when monitoring is disabled
  };
  
  // Auto-generate report when metrics change
  useEffect(() => {
    if (isMonitoring) {
      generateReport();
    }
  }, [operationMetrics, isMonitoring]);
  
  // Auto-start monitoring if enabled
  useEffect(() => {
    if (enableDetailedMonitoring && !isMonitoring) {
      startMonitoring();
    }
    
    return () => {
      if (isMonitoring) {
        stopMonitoring();
      }
    };
  }, [enableDetailedMonitoring]);
  
  return {
    startMonitoring,
    stopMonitoring,
    recordOperation,
    measure,
    generateReport,
    resetMetrics,
    isMonitoring,
    report,
    metrics: operationMetrics
  };
}
