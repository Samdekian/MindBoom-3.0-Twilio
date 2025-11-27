
import { RBACStats } from "@/types/core/rbac";

/**
 * Interface for security monitoring results
 */
export interface SecurityMonitoringResult {
  status: 'success' | 'warning' | 'error';
  issues: SecurityIssue[];
  lastChecked: Date;
  summaryText: string;
}

/**
 * Interface for security issues
 */
export interface SecurityIssue {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedUsers?: string[];
  detectedAt: Date;
  isResolved: boolean;
  recommendedAction?: string;
}

/**
 * Interface for security audit results
 */
export interface SecurityAuditResult {
  passedChecks: number;
  failedChecks: number;
  criticalIssues: number;
  details: {
    permissionConsistency: boolean;
    roleAssignmentConsistency: boolean;
    userMetadataIntegrity: boolean;
    suspiciousActivityDetected: boolean;
  };
  issues: SecurityIssue[];
}

// Export RBACStats type reference
export type { RBACStats };
