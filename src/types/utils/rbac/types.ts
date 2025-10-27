
import { UserRole } from '@/types/core/rbac';

export interface ConsistencyCheckResult {
  userId: string;
  userName?: string;
  userExists: boolean;
  isConsistent: boolean;
  databaseRoles?: string[];
  dbRoles?: string[];
  profileRole?: string;
  metadataRole?: string;
  primaryRole?: string;
  suggestedFixes?: string[];
  errors: string[];
  resolved?: boolean;
  repaired?: boolean;
  timestamp?: string | Date;
  issue?: string;
  severity?: 'high' | 'medium' | 'low' | 'critical';
  issues?: string[];
  userEmail?: string;
}

export interface CheckOptions {
  autoRepair?: boolean;
  includeDetails?: boolean;
  skipCache?: boolean;
}

export interface RoleConflict {
  userId: string;
  conflictType: string;
  description: string;
  severity: 'high' | 'medium' | 'low' | 'critical';
}

export interface RBACHealthStatus {
  overall: 'healthy' | 'warning' | 'critical';
  issues: RoleConflict[];
  lastCheck: Date;
}

export interface RBACQueryResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: Date;
}

export interface RBACPerformanceMetrics {
  queryTime: number;
  cacheHits: number;
  cacheMisses: number;
  totalQueries: number;
}

export interface RBACTest {
  id: string;
  name: string;
  description: string;
  status: TestStatus;
  result?: any;
}

export interface OperationTest {
  operation: string;
  expected: boolean;
  actual: boolean;
  passed: boolean;
}

export type TestStatus = 'pending' | 'running' | 'passed' | 'failed' | 'error';
