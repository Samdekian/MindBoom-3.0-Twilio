
// Legacy RBAC hook - now redirects to unified AuthRBACContext
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useEffect } from 'react';

export const useRBAC = () => {
  const context = useAuthRBAC();
  
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('DEPRECATION WARNING: useRBAC is deprecated. Use useAuthRBAC instead.');
    }
  }, []);
  
  return {
    roles: context.userRoles,
    permissions: context.permissions,
    loading: context.loading,
    isLoading: context.loading,
    isAuthenticated: context.isAuthenticated,
    error: null,
    autoRepair: false,
    
    // Role checking methods
    hasRole: context.hasRole,
    hasAnyRole: context.hasAnyRole,
    hasAllRoles: context.hasAllRoles,
    isAdmin: context.isAdmin,
    isTherapist: context.isTherapist,
    isPatient: context.isPatient,
    isSupport: context.isSupport,
    primaryRole: context.primaryRole,
    
    // Permission methods
    hasPermission: context.hasPermission,
    
    // Management methods
    refreshRoles: context.refreshRoles,
    performConsistencyCheck: context.performConsistencyCheck,
    
    // Legacy methods
    setAutoRepair: () => {},
  };
};

export default useRBAC;
