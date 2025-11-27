
# Role-Based Access Control (RBAC) System Documentation

## Overview

The RBAC system provides a comprehensive solution for managing user roles, permissions, and access control throughout the application. This document outlines the architecture, key components, and usage patterns for developers.

## Table of Contents

1. [Type System](#type-system)
2. [Core Components](#core-components)
3. [Hooks API](#hooks-api)
4. [UI Components](#ui-components)
5. [Security Features](#security-features)
6. [Common Patterns](#common-patterns)
7. [Troubleshooting](#troubleshooting)

## Type System

### Core Types

The RBAC system is built on a unified type system defined in `src/types/core/rbac.ts`. Key types include:

- `UserRole`: Standard user roles in the system (admin, therapist, patient, support)
- `Permission`: Describes individual permissions that can be granted
- `RoleDefinition`: Maps roles to their associated permissions
- `SecurityAlert`: Represents security incidents in the system
- `ConsistencyCheckResult`: Results of role consistency verification
- `RoleDiagnosticResult`: Enhanced results with suggested fixes

### Type Adapters

To maintain backward compatibility while improving the system, adapter functions in `src/types/adapters/rbac.ts` provide conversion between legacy and modern type formats:

```typescript
// Example: Converting database result to standardized type
import { normalizeConsistencyResult } from '@/types/adapters/rbac';

const dbResult = await checkUserRolesConsistency(userId);
const normalizedResult = normalizeConsistencyResult(dbResult);
```

## Core Components

### Role Management

The role management system allows administrators to:

1. Assign roles to users
2. Remove roles from users
3. List available roles
4. List users with their assigned roles

### Access Control

Components for protecting routes and UI elements based on user roles:

- `RoleProtectedRoute`: Restricts route access to users with specific roles
- `RoleBasedGuard`: Conditionally renders UI elements based on user roles

### Security Monitoring

The security monitoring system detects and logs suspicious activities:

- Unauthorized access attempts
- Unusual role changes
- Role inconsistencies across systems

## Hooks API

### useRBAC

The main hook for accessing role information:

```typescript
import { useRBAC } from '@/hooks/useRBAC';

function MyComponent() {
  const { roles, hasRole, hasAnyRole, isLoading } = useRBAC();
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div>
      {hasRole('admin') && <AdminPanel />}
      {hasAnyRole(['therapist', 'admin']) && <TherapistTools />}
    </div>
  );
}
```

### useRoleManagement

For administrative role operations:

```typescript
import { useRoleManagement } from '@/hooks/useRoleManagement';

function RoleAdmin() {
  const { assignRole, removeRole, listUsers, listRoles } = useRoleManagement();
  
  const handleAssignRole = async (userId, role) => {
    const success = await assignRole(userId, role);
    if (success) {
      // Handle success
    }
  };
}
```

### useRoleTroubleshooter

For diagnosing and fixing role issues:

```typescript
import { useRoleTroubleshooter } from '@/hooks/use-role-troubleshooter';

function Troubleshooter() {
  const { checkUser, repairUser, result } = useRoleTroubleshooter();
  
  // Check user roles for consistency issues
  const handleCheck = () => checkUser(userId);
  
  // Automatically repair inconsistencies if found
  const handleRepair = () => repairUser();
}
```

## UI Components

### Role Management UI

- `EnhancedRoleManagement`: Complete UI for administrators to manage user roles
- `UserRoleManager`: Simplified component for basic role assignments
- `RoleChangeHistory`: Displays history of role changes for a user

### Security & Monitoring

- `SecurityAlertsList`: Displays security alerts with severity indicators
- `RoleSyncStatusIndicator`: Shows role synchronization status
- `RoleHealthDashboard`: Overview of system-wide role health

## Security Features

### Rate Limiting

Role operations are rate-limited to prevent abuse:

```typescript
import { rbacRateLimiter } from '@/utils/rbac/rate-limiter';

// Check if an operation is allowed
const isAllowed = rbacRateLimiter.isAllowed(`${userId}:role-assign`);
```

### Consistency Checking

The system can automatically detect and repair inconsistencies:

```typescript
import { rbacConsistencyChecker } from '@/services/rbac/consistency-checker';

// Check for inconsistencies
const result = await rbacConsistencyChecker.checkUserConsistency(userId);

// Auto-repair if needed
if (!result.isConsistent) {
  await rbacConsistencyChecker.fixUserConsistency(userId);
}
```

### Security Monitoring

All role operations are monitored for suspicious activity:

```typescript
import { rbacSecurityMonitor } from '@/services/rbac/security-monitor';

// Monitor a role change operation
await rbacSecurityMonitor.monitorRoleAssignment(
  performedById,
  targetUserId,
  roleName,
  success
);
```

## Common Patterns

### Restricting Access to Routes

```typescript
import { RoleProtectedRoute } from '@/components/RoleProtectedRoute';

<Routes>
  <Route path="/" element={<Home />} />
  <Route 
    path="/admin/*" 
    element={
      <RoleProtectedRoute 
        requiredRoles={['admin']} 
        redirectTo="/access-denied"
      >
        <AdminDashboard />
      </RoleProtectedRoute>
    } 
  />
</Routes>
```

### Conditional UI Rendering

```typescript
import { useRBAC } from '@/hooks/useRBAC';

function ConditionalFeature() {
  const { hasRole } = useRBAC();
  
  return (
    <div>
      <h1>User Dashboard</h1>
      
      {/* Only visible to admins */}
      {hasRole('admin') && (
        <AdminControls />
      )}
      
      {/* Visible to all authenticated users */}
      <UserProfile />
    </div>
  );
}
```

### Handling Role Synchronization

```typescript
import SyncProfileButton from '@/components/SyncProfileButton';
import { useRBAC } from '@/hooks/useRBAC';

function ProfileActions() {
  const { roles, refreshRoles } = useRBAC();
  
  const handleSyncComplete = async () => {
    await refreshRoles();
  };
  
  return (
    <div>
      <SyncProfileButton onSyncComplete={handleSyncComplete} />
    </div>
  );
}
```

## Troubleshooting

### Common Issues

1. **Role doesn't appear after assignment**: 
   - Check for race conditions by refreshing roles with `refreshRoles()`
   - Verify the role was properly assigned in the database
   - Check for role caching issues

2. **Type errors in component props**: 
   - Ensure you're using the correct type imports
   - Use type adapters for legacy components
   - Verify string vs enum usage for roles

3. **Role permissions not working**: 
   - Check that the permission is correctly mapped to the role
   - Verify the permission check is using the correct resource/action names
   - Ensure roles are being loaded before permission checks

### Debugging Tools

1. Role Troubleshooter: `/role-troubleshooter` route provides UI for checking role consistency
2. Console methods for debugging:
   ```typescript
   // In browser console:
   await rbacConsistencyChecker.checkUserConsistency(userId, true);
   ```
3. Security logs: Check security alerts table for suspicious activity
