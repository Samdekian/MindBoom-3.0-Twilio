
# RBAC System Migration Guide

## Overview

This guide helps you migrate from the old separate Auth and RBAC systems to the new unified AuthRBACProvider.

## Key Changes

1. The new system combines authentication and authorization in a single context
2. Roles and permissions are fetched in a single database query
3. A real permission system maps roles to permissions
4. Component-based permission checks are more efficient
5. Field-level security is now available

## Migration Steps

### Step 1: Update Context Usage

**Before:**
```tsx
import { useAuth } from '@/contexts/AuthContext';
import { useRBAC } from '@/hooks/useRBAC';

function MyComponent() {
  const { user } = useAuth();
  const { hasRole } = useRBAC();
  
  // ...
}
```

**After:**
```tsx
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

function MyComponent() {
  const { user, hasRole } = useAuthRBAC();
  
  // ...
}
```

### Step 2: Update Permission Checks

**Before:**
```tsx
import { usePermission } from '@/hooks/use-permission';

function MyComponent() {
  const { checkPermissions } = usePermission();
  
  const canAccessFeature = checkPermissions([
    { name: 'read:users' }
  ]);
  
  // ...
}
```

**After:**
```tsx
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

function MyComponent() {
  const { hasPermission } = useAuthRBAC();
  
  const canAccessFeature = hasPermission('users', 'read');
  
  // ...
}
```

### Step 3: Update Field-Level Security

**Before:**
```tsx
import { usePermission } from '@/hooks/use-permission';

function MyComponent() {
  const { getFieldAccess } = usePermission();
  
  const fieldAccess = getFieldAccess('patientNotes');
  
  // ...
}
```

**After:**
```tsx
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

function MyComponent() {
  const { getFieldAccess } = useAuthRBAC();
  
  const fieldAccess = getFieldAccess('patientNotes');
  
  // ...
}
```

### Step 4: Update Role-Based Components

All role-based components have been updated to use the new AuthRBACContext. You can continue to use them as before:

- `RoleBasedContainer`
- `RoleBasedGuard`
- `RoleBasedNavItem`
- `RoleBasedNavLink`
- `RoleBasedField`
- `RoleProtectedRoute`

New components are also available:

- `PermissionGuard` - For permission-based access control
- `PermissionField` - For field-level security
- `PermissionProtectedRoute` - For permission-based route protection

### Step 5: Use Field-Level Security

The new system provides field-level security. Use it like this:

```tsx
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

function MyComponent() {
  const { getFieldAccess } = useAuthRBAC();
  
  const { readOnly, hidden, mask } = getFieldAccess('sensitiveField');
  
  if (hidden) return null;
  
  return (
    <div>
      {mask ? '****' : actualValue}
      <input disabled={readOnly} />
    </div>
  );
}
```

### Step 6: Use the PermissionGuard Component

For more granular access control, use the new `PermissionGuard` component:

```tsx
import PermissionGuard from '@/components/PermissionGuard';

function MyComponent() {
  return (
    <PermissionGuard
      permissions={[
        { resource: 'medical_records', action: 'read' }
      ]}
      fallback={<p>You don't have access to medical records</p>}
    >
      <MedicalRecordsViewer />
    </PermissionGuard>
  );
}
```

### Step 7: Enhanced Routes

For permission-based route protection:

```tsx
import PermissionProtectedRoute from '@/components/PermissionProtectedRoute';

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/reports"
        element={
          <PermissionProtectedRoute
            permissions={[{ resource: 'reports', action: 'read' }]}
            redirectPath="/dashboard"
          >
            <ReportsPage />
          </PermissionProtectedRoute>
        }
      />
    </Routes>
  );
}
```

## Testing Utilities

Use the new testing utilities for component testing:

```tsx
import { MockAuthRBACProvider } from '@/utils/testing/MockAuthRBACProvider';

describe('MyComponent', () => {
  it('should display admin features for admin users', () => {
    render(
      <MockAuthRBACProvider roles={['admin']} permissions={[
        { resource: 'users', action: 'manage' }
      ]}>
        <MyComponent />
      </MockAuthRBACProvider>
    );
    
    // Test assertions
  });
});
```

## Troubleshooting

If you encounter issues during migration:

1. Check for console deprecation warnings
2. Temporarily use the compatibility layer in `src/utils/rbac/compatibility-layer.ts`
3. Ensure all role and permission checks are updated
4. Run the consistency check if roles appear incorrect: `performConsistencyCheck()`

## Checking for Inconsistencies

The system includes tools for detecting and fixing role inconsistencies:

```tsx
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

function AdminPage() {
  const { performConsistencyCheck } = useAuthRBAC();
  
  const handleRepair = async () => {
    const result = await performConsistencyCheck();
    console.log('Consistency check result:', result);
  };
  
  return (
    <button onClick={handleRepair}>Repair Role Inconsistencies</button>
  );
}
```

For more advanced diagnostics, use the `RBACVerificationPanel` component.
