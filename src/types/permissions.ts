
export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  level?: 'none' | 'read' | 'write' | 'admin';
}

export interface PermissionGroup {
  id: string;
  name: string;
  permissions: string[]; // Permission IDs
  description?: string;
}

export interface CustomRole {
  id: string;
  name: string;
  description: string;
  permissionGroups: string[]; // Permission Group IDs
  permissions: Record<string, 'none' | 'read' | 'write' | 'admin'>;
  isSystemRole?: boolean;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
}

export type PermissionLevel = 'none' | 'read' | 'write' | 'admin';

export interface PermissionHierarchy {
  id: string;
  name: string;
  parent?: string;
  level: number;
  children: PermissionHierarchy[];
}

export interface PermissionPreset {
  id: string;
  name: string;
  description: string;
  permissions: Record<string, PermissionLevel>;
}

export interface ConsistencyCheckResult {
  user_id: string;
  is_consistent: boolean;
  db_roles: string[];
  primary_role: string;
  profile_role: string;
  metadata_role: string;
  auto_repaired?: boolean;
  recommended_role?: string;
}
