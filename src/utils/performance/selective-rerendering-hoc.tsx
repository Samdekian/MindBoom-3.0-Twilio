
import React from 'react';
import { UserRole } from '@/types/core/rbac';
import { ComponentPermission } from '@/utils/rbac/component-types';
import { RoleRenderer, PermissionRenderer } from './selective-rerendering';

/**
 * Higher-order component that adds role-based rendering
 * @param Component Component to wrap
 * @param roles Roles to check
 * @param requireAll Whether all roles are required
 */
export function withRoleRenderer<P>(
  Component: React.ComponentType<P>,
  roles: UserRole[],
  requireAll = false
) {
  const WithRoleRenderer = (props: P) => (
    <RoleRenderer roles={roles} requireAll={requireAll}>
      <Component {...props} />
    </RoleRenderer>
  );
  
  WithRoleRenderer.displayName = `WithRoleRenderer(${Component.displayName || Component.name})`;
  
  return WithRoleRenderer;
}

/**
 * Higher-order component that adds permission-based rendering
 * @param Component Component to wrap
 * @param permissions Permissions to check
 * @param requireAll Whether all permissions are required
 */
export function withPermissionRenderer<P>(
  Component: React.ComponentType<P>,
  permissions: ComponentPermission[],
  requireAll = false
) {
  const WithPermissionRenderer = (props: P) => (
    <PermissionRenderer permissions={permissions} requireAll={requireAll}>
      <Component {...props} />
    </PermissionRenderer>
  );
  
  WithPermissionRenderer.displayName = `WithPermissionRenderer(${Component.displayName || Component.name})`;
  
  return WithPermissionRenderer;
}
