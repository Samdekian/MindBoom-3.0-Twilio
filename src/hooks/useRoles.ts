
// Compatibility layer for components still using old useRoles
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useEffect } from 'react';

export const useRoles = () => {
  const context = useAuthRBAC();
  
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'DEPRECATION WARNING: useRoles is deprecated. Please migrate to useAuthRBAC instead.'
      );
    }
  }, []);
  
  return {
    roles: context.roles,
    primaryRole: context.primaryRole,
    hasRole: context.hasRole,
    hasAnyRole: context.hasAnyRole,
    hasAllRoles: context.hasAllRoles,
    isAdmin: context.isAdmin,
    loading: context.loading,
    refreshRoles: context.refreshRoles,
    userRoles: context.userRoles,
  };
};
