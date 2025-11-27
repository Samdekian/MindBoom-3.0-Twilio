
import { UserRole } from "@/types/core/rbac";
import { getPermissionsForRole } from "@/utils/auth/role-permissions";

/**
 * Gets permissions from user roles
 * @param roles Array of user roles
 * @returns Array of permissions as strings
 */
export const getPermissionsFromRoles = (roles: UserRole[]): string[] => {
  // Get permissions as objects
  const permissionObjects = roles.flatMap(role => getPermissionsForRole(role));
  
  // Convert permission objects to strings in format "resource:action"
  return permissionObjects.map(p => `${p.resource}:${p.action}`);
};
