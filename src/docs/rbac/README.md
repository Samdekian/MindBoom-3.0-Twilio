
# Role-Based Access Control (RBAC) System

## Overview

This document provides a comprehensive overview of the Role-Based Access Control (RBAC) system implemented in the application. The RBAC system secures access to routes, UI elements, and operations based on user roles and permissions.

## System Architecture

The RBAC system consists of several layers:

1. **Core RBAC Layer**: Basic role management and checking
2. **Permission Layer**: Fine-grained permission management on top of roles
3. **UI Component Layer**: Role-aware components that conditionally render based on permissions
4. **Route Protection Layer**: Guards for protecting routes based on roles and permissions
5. **Form Control Layer**: Special handling for form fields based on permissions

## Key Components

### Core Hooks

- `useRBAC`: Provides role information and checking functions
- `usePermission`: Provides permission checking based on resources and actions

### UI Components

- `RoleBasedGuard`: Conditionally renders children based on role requirements
- `RoleProtectedRoute`: Route-level protection with redirection capability
- `RoleBasedContainer`: Container component with role-based visibility
- `RoleBasedNavItem`: Navigation item with role-based visibility
- `RoleBasedNavLink`: Navigation link with role-based activation
- `RoleBasedField`: Form field with role-based access control (read/write/hidden)
- `PermissionField`: Form field with attribute-based access control

## Usage Examples

### Protecting Routes

```tsx
<RoleProtectedRoute allowedRoles={['admin', 'therapist']} redirectPath="/dashboard">
  <AdminPanel />
</RoleProtectedRoute>
```

### Role-Based UI Elements

```tsx
<RoleBasedGuard allowedRoles={['admin']}>
  <AdminControls />
</RoleBasedGuard>
```

### Form Field Control

```tsx
<RoleBasedField 
  fieldName="patient.diagnosis" 
  allowedRoles={['therapist', 'admin']} 
  readOnlyRoles={['support']}
>
  <textarea name="diagnosis" />
</RoleBasedField>
```

### Navigation Elements

```tsx
<RoleBasedNavLink
  to="/admin-panel"
  allowedRoles={['admin']}
  showIfDisallowed={true}
>
  Admin Panel
</RoleBasedNavLink>
```

## Extending the System

The RBAC system is designed to be extensible. New role types can be added to the `UserRole` type, and new permission resources and actions can be defined in the permission service.

## Performance Considerations

The RBAC system uses caching mechanisms to reduce the number of database queries required for role checks. Role fetching is performed upon initial load, and can be manually refreshed when needed.

## Security Best Practices

1. Always implement RBAC checks both on the client and server side
2. Use role synchronization to ensure consistency between user metadata and role assignments
3. Regularly audit role assignments and permission grants
4. Implement the principle of least privilege - assign the minimum permissions necessary

## Troubleshooting

See the [Troubleshooting Guide](./troubleshooting.md) for common issues and solutions related to the RBAC system.
