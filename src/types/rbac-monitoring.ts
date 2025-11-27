

export interface RBACStats {
  lastDayEvents: number;
  lastWeekEvents: number;
  totalEvents: number;
  activeRoles: number;
  pendingApprovals: number;
  totalUsers: number;
  usersWithRoles: number;
  roleDistribution: Record<string, number>;
  roleBreakdown: Array<{ id: string; name: string; count: number; percentage: number }>;
  inconsistencies: number;
  lastScanTime: Date | null;
  errorRate: number;
  autoRepairCount: number;
  mostActiveUsers: Array<{ id: string; name: string; count: number; userId?: string; email?: string }>;
  recentErrors: any[];
  uniqueUsers: number;
  roleChanges: number;
  permissionChanges: number;
  healthScore: number;
  recentViolations: number;
  activityByType: Record<string, number>;
  lastActivity: Date | null;
}

export interface RoleDiagnosticResult {
  id?: string;
  issue: string;
  severity: 'high' | 'medium' | 'low' | 'critical';
  suggestedFix: string;
  affectedUsers?: number;
  isConsistent?: boolean;
  databaseRoles?: string[];
  dbRoles?: string[];
  profileRole?: string;
  metadataRole?: string;
  userId: string; // Changed from optional to required
  userName?: string;
  userEmail?: string;
  userExists?: boolean;
  primaryRole?: string;
  repaired?: boolean;
  errors?: string[];
  suggestedFixes?: string[];
}

export interface RoleHistoryEntry {
  id: string;
  userId: string;
  roleName: string;
  action: 'added' | 'removed' | 'modified';
  timestamp: string;
  performedBy: string;
}

export interface RBACEvent {
  id: string | number;
  userId: string;
  userName: string;
  timestamp: Date | string;
  actionType: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  role?: string;
  targetUserName?: string;
}

export interface RoleBreakdownItem {
  id: string;
  name: string;
  role?: string;
  count: number;
  percentage: number;
}

