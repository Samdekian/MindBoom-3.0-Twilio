
import { User } from "@supabase/supabase-js";
import { UserRole } from "@/utils/rbac/types";

export interface AuthSignUpResult {
  success: boolean;
  userId?: string;
  error?: Error | any;
}

export interface AuthSignInResult {
  success: boolean;
  user?: User;
  roles?: UserRole[];
  error?: Error | any;
}

export interface AuthSignOutResult {
  success: boolean;
  error?: Error | any;
}

export interface TherapistApprovalStatus {
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  updatedAt: Date;
}

export interface UserPermissions {
  canViewAdminDashboard: boolean;
  canManageUsers: boolean;
  canApproveTherapists: boolean;
  canViewSensitiveData: boolean;
  canModifyRoles: boolean;
  // Added for compatibility with Permissions
  canViewAdmin?: boolean;
  canScheduleAppointments?: boolean;
  canVideoChat?: boolean;
  canAccessReports?: boolean;
  canManageSettings?: boolean;
}

export interface Permissions {
  canViewAdmin: boolean;
  canScheduleAppointments: boolean;
  canVideoChat: boolean;
  canAccessReports: boolean;
  canManageSettings: boolean;
  canViewAdminDashboard?: boolean;
  canManageUsers?: boolean;
  canApproveTherapists?: boolean;
  canViewSensitiveData?: boolean;
  canModifyRoles?: boolean;
}
