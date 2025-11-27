
import { useState, useEffect } from "react";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { roleCacheManager } from "@/utils/rbac/role-cache-manager";
import { RBACPerformanceMetrics } from "@/types/core/rbac";

/**
 * Hook to monitor RBAC performance metrics
 */
export function useRBACPerformance() {
  const { isAuthenticated } = useAuthRBAC();
  // Fix the type error by explicitly typing the initial state with all required properties
  const [metrics, setMetrics] = useState<RBACPerformanceMetrics>({
    averageRoleCheckTime: 0,
    cacheHitRate: 0,
    totalChecks: 0,
    failedChecks: 0,
    slowQueries: 0,
    memoryUsage: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageSyncDuration: 0,
    totalSyncAttempts: 0,
    successRate: 100,
    lastSyncTime: null,
    fetchDuration: null,
    lastFetchTime: null,
    roleOperations: {
      successful: 0,
      failed: 0
    }
  });
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);

  // Refresh metrics from the cache manager
  const refreshMetrics = () => {
    const stats = roleCacheManager.getStats();
    setMetrics({
      averageRoleCheckTime: 0,
      cacheHitRate: stats.hits > 0 ? (stats.hits / (stats.hits + stats.misses)) * 100 : 0,
      totalChecks: stats.hits + stats.misses,
      failedChecks: stats.expirations,
      slowQueries: 0,
      memoryUsage: 0,
      cacheHits: stats.hits,
      cacheMisses: stats.misses,
      averageSyncDuration: 0,
      totalSyncAttempts: stats.writes,
      successRate: stats.writes > 0 ? 
        ((stats.writes - stats.expirations) / stats.writes) * 100 : 100,
      lastSyncTime: null,
      fetchDuration: null,
      lastFetchTime: null,
      roleOperations: {
        successful: stats.writes - stats.expirations,
        failed: stats.expirations
      }
    });
  };

  // Start automatic refresh of metrics
  const startRefresh = (intervalMs: number = 10000) => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }

    const id = window.setInterval(() => {
      refreshMetrics();
    }, intervalMs);

    setRefreshInterval(id);
    return () => clearInterval(id);
  };

  // Stop automatic refresh
  const stopRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  };

  // Record a fetch operation with timing
  const recordFetch = (durationMs: number, isSuccess: boolean = true) => {
    const currentTime = Date.now();
    
    setMetrics(prev => ({
      ...prev,
      fetchDuration: durationMs,
      lastFetchTime: currentTime,
      lastSyncTime: new Date(currentTime),
      roleOperations: {
        successful: prev.roleOperations.successful + (isSuccess ? 1 : 0),
        failed: prev.roleOperations.failed + (isSuccess ? 0 : 1)
      }
    }));
  };

  // Reset all metrics
  const resetMetrics = () => {
    roleCacheManager.resetStats();
    refreshMetrics();
  };

  // Start automatic refresh on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshMetrics();
      const cleanup = startRefresh();
      return cleanup;
    } else {
      stopRefresh();
    }
  }, [isAuthenticated]);

  return {
    metrics,
    refreshMetrics,
    startRefresh,
    stopRefresh,
    recordFetch,
    resetMetrics,
    isRefreshing: refreshInterval !== null
  };
}
