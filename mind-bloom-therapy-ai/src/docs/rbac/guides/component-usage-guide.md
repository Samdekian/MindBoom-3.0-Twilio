
# RBAC Component Usage Guide

This guide demonstrates how to use the RBAC components effectively in your application.

## Core Components

### RoleBasedGuard

Controls rendering based on user roles.

```tsx
import { RoleBasedGuard } from '@/components/RoleBasedGuard';

<RoleBasedGuard 
  allowedRoles={['admin', 'therapist']}
  fallback={<AccessDeniedMessage />}
>
  <ProtectedContent />
</RoleBasedGuard>
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `allowedRoles` | `string[]` | Roles that can access the content |
| `permissions?` | `Permission[]` | Optional permissions required |
| `requireAll?` | `boolean` | If true, requires all roles instead of any |
| `fallback?` | `ReactNode` | Component to show if access denied |
| `showLoading?` | `boolean` | Whether to show loading state |
| `children` | `ReactNode` | Protected content |

### RoleProtectedRoute

Protects routes based on user roles.

```tsx
import RoleProtectedRoute from '@/components/RoleProtectedRoute';

<Route 
  path="/admin" 
  element={
    <RoleProtectedRoute 
      allowedRoles={['admin']} 
      redirectPath="/access-denied"
    >
      <AdminPage />
    </RoleProtectedRoute>
  } 
/>
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `allowedRoles` | `string[]` | Roles that can access the route |
| `permissions?` | `Permission[]` | Optional permissions required |
| `redirectPath?` | `string` | Where to redirect if access denied |
| `requireAll?` | `boolean` | If true, requires all roles instead of any |
| `children` | `ReactNode` | Protected route content |

### RoleBasedField

Controls field-level access based on user roles.

```tsx
import RoleBasedField from '@/components/RoleBasedField';

<form>
  <div className="form-group">
    <label>Patient Name</label>
    <input type="text" name="name" />
  </div>
  
  <RoleBasedField
    fieldName="patient.diagnosis"
    allowedRoles={['therapist', 'admin']}
    readOnlyRoles={['support']}
    hiddenRoles={['patient']}
  >
    <div className="form-group">
      <label>Diagnosis</label>
      <textarea name="diagnosis" />
    </div>
  </RoleBasedField>
</form>
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `fieldName` | `string` | Identifier for the field |
| `allowedRoles?` | `string[]` | Roles that can edit the field |
| `readOnlyRoles?` | `string[]` | Roles that can only view the field |
| `hiddenRoles?` | `string[]` | Roles that cannot see the field |
| `children` | `ReactNode` | Field content |

## Admin Components

### EnhancedRoleManagement

Complete UI for managing user roles.

```tsx
import EnhancedRoleManagement from '@/components/admin/EnhancedRoleManagement';

<EnhancedRoleManagement showFilters pageSize={10} />
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `showFilters?` | `boolean` | Show filtering controls |
| `pageSize?` | `number` | Number of users per page |
| `className?` | `string` | CSS class for styling |

### RoleConsistencySection

Shows role consistency status information.

```tsx
import { RoleConsistencySection } from '@/components/admin/rbac-dashboard/RoleConsistencySection';

<RoleConsistencySection autoRefresh showControls />
```

## Navigation Components

### RoleBasedNavItem

Navigation item with role-based visibility.

```tsx
import { RoleBasedNavItem } from '@/components/RoleBasedNavItem';

<nav className="sidebar">
  <RoleBasedNavItem allowedRoles={['admin', 'therapist']}>
    Dashboard
  </RoleBasedNavItem>
  
  <RoleBasedNavItem allowedRoles={['admin']}>
    System Settings
  </RoleBasedNavItem>
</nav>
```

### RoleBasedNavLink

Navigation link with role-based access control.

```tsx
import { RoleBasedNavLink } from '@/components/RoleBasedNavLink';

<RoleBasedNavLink
  to="/admin-panel"
  allowedRoles={['admin']}
  showIfDisallowed={true}
  disabledTooltip="Admin access required"
>
  Admin Panel
</RoleBasedNavLink>
```

## Troubleshooting Components

### RoleTroubleshooter

Interactive tool for diagnosing role issues.

```tsx
import RoleTroubleshooter from '@/components/auth/RoleTroubleshooter';

<RoleTroubleshooter userId={currentUser.id} autoRun={false} />
```

## Component Composition Patterns

### Forms with Field-Level Control

```tsx
import RoleBasedField from '@/components/RoleBasedField';

function PatientForm({ patient, onSubmit }) {
  return (
    <form onSubmit={onSubmit}>
      <div className="form-group">
        <label>Name</label>
        <input 
          type="text" 
          name="name" 
          defaultValue={patient.name} 
        />
      </div>
      
      <RoleBasedField
        fieldName="patient.email"
        readOnlyRoles={['support']}
      >
        <div className="form-group">
          <label>Email</label>
          <input 
            type="email" 
            name="email" 
            defaultValue={patient.email} 
          />
        </div>
      </RoleBasedField>
      
      <RoleBasedField
        fieldName="patient.diagnosis"
        allowedRoles={['therapist', 'admin']}
        hiddenRoles={['patient', 'support']}
      >
        <div className="form-group">
          <label>Diagnosis</label>
          <textarea 
            name="diagnosis" 
            defaultValue={patient.diagnosis} 
          />
        </div>
      </RoleBasedField>
      
      <RoleBasedGuard allowedRoles={['therapist', 'admin']}>
        <button type="submit">Save Changes</button>
      </RoleBasedGuard>
    </form>
  );
}
```

### Nested Role-Based Components

```tsx
import { RoleBasedGuard } from '@/components/RoleBasedGuard';
import RoleBasedField from '@/components/RoleBasedField';

function ComplexAdminPanel() {
  return (
    <RoleBasedGuard allowedRoles={['admin']}>
      <div className="admin-panel">
        <h2>Admin Settings</h2>
        
        <RoleBasedGuard 
          allowedRoles={['admin']} 
          permissions={[{ resource: 'system', action: 'configure' }]}
          requireAll={true}
        >
          <div className="system-config">
            <h3>System Configuration</h3>
            
            <RoleBasedField
              fieldName="system.security.level"
              allowedRoles={['admin']}
            >
              <div className="form-group">
                <label>Security Level</label>
                <select name="securityLevel">
                  <option value="basic">Basic</option>
                  <option value="enhanced">Enhanced</option>
                  <option value="maximum">Maximum</option>
                </select>
              </div>
            </RoleBasedField>
          </div>
        </RoleBasedGuard>
      </div>
    </RoleBasedGuard>
  );
}
```

## Best Practices

1. **Use the most specific component** for your needs
2. **Avoid over-nesting role guards** to prevent unnecessary renders
3. **Provide meaningful fallback content** for better UX
4. **Use fieldName consistently** across your application
5. **Combine with data fetching** to load only necessary data
