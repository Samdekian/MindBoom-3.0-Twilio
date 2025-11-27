
import { UserRole } from '@/types/core/rbac';
import { Permission } from '@/contexts/auth/types';

/**
 * Unified authentication utilities
 */
export class UnifiedAuthUtils {
  /**
   * Get the primary role from a list of roles
   */
  static getPrimaryRole(roles: UserRole[]): UserRole | undefined {
    const roleHierarchy: UserRole[] = ['admin', 'therapist', 'support', 'patient'];
    
    for (const hierarchyRole of roleHierarchy) {
      if (roles.includes(hierarchyRole)) {
        return hierarchyRole;
      }
    }
    
    return roles[0];
  }

  /**
   * Check if user has sufficient privileges for an operation
   */
  static hasPrivilegeLevel(userRoles: UserRole[], requiredLevel: 'admin' | 'therapist' | 'patient' | 'any'): boolean {
    if (requiredLevel === 'any') return userRoles.length > 0;
    
    const privilegeHierarchy = {
      admin: ['admin'],
      therapist: ['admin', 'therapist'],
      patient: ['admin', 'therapist', 'patient', 'support']
    };
    
    const allowedRoles = privilegeHierarchy[requiredLevel] || [];
    return userRoles.some(role => allowedRoles.includes(role));
  }

  /**
   * Get effective permissions based on roles
   */
  static getEffectivePermissions(roles: UserRole[]): Permission[] {
    const rolePermissions: Record<UserRole, Permission[]> = {
      admin: [
        { name: 'admin:all', resource: '*', action: '*' },
        { name: 'user:manage', resource: 'user', action: 'manage' },
        { name: 'system:configure', resource: 'system', action: 'configure' }
      ],
      therapist: [
        { name: 'patient:view', resource: 'patient', action: 'view' },
        { name: 'session:manage', resource: 'session', action: 'manage' },
        { name: 'notes:write', resource: 'notes', action: 'write' }
      ],
      patient: [
        { name: 'profile:edit', resource: 'profile', action: 'edit' },
        { name: 'appointment:book', resource: 'appointment', action: 'book' },
        { name: 'session:join', resource: 'session', action: 'join' }
      ],
      support: [
        { name: 'user:view', resource: 'user', action: 'view' },
        { name: 'ticket:manage', resource: 'ticket', action: 'manage' },
        { name: 'patient:assist', resource: 'patient', action: 'assist' }
      ]
    };

    const allPermissions: Permission[] = [];
    
    for (const role of roles) {
      const perms = rolePermissions[role] || [];
      allPermissions.push(...perms);
    }

    // Remove duplicates
    return allPermissions.filter((perm, index, self) => 
      index === self.findIndex(p => p.name === perm.name)
    );
  }

  /**
   * Validate role consistency
   */
  static validateRoleConsistency(databaseRoles: string[], metadataRoles: string[]): {
    isConsistent: boolean;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];

    if (databaseRoles.length === 0 && metadataRoles.length === 0) {
      issues.push('No roles found in database or metadata');
      suggestions.push('Assign default patient role');
    }

    const dbSet = new Set(databaseRoles);
    const metaSet = new Set(metadataRoles);

    const missing = metadataRoles.filter(role => !dbSet.has(role));
    const extra = databaseRoles.filter(role => !metaSet.has(role));

    if (missing.length > 0) {
      issues.push(`Missing roles in database: ${missing.join(', ')}`);
      suggestions.push('Add missing roles to user_roles table');
    }

    if (extra.length > 0) {
      issues.push(`Extra roles in database: ${extra.join(', ')}`);
      suggestions.push('Remove extra roles or update user metadata');
    }

    return {
      isConsistent: issues.length === 0,
      issues,
      suggestions
    };
  }
}

/**
 * Hook-style utilities for React components
 */
export const useUnifiedAuthUtils = (roles: UserRole[], permissions: Permission[]) => {
  return {
    primaryRole: UnifiedAuthUtils.getPrimaryRole(roles),
    hasPrivilegeLevel: (level: 'admin' | 'therapist' | 'patient' | 'any') => 
      UnifiedAuthUtils.hasPrivilegeLevel(roles, level),
    effectivePermissions: UnifiedAuthUtils.getEffectivePermissions(roles),
    validateConsistency: (dbRoles: string[], metaRoles: string[]) =>
      UnifiedAuthUtils.validateRoleConsistency(dbRoles, metaRoles)
  };
};
