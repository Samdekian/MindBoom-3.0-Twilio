# RBAC System Developer Guide

## Introduction

This guide provides technical documentation for developers who need to work with or extend the Role-Based Access Control (RBAC) system. It covers implementation details, APIs, component usage, and extension patterns.

## Core Architecture

The RBAC system follows a layered architecture:

1. **Data Layer**:
   - User roles stored in the `user_roles` table
   - Permissions defined in code and configuration
   - Role history tracked in audit logs

2. **Service Layer**:
   - `role-service.ts`: Core functions for role management
   - `permission-service.ts`: Permission definition and checking
   - `role-sync-service.ts`: Background synchronization service

3. **Hook Layer**:
   - `useRBAC()`: Primary hook for role-based checks
   - `usePermission()`: Hook for permission-based checks
   - Supporting hooks for role management and monitoring

4. **Component Layer**:
   - Guard components for conditional rendering
   - Field components for form access control
   - Navigation components for menu control

## Key APIs

### useRBAC Hook

```tsx
const { 
  roles,            // Array of user roles
  isLoading,        // Boolean loading state
  hasRole,          // Function to check if user has a specific role
  hasAnyRole,       // Function to check if user has any of the specified roles
  hasAllRoles,      // Function to check if user has all specified roles
  refresh,          // Function to refresh roles
  autoRepair,       // Boolean flag for auto-repairing role inconsistencies
  setAutoRepair,    // Function to toggle auto-repair
  hasMismatch       // Boolean indicating role inconsistency
} = useRBAC();
```

### usePermission Hook

```tsx
const { 
  permissions,       // Array of user permissions
  isLoading,         // Boolean loading state
  hasPermission,     // Function to check for specific permission
  checkPermissions,  // Function to check multiple permissions
  getFieldAccess     // Function to get field access options
} = usePermission();
```

### Component Props

#### RoleBasedGuard

```tsx
<RoleBasedGuard
  allowedRoles={['admin', 'therapist']}  // Required roles
  permissions={[                          // Required permissions
    { resource: 'patients', action: 'view', level: 'read' }
  ]}
  requireAll={false}                      // Require all roles/permissions or just any
  requireAllPermissions={true}            // Specific for permissions
  fallback={<AccessDenied />}             // Component to show if access denied
  showLoading={true}                      // Show loading state
  className="my-guard"                    // CSS class
  description="Admin only content"        // Description for access denied message
>
  {/* Protected content */}
</RoleBasedGuard>
```

#### RoleBasedField

```tsx
<RoleBasedField
  fieldName="patient.notes"               // Field identifier
  allowedRoles={['admin', 'therapist']}   // Roles that can see this field
  readOnlyRoles={['support']}             // Roles that can only read this field
  hiddenRoles={['patient']}               // Roles that cannot see this field
  requireAll={false}                      // Require all specified roles
  className="my-field"                    // CSS class
>
  <textarea name="notes" />
</RoleBasedField>
```

## Extending the System

### Adding New Roles

1. Update the `UserRole` type in `src/utils/rbac/types.ts`:

```typescript
export type UserRole = 'admin' | 'therapist' | 'patient' | 'support' | 'new-role';
```

2. Update any role configurations in relevant services

### Adding New Permissions

1. Define new permissions in `src/services/permissions-service.ts`:

```typescript
export const defaultPermissions: Permission[] = [
  // Existing permissions...
  {
    id: 'new-feature-view',
    name: 'View New Feature',
    description: 'Allows viewing the new feature',
    category: 'features',
    level: 'read'
  },
  // More new permissions...
];
```

2. Assign these permissions to roles in your permission configuration

### Creating Custom RBAC Components

Custom components can be created by composing the existing RBAC components:

```tsx
const RoleBasedButton: React.FC<RoleBasedButtonProps> = ({
  allowedRoles,
  children,
  ...buttonProps
}) => {
  return (
    <RoleBasedGuard allowedRoles={allowedRoles}>
      <Button {...buttonProps}>{children}</Button>
    </RoleBasedGuard>
  );
};
```

## Testing

### Mocking RBAC in Tests

```tsx
// Mock the RBAC hooks
jest.mock('@/hooks/useRBAC', () => ({
  useRBAC: jest.fn().mockReturnValue({
    isLoading: false,
    hasRole: jest.fn().mockImplementation(role => role === 'admin'),
    hasAnyRole: jest.fn().mockImplementation(roles => roles.includes('admin')),
    hasAllRoles: jest.fn().mockReturnValue(false),
    roles: ['admin'],
  }),
}));

// Use in tests
it('shows admin content when user is admin', () => {
  render(<AdminComponent />);
  expect(screen.getByText('Admin Content')).toBeInTheDocument();
});
```

### Testing Role-Based Components

```tsx
it('conditionally renders based on roles', () => {
  // Setup for admin user
  (useRBAC as jest.Mock).mockReturnValue({
    isLoading: false,
    hasAnyRole: jest.fn().mockReturnValue(true),
    roles: ['admin'],
  });

  const { rerender } = render(
    <RoleBasedGuard allowedRoles={['admin']}>
      <div data-testid="admin-content">Admin Content</div>
    </RoleBasedGuard>
  );
  
  expect(screen.getByTestId('admin-content')).toBeInTheDocument();
  
  // Change to non-admin user
  (useRBAC as jest.Mock).mockReturnValue({
    isLoading: false,
    hasAnyRole: jest.fn().mockReturnValue(false),
    roles: ['patient'],
  });
  
  rerender(
    <RoleBasedGuard allowedRoles={['admin']}>
      <div data-testid="admin-content">Admin Content</div>
    </RoleBasedGuard>
  );
  
  expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
});
```

## Performance Optimizations

### Role Caching

The system uses a role cache to minimize database queries:

```typescript
// To customize cache behavior
import { roleCache } from '@/utils/rbac/role-cache';

// Configure cache TTL
roleCache.setTTL(300); // 5 minutes

// Clear cache for a user
roleCache.clearRoles(userId);

// Clear entire cache
roleCache.clearAll();
```

### Permission Computation

For complex permission checks, use memoization:

```typescript
const memoizedPermissionCheck = useMemo(() => {
  return checkPermissions(requiredPermissions, { requireAll: true });
}, [requiredPermissions, checkPermissions]);
```

## Security Considerations

### Client-Side vs. Server-Side Checks

Always remember that client-side RBAC checks are for UI purposes only. All sensitive operations must also be protected server-side:

```typescript
// Server-side RLS policy example
create policy "Users can only update their own data"
on users
for update
using (auth.uid() = id);
```

### Debug Logging

In production environments, be careful not to expose sensitive role information in logs or error messages. Use the `process.env.NODE_ENV` check:

```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('User roles:', roles);
}
```

## Further Resources

- [API Reference](./api-reference.md)
- [Component Catalog](./component-catalog.md)
- [Migration Guide](./migration-guide.md)
- [FAQ](./faq.md)
