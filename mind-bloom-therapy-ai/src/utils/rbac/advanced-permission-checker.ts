
import { ComponentPermission, PermissionCheckOptions, PermissionCheckResult } from './component-types';
import { UserRole } from '@/types/core/rbac';

/**
 * Advanced permission checking with context awareness and detailed results
 */
export class AdvancedPermissionChecker {
  private roleHierarchy: Record<UserRole, UserRole[]> = {
    admin: ['admin', 'therapist', 'patient', 'support'],
    therapist: ['therapist'],
    patient: ['patient'],
    support: ['support', 'patient'],
  };

  private permissionInheritance: Record<string, string[]> = {
    'admin:manage': ['admin:create', 'admin:read', 'admin:update', 'admin:delete'],
    'user:manage': ['user:create', 'user:read', 'user:update', 'user:delete'],
    'content:manage': ['content:create', 'content:read', 'content:update', 'content:delete'],
  };

  /**
   * Check permissions with advanced logic and detailed results
   */
  checkPermissions(
    userRoles: UserRole[],
    userPermissions: ComponentPermission[],
    requiredPermissions: ComponentPermission[],
    options: PermissionCheckOptions = {}
  ): PermissionCheckResult {
    const { requireAll = false, context = {}, resourceId } = options;
    
    // Admin users have all permissions
    if (userRoles.includes('admin')) {
      return {
        hasAccess: true,
        reason: 'Admin user has full access'
      };
    }

    // Check each required permission
    const missingPermissions: ComponentPermission[] = [];
    const checkResults: boolean[] = [];

    for (const required of requiredPermissions) {
      const hasPermission = this.checkSinglePermission(
        userRoles,
        userPermissions,
        required,
        context,
        resourceId
      );
      
      checkResults.push(hasPermission);
      
      if (!hasPermission) {
        missingPermissions.push(required);
      }
    }

    // Determine final access based on requireAll flag
    const hasAccess = requireAll 
      ? checkResults.every(result => result)
      : checkResults.some(result => result);

    return {
      hasAccess,
      reason: this.getAccessReason(hasAccess, requireAll, checkResults),
      missingPermissions: missingPermissions.length > 0 ? missingPermissions : undefined,
      suggestions: this.getSuggestions(userRoles, missingPermissions)
    };
  }

  /**
   * Check a single permission with inheritance and context
   */
  private checkSinglePermission(
    userRoles: UserRole[],
    userPermissions: ComponentPermission[],
    required: ComponentPermission,
    context: Record<string, any>,
    resourceId?: string
  ): boolean {
    // Direct permission match
    const directMatch = userPermissions.some(perm => 
      perm.resource === required.resource && 
      perm.action === required.action
    );
    
    if (directMatch) {
      return true;
    }

    // Check role hierarchy
    const effectiveRoles = this.getEffectiveRoles(userRoles);
    const roleBasedAccess = this.checkRoleBasedAccess(effectiveRoles, required);
    
    if (roleBasedAccess) {
      return true;
    }

    // Check permission inheritance
    const inheritedAccess = this.checkInheritedPermissions(userPermissions, required);
    
    if (inheritedAccess) {
      return true;
    }

    // Context-specific checks
    if (context && Object.keys(context).length > 0) {
      const contextualAccess = this.checkContextualAccess(
        userRoles, 
        userPermissions, 
        required, 
        context, 
        resourceId
      );
      
      if (contextualAccess) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get effective roles based on hierarchy
   */
  private getEffectiveRoles(userRoles: UserRole[]): UserRole[] {
    const effectiveRoles = new Set<UserRole>();
    
    for (const role of userRoles) {
      const hierarchyRoles = this.roleHierarchy[role] || [role];
      hierarchyRoles.forEach(r => effectiveRoles.add(r));
    }
    
    return Array.from(effectiveRoles);
  }

  /**
   * Check role-based access for specific permissions
   */
  private checkRoleBasedAccess(roles: UserRole[], required: ComponentPermission): boolean {
    // Define role-based permission mappings
    const rolePermissions: Record<UserRole, string[]> = {
      admin: ['*:*'], // Admin has all permissions
      therapist: [
        'patient:read', 'patient:update',
        'appointment:create', 'appointment:read', 'appointment:update',
        'session:create', 'session:read', 'session:update',
        'notes:create', 'notes:read', 'notes:update'
      ],
      patient: [
        'profile:read', 'profile:update',
        'appointment:create', 'appointment:read', 'appointment:cancel',
        'session:read', 'session:join'
      ],
      support: [
        'user:read', 'appointment:read',
        'ticket:create', 'ticket:read', 'ticket:update'
      ]
    };

    const requiredPermissionKey = `${required.resource}:${required.action}`;
    
    return roles.some(role => {
      const permissions = rolePermissions[role] || [];
      return permissions.includes('*:*') || permissions.includes(requiredPermissionKey);
    });
  }

  /**
   * Check inherited permissions
   */
  private checkInheritedPermissions(userPermissions: ComponentPermission[], required: ComponentPermission): boolean {
    const requiredKey = `${required.resource}:${required.action}`;
    
    // Check if user has a parent permission that inherits to the required permission
    for (const [parentKey, inheritedPerms] of Object.entries(this.permissionInheritance)) {
      if (inheritedPerms.includes(requiredKey)) {
        const [parentResource, parentAction] = parentKey.split(':');
        const hasParentPermission = userPermissions.some(perm => 
          perm.resource === parentResource && perm.action === parentAction
        );
        
        if (hasParentPermission) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Check contextual access based on additional context
   */
  private checkContextualAccess(
    userRoles: UserRole[],
    userPermissions: ComponentPermission[],
    required: ComponentPermission,
    context: Record<string, any>,
    resourceId?: string
  ): boolean {
    // Owner-based access
    if (context.ownerId && context.currentUserId) {
      if (context.ownerId === context.currentUserId) {
        // Users can typically access their own resources
        if (['read', 'update'].includes(required.action)) {
          return true;
        }
      }
    }

    // Time-based access
    if (context.timeRestricted) {
      const now = new Date();
      const startTime = context.accessStartTime ? new Date(context.accessStartTime) : null;
      const endTime = context.accessEndTime ? new Date(context.accessEndTime) : null;
      
      if (startTime && now < startTime) return false;
      if (endTime && now > endTime) return false;
    }

    // IP-based access
    if (context.ipRestricted && context.allowedIPs && context.currentIP) {
      if (!context.allowedIPs.includes(context.currentIP)) {
        return false;
      }
    }

    return false;
  }

  /**
   * Get human-readable reason for access decision
   */
  private getAccessReason(hasAccess: boolean, requireAll: boolean, results: boolean[]): string {
    if (hasAccess) {
      if (requireAll) {
        return 'User has all required permissions';
      } else {
        return 'User has at least one required permission';
      }
    } else {
      if (requireAll) {
        const missing = results.filter(r => !r).length;
        return `User is missing ${missing} required permissions`;
      } else {
        return 'User does not have any of the required permissions';
      }
    }
  }

  /**
   * Get suggestions for missing permissions
   */
  private getSuggestions(userRoles: UserRole[], missingPermissions: ComponentPermission[]): string[] {
    const suggestions: string[] = [];
    
    if (missingPermissions.length === 0) {
      return suggestions;
    }

    // Role-based suggestions
    if (!userRoles.includes('admin') && missingPermissions.length > 3) {
      suggestions.push('Consider requesting admin role for full access');
    }

    // Specific permission suggestions
    const uniqueResources = [...new Set(missingPermissions.map(p => p.resource))];
    if (uniqueResources.length === 1) {
      suggestions.push(`Request ${uniqueResources[0]} access from your administrator`);
    }

    return suggestions;
  }
}

// Export singleton instance
export const advancedPermissionChecker = new AdvancedPermissionChecker();
