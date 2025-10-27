
import { RBACStats as CoreRBACStats } from '../core/rbac';

export interface RoleBreakdown {
  id: string;
  name: string;
  role: string;
  count: number;
  percentage: number;
}

export interface MostActiveUser {
  id: string;
  userId: string;
  name: string;
  count: number;
  userName?: string;
  email?: string;
  actionCount?: number;
}

export interface RecentError {
  id: string;
  timestamp: Date;
  message: string;
  userId: string;
  userName: string;
}

// We'll use the CoreRBACStats definition and extend it with monitoring-specific methods
export interface RBACStats extends CoreRBACStats {
  // Optional utility methods for monitoring dashboard
  fetchStats?: () => Promise<void>;
  fetchEvents?: () => Promise<void>;
}
