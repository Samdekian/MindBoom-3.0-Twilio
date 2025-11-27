
# RBAC API Usage Guide

This guide provides practical examples of how to use the RBAC system in your application code.

## Quick Start

### Basic Role Checking

```tsx
import { useRBAC } from '@/hooks/useRBAC';

function MyComponent() {
  const { hasRole, hasAnyRole, isLoading } = useRBAC();
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <>
      {hasRole('admin') && <AdminPanel />}
      {hasAnyRole(['therapist', 'admin']) && <PatientRecords />}
    </>
  );
}
```

### Route Protection

```tsx
import RoleProtectedRoute from '@/components/RoleProtectedRoute';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route 
        path="/admin/*" 
        element={
          <RoleProtectedRoute 
            allowedRoles={['admin']} 
            redirectPath="/access-denied"
          >
            <AdminDashboard />
          </RoleProtectedRoute>
        } 
      />
    </Routes>
  );
}
```

## Core Hooks

### useRBAC

The `useRBAC` hook provides role information and role-based access control functionality.

```tsx
const { 
  roles,                  // Array of user roles
  isLoading,              // Loading state
  error,                  // Error message if any
  hasRole,                // Function to check if user has a role
  hasAnyRole,             // Function to check if user has any of the specified roles
  hasAllRoles,            // Function to check if user has all specified roles
  refreshRoles,           // Function to refresh roles
  performConsistencyCheck // Function to check role consistency
} = useRBAC();
```

#### Example: Dynamically Render UI Based on Roles

```tsx
import { useRBAC } from '@/hooks/useRBAC';

function DashboardActions() {
  const { hasRole, hasAnyRole } = useRBAC();

  return (
    <div className="dashboard-actions">
      {hasRole('admin') && (
        <button className="btn btn-danger">Delete User</button>
      )}
      
      {hasAnyRole(['admin', 'therapist']) && (
        <button className="btn btn-primary">Edit Records</button>
      )}
      
      <button className="btn btn-secondary">View Profile</button>
    </div>
  );
}
```

### usePermission

The `usePermission` hook provides permission-based checks for finer-grained access control.

```tsx
const {
  permissions,        // Array of permissions
  isLoading,          // Loading state
  hasPermission,      // Check specific permission
  checkPermissions,   // Check multiple permissions
  getFieldAccess      // Get field access settings
} = usePermission();
```

#### Example: Permission-Based UI Control

```tsx
import { usePermission } from '@/hooks/usePermission';

function PatientRecord({ patient }) {
  const { hasPermission, getFieldAccess } = usePermission();
  const diagnosisAccess = getFieldAccess('patient.diagnosis');
  
  return (
    <div className="patient-record">
      <h2>{patient.name}</h2>
      
      {/* Only show edit button with proper permission */}
      {hasPermission({ resource: 'patient', action: 'edit' }) && (
        <button>Edit</button>
      )}
      
      {/* Handle field-level access */}
      {!diagnosisAccess.hidden && (
        <div className="diagnosis">
          <h3>Diagnosis</h3>
          <p className={diagnosisAccess.readOnly ? 'read-only' : ''}>
            {diagnosisAccess.mask ? '••••••••' : patient.diagnosis}
          </p>
        </div>
      )}
    </div>
  );
}
```

### useRoleManagement

For administrative interfaces that manage roles.

```tsx
const {
  assignRole,       // Assign role to user
  removeRole,       // Remove role from user
  listUsers,        // List users with roles
  listRoles         // List available roles
} = useRoleManagement();
```

#### Example: Role Assignment UI

```tsx
import { useRoleManagement } from '@/hooks/useRoleManagement';
import { useState } from 'react';

function UserRoleManager({ userId }) {
  const [selectedRole, setSelectedRole] = useState('');
  const { assignRole, removeRole, listRoles } = useRoleManagement();
  const [roles, setRoles] = useState([]);
  
  useEffect(() => {
    listRoles().then(setRoles);
  }, []);
  
  const handleAssign = async () => {
    if (selectedRole) {
      await assignRole(userId, selectedRole);
      // Refresh user roles...
    }
  };
  
  return (
    <div className="role-manager">
      <select 
        value={selectedRole} 
        onChange={(e) => setSelectedRole(e.target.value)}
      >
        <option value="">Select role...</option>
        {roles.map(role => (
          <option key={role} value={role}>{role}</option>
        ))}
      </select>
      
      <button onClick={handleAssign}>Assign Role</button>
    </div>
  );
}
```

## Advanced Features

### Role Consistency Checking

```tsx
import { useRBAC } from '@/hooks/useRBAC';

function ProfileSettings() {
  const { performConsistencyCheck } = useRBAC();
  const [result, setResult] = useState(null);
  
  const checkConsistency = async () => {
    const consistencyResult = await performConsistencyCheck();
    setResult(consistencyResult);
  };
  
  return (
    <div>
      <button onClick={checkConsistency}>
        Verify Role Consistency
      </button>
      
      {result && !result.isConsistent && (
        <div className="alert alert-warning">
          Role inconsistency detected!
          <button onClick={() => performConsistencyCheck(true)}>
            Repair
          </button>
        </div>
      )}
    </div>
  );
}
```

### Performance Optimization

```tsx
import { useMemoizedRoleCheck } from '@/utils/performance/selective-rerendering';

// This component will only re-render when role state changes
function AdminOnlyFeature() {
  const isAdmin = useMemoizedRoleCheck('admin');
  
  if (!isAdmin) return null;
  
  return (
    <div className="admin-feature">
      <h2>Admin-Only Feature</h2>
      {/* ... */}
    </div>
  );
}
```

## Best Practices

1. **Combine Role and Permission checks** for complex access control scenarios
2. **Use role-based components** (`RoleBasedGuard`, `RoleProtectedRoute`) for consistency
3. **Always implement server-side checks** in addition to client-side RBAC
4. **Prefer hasAnyRole over multiple hasRole checks** for better readability
5. **Use memoized role checks** for performance-sensitive components
