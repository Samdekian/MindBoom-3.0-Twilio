
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useEffect } from 'react';

/**
 * Provides compatibility with the old RBAC system while warning about deprecation
 * @deprecated This is a compatibility layer. Please migrate to useAuthRBAC instead.
 */
export function useRBACWithWarning() {
  const authRBAC = useAuthRBAC();
  
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'DEPRECATION WARNING: useRBAC is deprecated and will be removed in a future version. ' +
        'Please migrate to useAuthRBAC instead.'
      );
    }
  }, []);
  
  return {
    roles: authRBAC.userRoles,
    permissions: authRBAC.permissions,
    loading: authRBAC.loading,
    isLoading: authRBAC.loading,
    isAuthenticated: authRBAC.isAuthenticated,
    error: null,
    autoRepair: false,
    
    // Role checking methods
    hasRole: authRBAC.hasRole,
    hasAnyRole: authRBAC.hasAnyRole,
    hasAllRoles: authRBAC.hasAllRoles,
    isAdmin: authRBAC.isAdmin,
    isTherapist: authRBAC.isTherapist,
    isPatient: authRBAC.isPatient,
    isSupport: authRBAC.isSupport,
    primaryRole: authRBAC.primaryRole,
    
    // Permission methods
    hasPermission: authRBAC.hasPermission,
    
    // Management methods
    refreshRoles: authRBAC.refreshRoles,
    performConsistencyCheck: authRBAC.performConsistencyCheck,
    
    // Legacy methods
    setAutoRepair: () => {},
  };
}
