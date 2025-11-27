
import { User, Session } from '@supabase/supabase-js';
import { UserRole } from '@/types/core/rbac';

export interface Permission {
  name: string;
  resource: string;
  action: string;
}

export interface FieldAccessResult {
  readOnly: boolean;
  hidden: boolean;
  mask: boolean;
}

export interface AuthRBACContextType {
  // Authentication state
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
  isInitialized: boolean;
  
  // RBAC state
  userRoles: UserRole[];
  roles: UserRole[]; // Alias for compatibility
  permissions: Permission[];
  
  // Role checking methods
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAllRoles: (roles: string[]) => boolean;
  isAdmin: boolean;
  isTherapist: boolean;
  isPatient: boolean;
  isSupport: boolean;
  primaryRole: UserRole | undefined;
  
  // Permission checking methods
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  checkPermissions: (permissions: any[], options?: { requireAll?: boolean }) => boolean;
  
  // Field access method
  getFieldAccess: (fieldName: string) => FieldAccessResult;
  
  // Authentication methods
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, metadata?: any) => Promise<any>;
  signOut: () => Promise<void>;
  
  // Management methods
  refreshRoles: () => Promise<void>;
  performConsistencyCheck: () => Promise<boolean>;
}
