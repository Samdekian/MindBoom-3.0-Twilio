
import { ComponentPermission } from '@/utils/rbac/component-types';
import { Permission } from '@/contexts/AuthRBACContext';

/**
 * Converts ComponentPermission array to Permission array for compatibility
 */
export function adaptComponentPermissions(componentPermissions: ComponentPermission[]): Permission[] {
  return componentPermissions.map((cp, index) => ({
    id: cp.name || `${cp.resource}:${cp.action}:${index}`,
    name: cp.name || `${cp.resource}:${cp.action}`,
    resource: cp.resource,
    action: cp.action
  }));
}

/**
 * Converts a single ComponentPermission to Permission
 */
export function adaptComponentPermission(cp: ComponentPermission, index: number = 0): Permission {
  return {
    id: cp.name || `${cp.resource}:${cp.action}:${index}`,
    name: cp.name || `${cp.resource}:${cp.action}`,
    resource: cp.resource,
    action: cp.action
  };
}
