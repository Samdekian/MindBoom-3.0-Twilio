
import React, { ReactNode } from 'react';
import { AuthRBACContextType, Permission } from '@/contexts/auth/types';
import { UserRole } from '@/types/core/rbac';
import { ComponentPermission } from '@/utils/rbac/component-types';

// Create the context manually since we can't import it
const AuthRBACContext = React.createContext<AuthRBACContextType | undefined>(undefined);

interface MockAuthRBACProviderProps {
  children: ReactNode;
  roles?: UserRole[];
  permissions?: Permission[];
  isAuthenticated?: boolean;
  loading?: boolean;
  user?: any;
  error?: Error | null;
}

/**
 * A mock provider for testing components that use the AuthRBAC context
 */
export const MockAuthRBACProvider: React.FC<MockAuthRBACProviderProps> = ({
  children,
  roles = [],
  permissions = [],
  isAuthenticated = true,
  loading = false,
  user = { id: 'mock-user-id', email: 'test@example.com' },
  error = null,
}) => {
  const primaryRole = roles.length > 0 ? roles[0] : undefined;
  const isAdmin = roles.includes('admin' as UserRole);
  
  // Mock implementation of methods
  const hasRole = (role: UserRole | string): boolean => roles.includes(role as UserRole);
  const hasAnyRole = (checkRoles: (UserRole | string)[]): boolean => 
    checkRoles.some(role => roles.includes(role as UserRole));
  const hasAllRoles = (checkRoles: (UserRole | string)[]): boolean => 
    checkRoles.every(role => roles.includes(role as UserRole));
  
  const hasPermission = (permissionString: string): boolean => {
    const [resource, action] = permissionString.split(':');
    return permissions.some(p => p.resource === resource && p.action === action);
  };
  
  const checkPermissions = (perms: ComponentPermission[], options?: { requireAll?: boolean }): boolean => {
    if (!perms.length) return true;
    
    const requireAll = options?.requireAll || false;
    
    if (requireAll) {
      return perms.every(p => hasPermission(`${p.resource}:${p.action}`));
    } else {
      return perms.some(p => hasPermission(`${p.resource}:${p.action}`));
    }
  };
  
  const refreshRoles = async (): Promise<void> => {};
  const performConsistencyCheck = async (): Promise<boolean> => true;
  
  const getFieldAccess = (fieldName: string) => ({
    canRead: !isAdmin,
    canWrite: isAdmin,
    readOnly: !isAdmin,
    hidden: false,
    mask: false
  });
  
  // Auth method mocks
  const signIn = async () => ({ data: {}, error: undefined });
  const signUp = async () => ({ data: {}, error: undefined });
  const signOut = async () => {};
  
  // Create mock session with required properties
  const mockSession = isAuthenticated ? {
    user,
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    token_type: 'bearer'
  } : null;
  
  const mockContextValue: AuthRBACContextType = {
    user: isAuthenticated ? user : null,
    session: mockSession,
    loading,
    isInitialized: true,
    isAuthenticated,
    isAdmin,
    isTherapist: roles.includes('therapist' as UserRole),
    isPatient: roles.includes('patient' as UserRole),
    isSupport: roles.includes('support' as UserRole),

    signIn,
    signUp,
    signOut,

    roles: roles,
    userRoles: roles,
    permissions,
    primaryRole,

    hasRole,
    hasAnyRole,
    hasAllRoles,
    hasPermission,
    hasAnyPermission: hasAnyRole,
    hasAllPermissions: hasAllRoles,
    checkPermissions,
    refreshRoles,
    performConsistencyCheck,

    getFieldAccess,
  };
  
  return (
    <AuthRBACContext.Provider value={mockContextValue}>
      {children}
    </AuthRBACContext.Provider>
  );
};
