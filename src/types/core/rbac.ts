
export type UserRole = 'admin' | 'therapist' | 'patient' | 'support';

export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
}

export interface RolePermissions {
  [role: string]: Permission[];
}

export interface User {
  id: string;
  email: string;
  roles: UserRole[];
  permissions?: Permission[];
  metadata?: Record<string, any>;
}

export interface AuthState {
  user: User | null;
  session: any;
  loading: boolean;
  isAuthenticated: boolean;
  primaryRole?: UserRole;
}

// Role hierarchy for permission inheritance
export const ROLE_HIERARCHY: Record<UserRole, UserRole[]> = {
  admin: ['admin', 'therapist', 'patient', 'support'],
  therapist: ['therapist'],
  patient: ['patient'],
  support: ['support', 'patient'], // Support can access patient features
};

// Default permissions for each role
export const DEFAULT_ROLE_PERMISSIONS: RolePermissions = {
  admin: [
    { id: 'user.create', name: 'Create Users', resource: 'user', action: 'create' },
    { id: 'user.read', name: 'Read Users', resource: 'user', action: 'read' },
    { id: 'user.update', name: 'Update Users', resource: 'user', action: 'update' },
    { id: 'user.delete', name: 'Delete Users', resource: 'user', action: 'delete' },
    { id: 'role.manage', name: 'Manage Roles', resource: 'role', action: 'manage' },
    { id: 'system.configure', name: 'Configure System', resource: 'system', action: 'configure' },
  ],
  therapist: [
    { id: 'patient.read', name: 'Read Patients', resource: 'patient', action: 'read' },
    { id: 'patient.update', name: 'Update Patients', resource: 'patient', action: 'update' },
    { id: 'appointment.create', name: 'Create Appointments', resource: 'appointment', action: 'create' },
    { id: 'appointment.read', name: 'Read Appointments', resource: 'appointment', action: 'read' },
    { id: 'appointment.update', name: 'Update Appointments', resource: 'appointment', action: 'update' },
    { id: 'session.create', name: 'Create Sessions', resource: 'session', action: 'create' },
    { id: 'session.read', name: 'Read Sessions', resource: 'session', action: 'read' },
    { id: 'session.update', name: 'Update Sessions', resource: 'session', action: 'update' },
  ],
  patient: [
    { id: 'appointment.create', name: 'Create Appointments', resource: 'appointment', action: 'create' },
    { id: 'appointment.read', name: 'Read Own Appointments', resource: 'appointment', action: 'read' },
    { id: 'profile.update', name: 'Update Own Profile', resource: 'profile', action: 'update' },
    { id: 'session.read', name: 'Read Own Sessions', resource: 'session', action: 'read' },
  ],
  support: [
    { id: 'appointment.read', name: 'Read Appointments', resource: 'appointment', action: 'read' },
    { id: 'user.read', name: 'Read User Info', resource: 'user', action: 'read' },
    { id: 'ticket.create', name: 'Create Support Tickets', resource: 'ticket', action: 'create' },
    { id: 'ticket.read', name: 'Read Support Tickets', resource: 'ticket', action: 'read' },
    { id: 'ticket.update', name: 'Update Support Tickets', resource: 'ticket', action: 'update' },
  ],
};

// Fixed to match actual usage in codebase
export type RoleActionType = 'assigned' | 'removed' | 'edited';

export interface RoleEvent {
  id: string;
  user_id?: string; // Keep both for compatibility
  userId: string;
  userName?: string;
  roleName?: string; // Keep for compatibility
  role?: string; // Actually used property
  action: RoleActionType;
  actionType?: RoleActionType; // Keep both for compatibility
  timestamp: string;
  performedBy: string;
  performedByName?: string;
  actor_id?: string;
  reason?: string;
}

export interface RBACEvent {
  id: string | number;
  userId: string;
  userName: string;
  timestamp: Date | string;
  action?: string; // Add missing action property
  actionType: string;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, any>;
  metadata?: Record<string, any>;
  role?: string;
  targetUserName?: string;
  performedBy?: string;
  performedByName?: string;
}

export interface RBACStats {
  lastDayEvents: number;
  lastWeekEvents: number;
  totalEvents: number;
  activeRoles: number;
  pendingApprovals: number;
  totalUsers: number;
  usersWithRoles: number;
  roleDistribution: Record<string, number>;
  roleBreakdown: RoleBreakdownItem[];
  inconsistencies: number;
  lastScanTime: Date | null;
  lastUpdated?: Date; // Add missing property
  avgResolutionTime?: number; // Add missing property
  successRate?: number; // Add missing property
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

export interface RoleBreakdownItem {
  id: string;
  name: string;
  role?: string;
  count: number;
  percentage: number;
}

export interface RoleDiagnosticResult {
  id?: string;
  issue: string;
  issues?: string[]; // Add missing property
  severity: 'high' | 'medium' | 'low' | 'critical';
  suggestedFix?: string; // Make optional since code uses suggestedFixes
  suggestedFixes?: string[];
  affectedUsers?: number;
  isConsistent?: boolean;
  databaseRoles?: string[];
  dbRoles?: string[];
  profileRole?: string;
  metadataRole?: string;
  user_id?: string; // Keep for compatibility
  userId: string;
  userName?: string;
  userEmail?: string;
  user_email?: string; // Keep for compatibility
  userExists?: boolean;
  primaryRole?: string;
  repaired?: boolean;
  errors?: string[];
  status?: string; // Add missing property
  expected_roles?: string[]; // Add missing property
  actual_roles?: string[]; // Add missing property
  missing_roles?: string[]; // Add missing property
  extra_roles?: string[]; // Add missing property
  permissions_count?: number; // Add missing property
  last_checked?: string; // Add missing property
}

export interface SecurityAlert {
  id: string;
  type: 'role_mismatch' | 'permission_violation' | 'unauthorized_access' | 'security_breach' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  description?: string; // Add missing property
  alertType?: string; // Add missing property
  userId?: string;
  userName?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  resolved?: boolean; // Add missing property
  isResolved?: boolean; // Add missing property
  resolvedAt?: string | Date; // Add missing property
  resolvedBy?: string; // Add missing property
  relatedEvents?: any[]; // Add missing property
}

export type ConnectionQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'disconnected';

export interface RBACPerformanceMetrics {
  averageRoleCheckTime?: number; // Add missing property
  cacheHitRate?: number; // Add missing property
  totalChecks?: number; // Add missing property
  failedChecks?: number; // Add missing property
  slowQueries?: number; // Add missing property
  memoryUsage?: number; // Add missing property
  cacheHits: number;
  cacheMisses: number;
  averageSyncDuration: number;
  totalSyncAttempts: number;
  successRate: number;
  lastSyncTime: Date | null;
  fetchDuration: number | null;
  lastFetchTime: number | null;
  roleOperations: {
    successful: number;
    failed: number;
  };
}

export type ExtendedUserRole = UserRole | 'super_admin' | 'guest';
