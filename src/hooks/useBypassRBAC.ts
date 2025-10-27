
import { useBypassAuthRBAC } from '@/contexts/BypassAuthRBACContext';
import { type UserRole } from '@/types/core/rbac';

// Re-export UserRole type
export type { UserRole };

/**
 * A hook that provides a compatibility layer with the original useRBAC hook
 * but uses the BypassAuthRBAC context which always returns true for role checks
 */
export const useBypassRBAC = () => {
  // Use the bypass auth RBAC context
  const bypassAuthRBAC = useBypassAuthRBAC();
  
  // Return an object that follows the same interface as useRBAC
  return {
    roles: bypassAuthRBAC.roles,
    isLoading: bypassAuthRBAC.loading, // Map to the loading property from the context
    error: null,
    hasRole: bypassAuthRBAC.hasRole,
    hasAnyRole: bypassAuthRBAC.hasAnyRole,
    hasAllRoles: bypassAuthRBAC.hasAllRoles,
    refreshRoles: bypassAuthRBAC.refreshRoles,
    performConsistencyCheck: bypassAuthRBAC.performConsistencyCheck,
    autoRepair: true,
    setAutoRepair: () => {} // No-op as this is handled automatically
  };
};

export default useBypassRBAC;
