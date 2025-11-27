
import { UserRole } from '@/types/core/rbac';

/**
 * Check if a string is a valid UserRole
 * @param role The role string to check
 * @returns boolean indicating if the role is valid
 */
export function isValidUserRole(role: string): role is UserRole {
  const validRoles: UserRole[] = ['admin', 'therapist', 'patient', 'support'];
  return validRoles.includes(role as UserRole);
}

/**
 * Maps legacy or invalid role names to valid UserRole values
 * @param role The role string to map
 * @returns A valid UserRole or a default role ('patient')
 */
export function mapLegacyRoleToUserRole(role: string): UserRole {
  if (isValidUserRole(role)) {
    return role;
  }
  
  // Map common legacy role names to current roles
  switch (role.toLowerCase()) {
    case 'user':
    case 'client':
    case 'member':
      return 'patient';
    case 'doctor':
    case 'counselor':
    case 'psychiatrist':
    case 'psychologist':
      return 'therapist';
    case 'administrator':
    case 'superuser':
      return 'admin';
    case 'customer_support':
    case 'help_desk':
      return 'support';
    default:
      // Default fallback role
      console.warn(`Unmapped role "${role}" defaulting to "patient"`);
      return 'patient';
  }
}

/**
 * Ensures that a role array only contains valid UserRole values
 * @param roles Array of role strings
 * @returns Array with only valid UserRole values
 */
export function sanitizeRoles(roles: string[]): UserRole[] {
  return roles
    .filter(role => role && typeof role === 'string')
    .map(mapLegacyRoleToUserRole);
}

/**
 * Map internal role descriptions to user-friendly labels
 */
export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case 'admin':
      return 'Administrator';
    case 'therapist':
      return 'Therapist';
    case 'patient':
      return 'Patient';
    case 'support':
      return 'Support Staff';
    default:
      return role;
  }
}

/**
 * Check if a user has a specific role from their role array
 */
export function hasRole(roles: UserRole[], roleToCheck: UserRole): boolean {
  return roles.includes(roleToCheck);
}
