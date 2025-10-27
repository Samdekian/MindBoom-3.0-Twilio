
/**
 * Auth context monitoring hook for debugging and health checks
 */

import { useEffect, useState, useCallback } from 'react';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { systemMonitor } from '@/utils/system-monitor';

interface AuthMonitorState {
  connectionStatus: 'connected' | 'disconnected' | 'unknown';
  lastAuthEvent: string | null;
  authEventCount: number;
  rolesFetchTime: number | null;
  initializationTime: number | null;
  errorCount: number;
  lastError: string | null;
}

export function useAuthMonitor() {
  const auth = useAuthRBAC();
  const [monitorState, setMonitorState] = useState<AuthMonitorState>({
    connectionStatus: 'unknown',
    lastAuthEvent: null,
    authEventCount: 0,
    rolesFetchTime: null,
    initializationTime: null,
    errorCount: 0,
    lastError: null
  });

  // Monitor auth state changes
  useEffect(() => {
    const startTime = Date.now();
    
    setMonitorState(prev => ({
      ...prev,
      lastAuthEvent: 'auth_state_change',
      authEventCount: prev.authEventCount + 1,
      connectionStatus: auth.isAuthenticated ? 'connected' : 'disconnected'
    }));

    // Track initialization time
    if (auth.isInitialized && !monitorState.initializationTime) {
      setMonitorState(prev => ({
        ...prev,
        initializationTime: Date.now() - startTime
      }));
    }
  }, [auth.isAuthenticated, auth.isInitialized, monitorState.initializationTime]);

  // Monitor role changes
  useEffect(() => {
    if (auth.userRoles.length > 0) {
      setMonitorState(prev => ({
        ...prev,
        lastAuthEvent: 'roles_updated'
      }));
    }
  }, [auth.userRoles]);

  // Test auth functionality
  const runAuthHealthCheck = useCallback(async () => {
    try {
      const startTime = Date.now();
      
      // Test role refresh
      await auth.refreshRoles();
      
      const endTime = Date.now();
      setMonitorState(prev => ({
        ...prev,
        rolesFetchTime: endTime - startTime,
        lastAuthEvent: 'health_check_success'
      }));
      
      return true;
    } catch (error) {
      setMonitorState(prev => ({
        ...prev,
        errorCount: prev.errorCount + 1,
        lastError: error instanceof Error ? error.message : String(error),
        lastAuthEvent: 'health_check_failed'
      }));
      
      return false;
    }
  }, [auth]);

  // Register health check with system monitor
  useEffect(() => {
    systemMonitor.registerHealthCheck('auth_context', runAuthHealthCheck);
  }, [runAuthHealthCheck]);

  // Generate health report
  const getHealthReport = useCallback(() => {
    return {
      status: auth.isAuthenticated && auth.isInitialized ? 'healthy' : 'degraded',
      metrics: {
        isAuthenticated: auth.isAuthenticated,
        isInitialized: auth.isInitialized,
        loading: auth.loading,
        userRolesCount: auth.userRoles.length,
        permissionsCount: auth.permissions.length,
        ...monitorState
      },
      suggestions: []
    };
  }, [auth, monitorState]);

  return {
    monitorState,
    runAuthHealthCheck,
    getHealthReport,
    isHealthy: auth.isAuthenticated && auth.isInitialized && monitorState.errorCount === 0
  };
}
