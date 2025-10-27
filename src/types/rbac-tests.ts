import { UserRole } from '@/types/core/rbac';

export type TestStatus = 'not-run' | 'passed' | 'failed' | 'pending';

export interface TestResult {
  success: boolean;
  message: string;
  timestamp: Date;
}

export interface RBACTest {
  id: string;
  name: string;
  routePath: string;
  requiredRoles: UserRole[];
  description: string;
  targetRoute: string;
  testStatus: TestStatus;
  lastTested: Date | null;
}

export interface OperationTest {
  id: string;
  name: string;
  operationName: string;
  operation: string;
  requiredRoles: UserRole[];
  requiresAuth: boolean;
  description: string;
  testStatus: TestStatus;
  lastTested: Date | null;
}

export interface VulnerabilityReport {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  resourceType: string;
  recommendation: string;
  detectedAt: Date;
}

export interface SecurityAuditResult {
  timestamp: Date;
  passedTests: number;
  failedTests: number;
  vulnerabilitiesFound: VulnerabilityReport[];
}

export interface RBACTestingConfig {
  autoRunTests: boolean;
  testFrequency: 'daily' | 'weekly' | 'monthly' | 'manual';
  notifyOnFailure: boolean;
  autoRepairMode: 'none' | 'suggest' | 'auto';
}
