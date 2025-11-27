
import React, { useMemo, useCallback } from 'react';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { UserRole } from '@/types/core/rbac';
import { ComponentPermission } from '@/utils/rbac/component-types';
import { adaptComponentPermissions } from '@/utils/rbac/permission-adapter';

// Hook for memoized permission checks
export function useMemoizedPermissionCheck() {
  const { checkPermissions } = useAuthRBAC();
  
  return useCallback((permissions: ComponentPermission[], options?: { requireAll?: boolean }): boolean => {
    return checkPermissions(adaptComponentPermissions(permissions), options);
  }, [checkPermissions]);
}

// Hook for memoized role checks
export function useMemoizedRoleCheck() {
  const { hasRole, hasAnyRole, hasAllRoles } = useAuthRBAC();
  
  return {
    hasRole: useCallback((role: UserRole) => hasRole(role), [hasRole]),
    hasAnyRole: useCallback((roles: UserRole[]) => hasAnyRole(roles), [hasAnyRole]),
    hasAllRoles: useCallback((roles: UserRole[]) => hasAllRoles(roles), [hasAllRoles])
  };
}

// Higher-order component for memoized permissions
export function withMemoizedPermissions<P>(
  Component: React.ComponentType<P>,
  permissions: ComponentPermission[],
  options?: { requireAll?: boolean }
) {
  return React.memo((props: P) => {
    const { checkPermissions } = useAuthRBAC();
    const hasPermission = useMemo(() => 
      checkPermissions(adaptComponentPermissions(permissions), options),
      [checkPermissions, options]
    );
    
    if (!hasPermission) return null;
    return <Component {...props} />;
  });
}

// Higher-order component for memoized roles
export function withMemoizedRoles<P>(
  Component: React.ComponentType<P>,
  roles: UserRole[],
  options?: { requireAll?: boolean }
) {
  return React.memo((props: P) => {
    const { hasAnyRole, hasAllRoles } = useAuthRBAC();
    const hasRoles = useMemo(() => 
      options?.requireAll ? hasAllRoles(roles) : hasAnyRole(roles),
      [hasAnyRole, hasAllRoles, roles, options?.requireAll]
    );
    
    if (!hasRoles) return null;
    return <Component {...props} />;
  });
}

/**
 * Component that performs selective rendering based on permissions
 * @param props Component properties including render props and permission requirements
 */
export const PermissionRenderer = React.memo(
  ({ children, permissions, requireAll = false }: {
    children: React.ReactNode;
    permissions: ComponentPermission[];
    requireAll?: boolean;
  }) => {
    const { checkPermissions, loading } = useAuthRBAC();
    
    // Using useMemo to avoid unnecessary recalculations
    const hasPermission = useMemo(() => {
      if (loading) return false;
      return checkPermissions(adaptComponentPermissions(permissions), { requireAll });
    }, [checkPermissions, loading, permissions, requireAll]);
    
    if (!hasPermission) {
      return null;
    }
    
    return <>{children}</>;
  }
);

PermissionRenderer.displayName = 'PermissionRenderer';

/**
 * Component that performs selective rendering based on roles
 * @param props Component properties including render props and role requirements
 */
export const RoleRenderer = React.memo(
  ({ children, roles, requireAll = false }: {
    children: React.ReactNode;
    roles: UserRole[];
    requireAll?: boolean;
  }) => {
    const { hasAnyRole, hasAllRoles, loading } = useAuthRBAC();
    
    // Using useMemo to avoid unnecessary recalculations
    const hasRequiredRoles = useMemo(() => {
      if (loading) return false;
      
      return requireAll 
        ? hasAllRoles(roles)
        : hasAnyRole(roles);
    }, [hasAllRoles, hasAnyRole, loading, requireAll, roles]);
    
    if (!hasRequiredRoles) {
      return null;
    }
    
    return <>{children}</>;
  }
);

RoleRenderer.displayName = 'RoleRenderer';

// Re-export the components and hooks for better DX
export { withRoleRenderer, withPermissionRenderer } from './selective-rerendering-hoc';
