
# Integrated AuthRBAC Context Provider Schema

## Overview

The `AuthRBACProvider` will serve as a unified context provider for both authentication and role-based access control, replacing the separate `AuthContext` and `useRBAC` implementations.

## Schema

```typescript
// Context Value Interface
interface AuthRBACContextType {
  // Authentication state
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: Error | null;
  isInitialized: boolean;
  
  // RBAC state
  roles: UserRole[];
  permissions: string[];
  isRbacLoading: boolean;
  rbacError: Error | null;
  
  // Status indicators
  isConsistent: boolean;
  isSynchronizing: boolean;
  lastSyncTime: Date | null;
  
  // Authentication methods
  signIn: (email: string, password: string) => Promise<{ error?: Error; data?: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error?: Error; data?: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: Error }>;
  updatePassword: (newPassword: string) => Promise<{ error?: Error }>;
  loginWithMagicLink: (email: string) => Promise<void>;
  
  // RBAC methods
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAllRoles: (roles: string[]) => boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  refreshRoles: () => Promise<void>;
  checkPermission: (resource: string, action: string) => boolean;
  getFieldPermissions: (fieldName: string) => FieldPermissions;
  
  // Management methods
  performConsistencyCheck: () => Promise<boolean>;
  setAutoRepair: (enabled: boolean) => void;
  autoRepair: boolean;
}

// Provider Props Interface
interface AuthRBACProviderProps {
  children: ReactNode;
  initialRoles?: UserRole[];
  initialPermissions?: string[];
  autoRepairEnabled?: boolean;
  cacheOptions?: {
    ttl: number;
    persistToStorage: boolean;
  };
  fallback?: React.ReactNode;
  onAuthStateChange?: (event: string, session: Session | null) => void;
  onRoleChange?: (roles: UserRole[]) => void;
}
```

## State Management

1. **Combined State**: Manages both auth and RBAC state in a single provider
2. **Single Source of Truth**: All role and permission data comes from the same source
3. **Derived Permissions**: Permissions are derived from roles using a mapping function
4. **Optimization**: Uses memoization to avoid unnecessary re-renders
5. **Caching**: Implements caching strategy for roles and permissions

## Initialization Flow

1. Set up auth state listener first to avoid missing events
2. Check for existing session
3. If user is authenticated, fetch roles and permissions in a single query
4. Derive permissions from roles using mapping function
5. Set initial state and mark as initialized

## Update Flow

1. When auth state changes, update user and session state
2. If user is logged in, fetch roles and permissions
3. If user logs out, clear roles and permissions
4. When roles change, recalculate permissions
5. Periodically check role consistency if enabled

## Performance Optimizations

1. **Role Caching**: Cache roles with configurable TTL
2. **Memoized Helper Functions**: Prevent unnecessary recalculations
3. **Batched State Updates**: Combine related state updates
4. **Derived State**: Calculate permissions only when roles change
5. **Selective Re-renders**: Use context splitting if needed to avoid unnecessary re-renders

## Error Handling

1. **Graceful Degradation**: Fall back to safer defaults when errors occur
2. **Recovery Mechanisms**: Auto-retry for transient errors
3. **User Feedback**: Provide clear error messages when appropriate
4. **Logging**: Log errors for debugging and monitoring
