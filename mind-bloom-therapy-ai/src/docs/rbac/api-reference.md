
# RBAC System API Reference

This document provides a detailed reference of the RBAC system's APIs, hooks, and utilities.

## Table of Contents

- [Hooks](#hooks)
- [Utilities](#utilities)
- [Types](#types)
- [Testing Utilities](#testing-utilities)

## Hooks

### useRBAC

The primary hook for role-based access control.

```typescript
import { useRBAC } from '@/hooks/useRBAC';

const { 
  roles,                  // Array of UserRole
  isLoading,              // Boolean loading state
  error,                  // Error message or null
  hasRole,                // Function to check if user has a specific role
  hasAnyRole,             // Function to check if user has any of the specified roles
  hasAllRoles,            // Function to check if user has all specified roles
  refreshRoles,           // Function to refresh roles from the server
  performConsistencyCheck, // Function to check role consistency
  autoRepair,             // Boolean flag for auto-repairing role inconsistencies
  setAutoRepair           // Function to toggle auto-repair setting
} = useRBAC();
```

#### Parameters

None

#### Return Value

- `roles`: Array of `UserRole` values (`'admin' | 'therapist' | 'patient' | 'support'`)
- `isLoading`: Boolean indicating if roles are being loaded
- `error`: Error message string or null
- `hasRole(role: string)`: Function that returns true if the user has the specified role
- `hasAnyRole(roles: string[])`: Function that returns true if the user has any of the specified roles
- `hasAllRoles(roles: string[])`: Function that returns true if the user has all of the specified roles
- `refreshRoles()`: Async function that refreshes roles from the server
- `performConsistencyCheck()`: Async function that checks and optionally repairs role inconsistencies
- `autoRepair`: Boolean flag indicating if auto-repair of inconsistencies is enabled
- `setAutoRepair(enabled: boolean)`: Function to enable/disable auto-repair of inconsistencies

### usePermission

Hook for permission-based access control.

```typescript
import { usePermission } from '@/hooks/use-permission';

const {
  isLoading,           // Boolean loading state
  checkPermissions,    // Function to check if user has specified permissions
  getFieldAccess       // Function to get field access control settings
} = usePermission();
```

#### Parameters

None

#### Return Value

- `isLoading`: Boolean indicating if permissions are being loaded
- `checkPermissions(permissions: Permission[], options?: { requireAll?: boolean })`: Function that returns true if the user has the specified permissions
- `getFieldAccess(fieldName: string)`: Function that returns field access control settings for the specified field

### useRoleManagement

Hook for managing user roles.

```typescript
import { useRoleManagement } from '@/hooks/useRoleManagement';

const {
  isLoading,       // Boolean loading state
  error,           // Error message or null
  assignRole,      // Function to assign a role to a user
  removeRole,      // Function to remove a role from a user
  listUsers,       // Function to list users with their roles
  listRoles        // Function to list available roles
} = useRoleManagement();
```

#### Return Value

- `isLoading`: Boolean indicating if an operation is in progress
- `error`: Error message string or null
- `assignRole(userId: string, roleName: string)`: Async function to assign a role to a user
- `removeRole(userId: string, roleName: string)`: Async function to remove a role from a user
- `listUsers()`: Async function to list users with their assigned roles
- `listRoles()`: Async function to list available roles

### useRBACMonitoring

Hook for monitoring RBAC events and statistics.

```typescript
import { useRBACMonitoring } from '@/hooks/use-rbac-monitoring';

const {
  events,            // Array of RBAC events
  stats,             // RBAC statistics
  isLoading,         // Boolean loading state
  error,             // Error or null
  fetchEvents,       // Function to fetch events
  fetchStats,        // Function to fetch stats
  logRBACEvent       // Function to log an RBAC event
} = useRBACMonitoring();
```

## Utilities

### rbacConsistencyChecker

Utility for checking and repairing role inconsistencies.

```typescript
import { rbacConsistencyChecker } from '@/services/rbac/consistency-checker';

// Check consistency
const result = await rbacConsistencyChecker.checkUserConsistency(userId, autoRepair);

// Fix inconsistency
await rbacConsistencyChecker.fixUserConsistency(userId);
```

### rbacSecurityMonitor

Utility for monitoring security events.

```typescript
import { rbacSecurityMonitor } from '@/services/rbac/security-monitor';

// Monitor a role assignment
await rbacSecurityMonitor.monitorRoleAssignment(
  performedById,
  targetUserId,
  roleName,
  success
);
```

### roleCache

Cache utility for roles.

```typescript
import { roleCache } from '@/utils/rbac/role-cache';

// Set TTL
roleCache.setTTL(300); // 5 minutes

// Clear cache for a user
roleCache.clearRoles(userId);

// Clear all cache
roleCache.clearAll();
```

### safeRpcCall

Utility for making type-safe RPC calls.

```typescript
import { safeRpcCall } from '@/utils/rbac/safe-supabase-calls';

const { data, error } = await safeRpcCall<string[]>('get_user_roles', { user_id: userId });
```

### safeTableFetch

Utility for making type-safe table fetches.

```typescript
import { safeTableFetch } from '@/utils/rbac/safe-supabase-calls';

const { data, error } = await safeTableFetch<UserPermission[]>('user_permissions', 
  query => query
    .select('*')
    .eq('user_id', userId)
);
```

## Types

### Core Types

```typescript
// User role type
export type UserRole = 'admin' | 'therapist' | 'patient' | 'support';

// Permission interface
export interface Permission {
  name: string;
  description: string;
  category: 'general' | 'admin' | 'therapist' | 'patient' | 'support';
  resource?: string;
  action?: string;
  level?: 'none' | 'read' | 'write' | 'admin';
}

// RBACEvent interface
export interface RBACEvent {
  id: string;
  userId: string;
  userName: string;
  timestamp: Date;
  activityType: string;
  resourceType: string;
  resourceId: string;
  metadata: Record<string, any>;
}

// ConsistencyCheckResult interface
export interface ConsistencyCheckResult {
  userId: string;
  userName?: string;
  userExists: boolean;
  isConsistent: boolean;
  databaseRoles: string[];
  profileRole?: string;
  metadataRole?: string;
  primaryRole?: string;
  suggestedFixes?: string[];
  errors?: string[];
  resolved?: boolean;
  repaired?: boolean;
  timestamp?: Date;
}
```

### Type Adapters

```typescript
import { asUserRole, asUserRoles, isValidUserRole } from '@/types/adapters/rbac';

// Convert string to UserRole if valid
const role = asUserRole('admin'); // 'admin' or undefined

// Convert string array to UserRole array, filtering invalid ones
const roles = asUserRoles(['admin', 'invalid', 'patient']); // ['admin', 'patient']

// Check if string is a valid UserRole
const isValid = isValidUserRole('admin'); // true
```

## Testing Utilities

### setupRBACTestEnvironment

```typescript
import { setupRBACTestEnvironment } from '@/tests/rbac/rbac-test-helpers';

const { 
  mockRole,          // Function to mock user role
  mockPermissions,   // Function to mock permissions
  mockFieldAccess,   // Function to mock field access settings
  clearMocks         // Function to clear all mocks
} = setupRBACTestEnvironment();
```

### testWithRoles

```typescript
import { testWithRoles } from '@/tests/rbac/rbac-test-helpers';

await testWithRoles(
  () => render(<MyComponent />),
  {
    admin: (result) => {
      // Test admin behavior
      expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    },
    patient: (result) => {
      // Test patient behavior
      expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
    }
  }
);
```
