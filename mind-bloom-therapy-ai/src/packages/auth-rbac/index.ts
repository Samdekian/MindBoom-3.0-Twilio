// Export all auth-rbac related functionality from a central location

// Core context and hooks
export { AuthRBACProvider, useAuthRBAC } from '@/contexts/AuthRBACContext';
export type { AuthRBACContextType, Permission } from '@/contexts/auth/types';

// Route protection components
export { default as RoleProtectedRoute } from '@/components/RoleProtectedRoute';
export { default as PermissionProtectedRoute } from '@/components/PermissionProtectedRoute';

// Components
export { default as RoleBasedContainer } from '@/components/RoleBasedContainer';
export { default as RoleBasedField } from '@/components/RoleBasedField';
export { default as PermissionField } from '@/components/PermissionField';
export { default as PermissionGuard } from '@/components/PermissionGuard';
export { default as SecurityEventsVisualization } from '@/components/security/SecurityEventsVisualization';

// Hooks
export { useRBAC } from '@/hooks/useRBAC';
export { usePermission } from '@/hooks/usePermission';
export { useRBACMonitoring } from '@/hooks/use-rbac-monitoring';
export { useRBACPerformance } from '@/hooks/use-rbac-performance';
export { useRoleRepair } from '@/hooks/use-role-repair';
export { useRoleManagement } from '@/hooks/useRoleManagement';
export { useAuthPerformanceMonitor } from '@/hooks/use-auth-performance-monitor';
export { useSessionMonitor } from '@/hooks/security/use-session-monitor';
export { useAuditLogging } from '@/hooks/security/use-audit-logging';
export { useRBACIntegrity } from '@/hooks/use-rbac-integrity';

// Utilities
export { roleCacheManager } from '@/utils/rbac/role-cache-manager';
export {
  PermissionRenderer,
  RoleRenderer,
  withRoleRenderer,
  withPermissionRenderer
} from '@/utils/performance/selective-rerendering';
export {
  getUserRolesAndPermissions,
  checkUserHasRoleOptimized,
  checkAndRepairUserRoleConsistencyOptimized,
  batchLoadUserRoles
} from '@/utils/rbac/optimized-queries';
export {
  requires2FA,
  isGracePeriodExpired,
  operationRequires2FA,
  DEFAULT_2FA_CONFIG
} from '@/utils/security/role-based-2fa';

// Types - Fix the re-export type errors by using 'export type'
export type { UserRole, RBACEvent, SecurityAlert, RoleDiagnosticResult } from '@/types/core/rbac';
export type { ComponentPermission } from '@/utils/rbac/component-types';
export type { TwoFactorRequirements } from '@/utils/security/role-based-2fa';

// Testing
export { MockAuthRBACProvider } from '@/utils/testing/MockAuthRBACProvider';
export { setupRBACTestEnvironment } from '@/tests/rbac/rbac-test-helpers';
export { 
  RoleProtectedRouteTest,
  RBACTestingDashboard 
} from '@/components/rbac-testing';

// Documentation
// These exports don't provide runtime functionality but indicate the available documentation
export const documentation = {
  architecture: 'src/docs/RBACArchitecture.mdx',
  testing: 'src/docs/RBACTesting.mdx',
};
