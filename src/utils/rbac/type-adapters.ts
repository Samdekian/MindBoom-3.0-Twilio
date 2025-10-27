
import { UserRole } from '@/types/core/rbac';

const VALID_USER_ROLES: UserRole[] = ['admin', 'therapist', 'patient', 'support'];

/**
 * Safely converts an array of strings to UserRole array
 * Filters out invalid roles and ensures type safety
 */
export function asUserRoles(roles: string[]): UserRole[] {
  if (!Array.isArray(roles)) {
    console.warn('[type-adapters] asUserRoles: Input is not an array, returning empty array');
    return [];
  }
  
  const validRoles = roles.filter((role): role is UserRole => {
    const isValid = VALID_USER_ROLES.includes(role as UserRole);
    if (!isValid && role) {
      console.warn('[type-adapters] asUserRoles: Invalid role filtered out:', role);
    }
    return isValid;
  });
  
  console.log('[type-adapters] asUserRoles: Converted roles:', { input: roles, output: validRoles });
  return validRoles;
}

/**
 * Safely converts a single string to UserRole
 * Returns undefined if invalid
 */
export function asUserRole(role: string): UserRole | undefined {
  if (VALID_USER_ROLES.includes(role as UserRole)) {
    return role as UserRole;
  }
  console.warn('[type-adapters] asUserRole: Invalid role:', role);
  return undefined;
}

/**
 * Validates if a string is a valid UserRole
 */
export function isValidUserRole(role: string): role is UserRole {
  return VALID_USER_ROLES.includes(role as UserRole);
}

/**
 * Safely converts value to boolean
 */
export function safeBoolean(value: any): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  if (typeof value === 'number') {
    return value !== 0;
  }
  return Boolean(value);
}

// Export UserRole type for convenience
export type { UserRole };
