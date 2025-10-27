
import { UserRole } from '@/types/core/rbac';

// Define the Permission type
export interface Permission {
  resource: string;
  action: string;
  description?: string;
}

// Define an extended type for the ROLE_PERMISSIONS object
export interface RolePermissionsMap extends Record<UserRole, Permission[]> {
  _legacy?: {
    guest?: Permission[];
    user?: Permission[];
  };
}

/**
 * Map of roles to their associated permissions
 */
export const ROLE_PERMISSIONS: RolePermissionsMap = {
  // Admin has all permissions
  'admin': [
    { resource: 'appointments', action: 'create' },
    { resource: 'appointments', action: 'read' },
    { resource: 'appointments', action: 'update' },
    { resource: 'appointments', action: 'delete' },
    { resource: 'users', action: 'read' },
    { resource: 'users', action: 'update' },
    { resource: 'users', action: 'delete' },
    { resource: 'roles', action: 'assign' },
    { resource: 'therapists', action: 'approve' },
    { resource: 'admin_dashboard', action: 'access' },
    { resource: 'security_dashboard', action: 'access' },
    { resource: 'reports', action: 'view' },
    { resource: 'system_settings', action: 'manage' }
  ],
  
  // Therapist permissions
  'therapist': [
    { resource: 'appointments', action: 'create' },
    { resource: 'appointments', action: 'read' },
    { resource: 'appointments', action: 'update' },
    { resource: 'patients', action: 'read' },
    { resource: 'patients', action: 'update' },
    { resource: 'profile', action: 'read' },
    { resource: 'profile', action: 'update' },
    { resource: 'calendar', action: 'manage' },
    { resource: 'session_notes', action: 'create' },
    { resource: 'session_notes', action: 'read' },
    { resource: 'session_notes', action: 'update' }
  ],
  
  // Patient permissions
  'patient': [
    { resource: 'appointments', action: 'create' },
    { resource: 'appointments', action: 'read' },
    { resource: 'appointments', action: 'update' },
    { resource: 'appointments', action: 'cancel' },
    { resource: 'profile', action: 'read' },
    { resource: 'profile', action: 'update' },
    { resource: 'therapists', action: 'read' },
    { resource: 'therapists', action: 'book' },
    { resource: 'mood_tracker', action: 'create' },
    { resource: 'mood_tracker', action: 'read' },
    { resource: 'mood_tracker', action: 'update' }
  ],
  
  // Support staff permissions
  'support': [
    { resource: 'appointments', action: 'read' },
    { resource: 'users', action: 'read' },
    { resource: 'profile', action: 'read' },
    { resource: 'help_tickets', action: 'read' },
    { resource: 'help_tickets', action: 'update' },
    { resource: 'help_tickets', action: 'resolve' },
    { resource: 'customer_service', action: 'provide' }
  ]
};

// Add legacy roles as a separate object
ROLE_PERMISSIONS._legacy = {
  // Guest permissions (mapped to patient in the new system)
  guest: [
    { resource: 'profile', action: 'read' },
    { resource: 'profile', action: 'update' },
    { resource: 'therapists', action: 'read' },
    { resource: 'appointments', action: 'create' }
  ],
  
  // User permissions (mapped to patient in the new system)
  user: [
    { resource: 'profile', action: 'read' },
    { resource: 'profile', action: 'update' },
    { resource: 'therapists', action: 'read' },
    { resource: 'appointments', action: 'create' },
    { resource: 'appointments', action: 'read' },
    { resource: 'appointments', action: 'update' }
  ]
};

/**
 * Get all permissions for a given role
 * @param role The role to get permissions for
 * @returns Array of permissions for the role
 */
export function getPermissionsForRole(role: string): Permission[] {
  if (role in ROLE_PERMISSIONS) {
    return ROLE_PERMISSIONS[role as UserRole];
  } else if (role === 'guest' && ROLE_PERMISSIONS._legacy?.guest) {
    return ROLE_PERMISSIONS._legacy.guest;
  } else if (role === 'user' && ROLE_PERMISSIONS._legacy?.user) {
    return ROLE_PERMISSIONS._legacy.user;
  }
  
  // Default to patient permissions if role not found
  return ROLE_PERMISSIONS.patient;
}

/**
 * Get all permissions for an array of roles
 * @param roles Array of roles
 * @returns Array of unique permissions
 */
export function getPermissionsForRoles(roles: string[]): Permission[] {
  // Collect all permissions from all roles
  const allPermissions = roles.flatMap(role => getPermissionsForRole(role));
  
  // Remove duplicates by creating a Map keyed by resource:action
  const uniquePermissions = new Map<string, Permission>();
  allPermissions.forEach(perm => {
    const key = `${perm.resource}:${perm.action}`;
    if (!uniquePermissions.has(key)) {
      uniquePermissions.set(key, perm);
    }
  });
  
  return [...uniquePermissions.values()];
}
