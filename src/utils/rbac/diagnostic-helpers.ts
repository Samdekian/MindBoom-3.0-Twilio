
import { RoleDiagnosticResult, UserRole } from '@/types/core/rbac';

/**
 * Creates a complete RoleDiagnosticResult object with all required properties
 */
export function createDiagnosticResult(params: {
  userId: string;
  userExists: boolean;
  isConsistent: boolean;
  databaseRoles?: string[];
  profileRole?: string;
  metadataRole?: string;
  primaryRole?: UserRole;
  errors?: string[];
  severity?: 'low' | 'medium' | 'high';
  issue?: string;
  suggestedFixes?: string[];
  repaired?: boolean;
  userName?: string;
  userEmail?: string;
}): RoleDiagnosticResult {
  return {
    id: `diagnostic-${Date.now()}`,
    user_id: params.userId,
    userId: params.userId,
    user_email: params.userEmail || '',
    expected_roles: [],
    actual_roles: [],
    missing_roles: [],
    extra_roles: [],
    permissions_count: 0,
    last_checked: new Date().toISOString(),
    status: params.isConsistent ? 'healthy' : 'warning',
    issues: params.errors || [],
    databaseRoles: params.databaseRoles || [],
    dbRoles: params.databaseRoles || [],
    profileRole: params.profileRole,
    metadataRole: params.metadataRole,
    errors: params.errors || [],
    isConsistent: params.isConsistent,
    repaired: params.repaired || false,
    userExists: params.userExists,
    userName: params.userName || `User ${params.userId}`,
    primaryRole: params.primaryRole,
    suggestedFixes: params.suggestedFixes || [],
    severity: params.severity || 'medium',
    issue: params.issue || (params.isConsistent ? 'All role data is consistent' : 'Role inconsistency detected')
  };
}
