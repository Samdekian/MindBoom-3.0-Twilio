
/**
 * Defensive RBAC utilities with comprehensive error handling
 */

import { UserRole } from '@/types/core/rbac';
import { safeAsyncOperation, safeSyncOperation } from './error-handling';

/**
 * Safely validate user roles with fallbacks
 */
export function validateUserRoles(roles: unknown): UserRole[] {
  return safeSyncOperation(
    () => {
      if (!Array.isArray(roles)) {
        console.warn('[DefensiveRBAC] Invalid roles type, using default');
        return ['patient'];
      }
      
      const validRoles: UserRole[] = ['admin', 'therapist', 'patient', 'support'];
      const filteredRoles = roles.filter((role): role is UserRole => 
        typeof role === 'string' && validRoles.includes(role as UserRole)
      );
      
      if (filteredRoles.length === 0) {
        console.warn('[DefensiveRBAC] No valid roles found, using default');
        return ['patient'];
      }
      
      return filteredRoles;
    },
    ['patient'],
    { component: 'DefensiveRBAC', action: 'validateUserRoles' }
  );
}

/**
 * Safely check if user has a specific role
 */
export function safeHasRole(userRoles: UserRole[], targetRole: string): boolean {
  return safeSyncOperation(
    () => {
      if (!Array.isArray(userRoles)) {
        return false;
      }
      return userRoles.includes(targetRole as UserRole);
    },
    false,
    { component: 'DefensiveRBAC', action: 'safeHasRole' }
  );
}

/**
 * Safely check if user has any of the specified roles
 */
export function safeHasAnyRole(userRoles: UserRole[], targetRoles: string[]): boolean {
  return safeSyncOperation(
    () => {
      if (!Array.isArray(userRoles) || !Array.isArray(targetRoles)) {
        return false;
      }
      return targetRoles.some(role => userRoles.includes(role as UserRole));
    },
    false,
    { component: 'DefensiveRBAC', action: 'safeHasAnyRole' }
  );
}

/**
 * Safely get the primary role with fallback
 */
export function safePrimaryRole(userRoles: UserRole[]): UserRole {
  return safeSyncOperation(
    () => {
      if (!Array.isArray(userRoles) || userRoles.length === 0) {
        return 'patient';
      }
      
      // Priority order for roles
      const rolePriority: UserRole[] = ['admin', 'support', 'therapist', 'patient'];
      
      for (const priorityRole of rolePriority) {
        if (userRoles.includes(priorityRole)) {
          return priorityRole;
        }
      }
      
      return userRoles[0];
    },
    'patient',
    { component: 'DefensiveRBAC', action: 'safePrimaryRole' }
  );
}

/**
 * Defensive role fetching with retries
 */
export async function safeRoleFetch(userId: string): Promise<UserRole[]> {
  return safeAsyncOperation(
    async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          roles!inner (
            name
          )
        `)
        .eq('user_id', userId);
      
      if (error) {
        throw new Error(`Failed to fetch roles: ${error.message}`);
      }
      
      const roles = data?.map((item: any) => item.roles?.name).filter(Boolean) || [];
      return validateUserRoles(roles);
    },
    {
      retries: 2,
      retryDelay: 1000,
      fallback: ['patient'],
      context: { component: 'DefensiveRBAC', action: 'safeRoleFetch', userId }
    }
  );
}

/**
 * Create a role cache with TTL
 */
class RoleCache {
  private cache = new Map<string, { roles: UserRole[]; expiry: number }>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  set(userId: string, roles: UserRole[]) {
    this.cache.set(userId, {
      roles: validateUserRoles(roles),
      expiry: Date.now() + this.TTL
    });
  }

  get(userId: string): UserRole[] | null {
    const entry = this.cache.get(userId);
    
    if (!entry) {
      return null;
    }
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(userId);
      return null;
    }
    
    return entry.roles;
  }

  clear() {
    this.cache.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

// Export singleton cache
export const roleCache = new RoleCache();

/**
 * Enhanced role fetch with caching
 */
export async function cachedRoleFetch(userId: string): Promise<UserRole[]> {
  // Check cache first
  const cached = roleCache.get(userId);
  if (cached) {
    return cached;
  }
  
  // Fetch from database
  const roles = await safeRoleFetch(userId);
  
  // Cache the result
  roleCache.set(userId, roles);
  
  return roles;
}
