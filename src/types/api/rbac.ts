
import { Json } from '@/integrations/supabase/types';

/**
 * Database response type for ConsistencyCheckResult
 */
export interface DbConsistencyCheckResult {
  user_id: string;
  is_consistent: boolean;
  db_roles: string[];
  profile_role?: string;
  metadata_role?: string;
  primary_role?: string;
  repaired?: boolean;
  auto_repaired?: boolean;
}

/**
 * Database response type for SecurityAlert
 */
export interface DbSecurityAlert {
  id: string;
  user_id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  alert_type: string;
  created_at: string;
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
  metadata: Json;
}

/**
 * Database response type for RBACEvent
 */
export interface DbRBACEvent {
  id: string;
  user_id: string;
  activity_timestamp: string;
  activity_type: string;
  resource_type: string;
  resource_id: string;
  metadata: Json;
  profiles?: {
    full_name: string;
  };
}

/**
 * Database response type for RoleChangeEvent
 */
export interface DbRoleChangeEvent {
  id: string;
  resource_id: string;
  activity_timestamp: string;
  activity_type: string;
  metadata: Json;
}

/**
 * Database response type for UserRoleAssignment
 */
export interface DbUserRoleAssignment {
  id: string;
  user_id: string;
  role_id: string;
  created_at: string;
  updated_at: string;
  role_name?: string;
}

/**
 * Database response type for RoleDefinition
 */
export interface DbRoleDefinition {
  id: string;
  name: string;
  description: string;
  permissions: Json;
  created_at: string;
  updated_at: string;
}
