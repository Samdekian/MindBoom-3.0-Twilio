
import { UserRole } from "@/types/core/rbac";

/**
 * Get the primary role from a list of roles based on priority
 * @param roles Array of roles
 * @returns The primary/most privileged role
 */
export const getPrimaryRoleFromList = (roles: string[]): UserRole | null => {
  const rolePriorities: Record<string, number> = {
    admin: 100,
    therapist: 75,
    support: 50,
    patient: 25
  };
  
  if (!roles || roles.length === 0) {
    return null;
  }
  
  // Sort by priority (highest first)
  const sortedRoles = [...roles].sort((a, b) => {
    const priorityA = rolePriorities[a] || 0;
    const priorityB = rolePriorities[b] || 0;
    return priorityB - priorityA;
  });
  
  return sortedRoles[0] as UserRole;
};

/**
 * Check if an array of roles contains any admin role
 */
export const hasAdminRole = (roles: string[]): boolean => {
  return roles.some(role => role === 'admin');
};

/**
 * Check if a user's roles include the necessary permissions for an action
 */
export const hasRequiredRoles = (
  userRoles: string[], 
  requiredRoles: string[], 
  requireAll: boolean = false
): boolean => {
  if (!userRoles || userRoles.length === 0 || !requiredRoles || requiredRoles.length === 0) {
    return false;
  }
  
  // Admin always has permission
  if (hasAdminRole(userRoles)) {
    return true;
  }
  
  if (requireAll) {
    // Must have all required roles
    return requiredRoles.every(role => userRoles.includes(role));
  } else {
    // Must have at least one of the required roles
    return requiredRoles.some(role => userRoles.includes(role));
  }
};

/**
 * Export Role Priority constants for components
 */
export const ROLE_PRIORITY = {
  admin: 100,
  therapist: 75,
  support: 50,
  patient: 25
};

/**
 * Interface for role resolution results
 */
export interface RoleResolutionResult {
  primaryRole: UserRole | null;
  conflicts: string[];
}

/**
 * Resolve conflicts between multiple roles
 * @param roles Array of roles
 * @returns The resolution result with primary role and conflicts
 */
export const resolveRoleConflicts = (roles: string[]): RoleResolutionResult => {
  if (!roles || roles.length === 0) {
    return { primaryRole: null, conflicts: [] };
  }
  
  const conflicts: string[] = [];
  
  // Check for potential conflicts
  if (roles.includes('admin') && roles.includes('patient')) {
    conflicts.push("Admin and patient roles should not be assigned together");
  }
  
  if (roles.includes('therapist') && roles.includes('patient')) {
    conflicts.push("Therapist and patient roles may conflict in clinical scenarios");
  }
  
  return {
    primaryRole: getPrimaryRoleFromList(roles),
    conflicts
  };
};

/**
 * Categorize roles by access level
 * @param roles Array of roles
 * @returns Categorized roles by access level
 */
export const categorizeRolesByAccess = (roles: string[]): Record<string, string[]> => {
  const categories: Record<string, string[]> = {
    admin: [],
    management: [],
    standard: [],
    restricted: []
  };
  
  roles.forEach(role => {
    if (role === 'admin') {
      categories.admin.push(role);
    } else if (role === 'therapist') {
      categories.management.push(role);
    } else if (role === 'support') {
      categories.standard.push(role);
    } else {
      categories.restricted.push(role);
    }
  });
  
  return categories;
};
