
/**
 * Helper utilities for the auth migration process
 */

import React from 'react';
import { authMigrationMonitor } from './auth-migration-monitor';

/**
 * Higher-order component to track migration of a component
 */
export function withMigrationTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string,
  fromSystem: string = 'useAuth',
  toSystem: string = 'useAuthRBAC'
) {
  const TrackedComponent = (props: P) => {
    React.useEffect(() => {
      // Log the migration when component mounts
      authMigrationMonitor.logMigration(componentName, fromSystem, toSystem);
    }, []);

    return React.createElement(Component, props);
  };

  TrackedComponent.displayName = `withMigrationTracking(${componentName})`;
  return TrackedComponent;
}

/**
 * Hook to track component usage of auth systems
 */
export function useMigrationTracking(componentName: string, system: 'useAuth' | 'useAuthRBAC') {
  React.useEffect(() => {
    if (system === 'useAuthRBAC') {
      authMigrationMonitor.logMigration(componentName, 'useAuth', 'useAuthRBAC');
    }
  }, [componentName, system]);
}

/**
 * Helper to safely wrap auth operations with error tracking
 */
export function withAuthErrorTracking<T extends (...args: any[]) => any>(
  fn: T,
  componentName: string,
  operationName: string
): T {
  return ((...args: Parameters<T>) => {
    try {
      const result = fn(...args);
      
      // If it's a promise, handle async errors
      if (result && typeof result.catch === 'function') {
        return result.catch((error: Error) => {
          authMigrationMonitor.logError(
            componentName,
            error,
            { operation: operationName, args }
          );
          throw error;
        });
      }
      
      return result;
    } catch (error) {
      authMigrationMonitor.logError(
        componentName,
        error instanceof Error ? error : new Error(String(error)),
        { operation: operationName, args }
      );
      throw error;
    }
  }) as T;
}

/**
 * Migration checklist for components
 */
export interface MigrationChecklist {
  componentName: string;
  currentSystem: 'useAuth' | 'useAuthRBAC';
  hasAuthChecks: boolean;
  hasRoleChecks: boolean;
  hasPermissionChecks: boolean;
  hasAuthOperations: boolean;
  migrationComplexity: 'low' | 'medium' | 'high';
  migrationPriority: 'low' | 'medium' | 'high' | 'critical';
  estimatedEffort: string;
  notes: string[];
}

/**
 * Generate migration checklist for a component
 */
export function generateMigrationChecklist(
  componentName: string,
  componentCode?: string
): MigrationChecklist {
  const hasAuthChecks = componentCode?.includes('isAuthenticated') || false;
  const hasRoleChecks = componentCode?.includes('hasRole') || componentCode?.includes('isAdmin') || componentCode?.includes('isTherapist') || false;
  const hasPermissionChecks = componentCode?.includes('hasPermission') || false;
  const hasAuthOperations = componentCode?.includes('signIn') || componentCode?.includes('signOut') || false;
  
  let complexity: 'low' | 'medium' | 'high' = 'low';
  let priority: 'low' | 'medium' | 'high' | 'critical' = 'low';
  let estimatedEffort = '< 1 hour';
  const notes: string[] = [];

  // Determine complexity
  if (hasAuthOperations) {
    complexity = 'high';
    estimatedEffort = '2-4 hours';
    notes.push('Contains auth operations - requires careful testing');
  } else if (hasPermissionChecks) {
    complexity = 'medium';
    estimatedEffort = '1-2 hours';
    notes.push('Contains permission checks - verify permission mappings');
  } else if (hasRoleChecks) {
    complexity = 'medium';
    estimatedEffort = '1-2 hours';
    notes.push('Contains role checks - verify role mappings');
  }

  // Determine priority based on component name patterns
  if (componentName.toLowerCase().includes('nav') || 
      componentName.toLowerCase().includes('header') ||
      componentName.toLowerCase().includes('layout')) {
    priority = 'high';
    notes.push('High visibility component - affects user navigation');
  } else if (componentName.toLowerCase().includes('admin') ||
             componentName.toLowerCase().includes('auth')) {
    priority = 'critical';
    notes.push('Critical security component - test thoroughly');
  } else if (componentName.toLowerCase().includes('dashboard') ||
             componentName.toLowerCase().includes('profile')) {
    priority = 'medium';
    notes.push('Core functionality component');
  }

  return {
    componentName,
    currentSystem: 'useAuth', // Default assumption
    hasAuthChecks,
    hasRoleChecks,
    hasPermissionChecks,
    hasAuthOperations,
    migrationComplexity: complexity,
    migrationPriority: priority,
    estimatedEffort,
    notes
  };
}

/**
 * Component categories for batch migration
 */
export const MIGRATION_BATCHES = {
  CRITICAL_AUTH: [
    'AuthRequired',
    'AdminAuthCheck',
    'SimpleAdminCheck',
    'ProtectedRoute'
  ] as const,
  NAVIGATION: [
    'NavbarAuthButtons',
    'MobileUserProfile',
    'NavigationItems',
    'Navbar',
    'MobileHeader'
  ] as const,
  LAYOUT: [
    'PatientLayout',
    'DashboardLayout',
    'TherapistLayout',
    'AdminLayout'
  ] as const,
  PROFILE: [
    'ProfileHeader',
    'PersonalInfoTab',
    'ApprovalStatusBanner',
    'TherapistProfileHeader'
  ] as const,
  DASHBOARD: [
    'WelcomeSection',
    'TherapistSidebar',
    'PatientSidebar',
    'DashboardHeader'
  ] as const
} as const;

/**
 * Get components for a specific migration batch
 */
export function getMigrationBatch(batchName: keyof typeof MIGRATION_BATCHES): readonly string[] {
  return MIGRATION_BATCHES[batchName];
}

/**
 * Validate that a component has been successfully migrated
 */
export function validateComponentMigration(
  componentName: string,
  componentCode: string
): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // Check if still importing old system
  if (componentCode.includes("from '@/contexts/AuthContext'")) {
    issues.push('Still importing from AuthContext');
  }
  
  if (componentCode.includes("from '@/hooks/useAuth'")) {
    issues.push('Still importing from useAuth hook');
  }
  
  // Check if using new system
  const hasNewImport = componentCode.includes("from '@/contexts/AuthRBACContext'");
  if (!hasNewImport) {
    issues.push('Not importing from AuthRBACContext');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}
