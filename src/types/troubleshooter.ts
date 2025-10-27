
import { RoleDiagnosticResult } from '@/types/core/rbac';

// Enhanced diagnostic result with additional UI-specific properties
export interface EnhancedDiagnosticResult extends Omit<RoleDiagnosticResult, 'severity' | 'status'> {
  // Override status to include UI-specific statuses
  status: 'warning' | 'error' | 'healthy' | 'info';
  // Override severity to be more specific
  severity: 'low' | 'medium' | 'high' | 'critical';
  // Additional troubleshooter-specific properties
  autoFixAvailable?: boolean;
  estimatedFixTime?: number; // in minutes
  troubleshootingSteps?: string[];
  relatedIssues?: string[];
  fixConfidence?: 'low' | 'medium' | 'high';
  requiresManualIntervention?: boolean;
}

// Troubleshooter operation result
export interface TroubleshooterResult {
  success: boolean;
  message: string;
  data?: EnhancedDiagnosticResult;
  error?: string;
  warnings?: string[];
}

// Search criteria for troubleshooter
export interface TroubleshooterSearchCriteria {
  searchBy: 'userId' | 'email';
  value: string;
  includeResolved?: boolean;
  includePending?: boolean;
}
