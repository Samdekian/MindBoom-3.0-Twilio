
import { UserRole } from './core/rbac';
import { ConsistencyCheckResult } from './utils/rbac/types';

export interface RBACIntegrityCheckOptions {
  autoRepair?: boolean;
  includePermissions?: boolean;
  scanAllUsers?: boolean;
}

export interface RBACIntegrityResult {
  scannedUsers: number;
  consistentUsers: number;
  inconsistentUsers: number;
  repairedUsers: number;
  failedRepairs: number;
  errors: string[];
  userResults: ConsistencyCheckResult[];
  completedAt: Date;
}
