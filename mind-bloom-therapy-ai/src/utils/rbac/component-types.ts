
/**
 * Component-level permission types for RBAC system
 */

export interface ComponentPermission {
  resource: string;
  action: string;
  level?: 'none' | 'read' | 'write' | 'admin';
  name?: string;
  description?: string;
  category?: string;
}

export interface FieldAccessSettings {
  readOnly: boolean;
  hidden: boolean;
  mask: boolean;
}

export interface PermissionContext {
  userRoles: string[];
  permissions: ComponentPermission[];
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export interface RoleBasedComponentProps {
  allowedRoles?: string[];
  permissions?: ComponentPermission[];
  requireAll?: boolean;
  requireAllPermissions?: boolean;
  fallback?: React.ReactNode;
  showIfDisallowed?: boolean;
  className?: string;
}

// Field-level access control types
export interface FieldPermissionRule {
  fieldName: string;
  roles: string[];
  permissions: ComponentPermission[];
  access: FieldAccessSettings;
}

// Permission inheritance types
export interface PermissionInheritanceRule {
  parentPermission: string;
  childPermissions: string[];
  inheritanceType: 'full' | 'partial' | 'conditional';
}

// Advanced permission checking types
export interface PermissionCheckOptions {
  requireAll?: boolean;
  context?: Record<string, any>;
  resourceId?: string;
  skipCache?: boolean;
}

export interface PermissionCheckResult {
  hasAccess: boolean;
  reason?: string;
  suggestions?: string[];
  missingPermissions?: ComponentPermission[];
}

// Component permission categories
export const PERMISSION_CATEGORIES = {
  SYSTEM: 'system',
  USER: 'user',
  CONTENT: 'content',
  ADMIN: 'admin',
  SECURITY: 'security',
  BILLING: 'billing',
  REPORTING: 'reporting',
  API: 'api',
} as const;

export type PermissionCategory = typeof PERMISSION_CATEGORIES[keyof typeof PERMISSION_CATEGORIES];

// Standard permission actions
export const PERMISSION_ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  MANAGE: 'manage',
  VIEW: 'view',
  EDIT: 'edit',
  EXECUTE: 'execute',
  APPROVE: 'approve',
  PUBLISH: 'publish',
} as const;

export type PermissionAction = typeof PERMISSION_ACTIONS[keyof typeof PERMISSION_ACTIONS];

// Standard permission resources
export const PERMISSION_RESOURCES = {
  USER: 'user',
  ROLE: 'role',
  PERMISSION: 'permission',
  CONTENT: 'content',
  SYSTEM: 'system',
  ADMIN: 'admin',
  BILLING: 'billing',
  REPORT: 'report',
  AUDIT: 'audit',
  SECURITY: 'security',
} as const;

export type PermissionResource = typeof PERMISSION_RESOURCES[keyof typeof PERMISSION_RESOURCES];
