
import { UserRole as CoreUserRole, ConnectionQuality } from '@/types/core/rbac';

export type UserRole = CoreUserRole;

export interface RBACEvent {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  actionType: string;
  resourceType: string;
  resourceId: string;
  details?: Record<string, any>;
  metadata: Record<string, any>;
}

export interface RoleConflict {
  id: string;
  userId: string;
  userName: string;
  conflictType: string;
  conflictingRoles: string[];
  detectedAt: Date;
  status: 'detected' | 'resolved' | 'in_progress';
  resolutionDetails?: string;
}

export interface RBACHealthStatus {
  status: 'healthy' | 'warning' | 'error';
  inconsistencies: number;
  lastCheck: Date;
  message: string;
}

export interface RBACQueryResponse<T> {
  data: T[];
  count: number;
}

export interface RBACPerformanceMetrics {
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

export interface ConsistencyCheckResult {
  userId: string;
  userName?: string;
  userExists: boolean;
  isConsistent: boolean;
  databaseRoles: string[];
  dbRoles?: string[]; // For backward compatibility
  profileRole?: string;
  metadataRole?: string;
  primaryRole?: string;
  suggestedFixes?: string[];
  errors?: string[];
  resolved?: boolean;
  repaired?: boolean;
  timestamp?: Date;
}

export interface CheckOptions {
  autoRepair?: boolean;
  includeDetails?: boolean;
  includePermissions?: boolean;
}
