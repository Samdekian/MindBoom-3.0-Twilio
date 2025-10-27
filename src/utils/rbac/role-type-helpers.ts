
import { UserRole } from "@/types/core/rbac";

/**
 * Type guard to check if a string is a valid UserRole
 * @param role The role string to check
 * @returns boolean indicating if the role is valid
 */
export function isValidUserRole(role: string): role is UserRole {
  const validRoles: UserRole[] = ['admin', 'therapist', 'patient', 'support'];
  return validRoles.includes(role as UserRole);
}

/**
 * Convert any role representation (string, object with id, object with role_id) to a string ID
 * @param role The role to extract an ID from
 * @returns A string representation of the role ID
 */
export function getRoleIdString(role: string | { id: string } | { role_id: string } | unknown): string {
  if (typeof role === 'string') {
    return role;
  }
  
  if (role !== null && typeof role === 'object') {
    if ('id' in role && typeof role.id === 'string') {
      return role.id;
    }
    
    if ('role_id' in role && typeof role.role_id === 'string') {
      return role.role_id;
    }
  }
  
  // Fallback to string conversion with error handling
  try {
    return String(role);
  } catch (e) {
    console.error("Invalid role format:", role);
    throw new Error("Invalid role format: Cannot convert to string ID");
  }
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
 * Converts an array of strings to an array of UserRole
 * Filters out invalid roles
 */
export function asUserRoles(roles: string[]): UserRole[] {
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
