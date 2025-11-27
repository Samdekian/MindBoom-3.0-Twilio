
# RBAC Troubleshooting Guide

This guide helps developers solve common issues with the RBAC system.

## Common Issues and Solutions

### Roles Not Loading

**Symptoms:**
- RBAC hooks return empty role arrays
- All role checks return false
- "Loading" state persists indefinitely

**Possible Causes:**
1. Authentication issues
2. Database connection problems
3. Role assignments missing
4. RLS policies blocking access

**Solutions:**

1. **Verify Authentication**
```tsx
// Check if the user is authenticated
const { user } = useAuth();
console.log("Auth state:", !!user, user?.id);
```

2. **Check Database Connection**
```tsx
// Test database connection with a simple query
const { data, error } = await supabase.from('roles').select('name').limit(1);
console.log("DB connection test:", { data, error });
```

3. **Verify Role Assignments**
```tsx
// Check if the user has any roles assigned
const { data, error } = await supabase
  .from('user_roles')
  .select('role_id')
  .eq('user_id', userId);
console.log("User roles:", { data, error });
```

4. **Test RLS Policies**
```tsx
// Bypass RLS to check if roles exist
const { data, error } = await supabase.rpc('get_user_roles', { user_id: userId });
console.log("User roles via RPC:", { data, error });
```

5. **Fix Missing Roles**
```tsx
// Assign a role to the user if missing
const { error } = await supabase.rpc('manage_user_role', {
  p_user_id: userId,
  p_role_name: 'patient', // Default role
  p_operation: 'assign'
});
```

### Role Inconsistency Issues

**Symptoms:**
- Different components show different roles for the same user
- Some features work while others don't
- Inconsistent behavior after role changes

**Possible Causes:**
1. Role caching issues
2. Race conditions in role updates
3. Inconsistency between database and auth metadata

**Solutions:**

1. **Force Refresh Roles**
```tsx
// In your component
const { refreshRoles } = useRBAC();
await refreshRoles();
```

2. **Check Role Consistency**
```tsx
// Perform a consistency check
const { isConsistent, primaryRole } = await checkAndRepairUserRoleConsistencyOptimized(userId);
console.log("Role consistency:", { isConsistent, primaryRole });
```

3. **Repair Inconsistencies**
```tsx
// Auto-repair role inconsistencies
await checkAndRepairUserRoleConsistencyOptimized(userId, true);
```

4. **Clear Role Cache**
```tsx
// Import the cache manager
import { roleCacheManager } from '@/utils/rbac/role-cache-manager';

// Clear cache for specific user
roleCacheManager.clearUserRoles(userId);

// Or clear the entire cache in extreme cases
roleCacheManager.clearAll();
```

### Permission Issues

**Symptoms:**
- User has correct roles but specific features still don't work
- Permission-based components don't render properly
- Features work inconsistently based on how they're accessed

**Possible Causes:**
1. Missing or incorrect permission mappings
2. Incorrect permission formats
3. Resources or actions don't match

**Solutions:**

1. **Check User Permissions**
```tsx
// Log all user permissions
const { permissions } = usePermission();
console.log("User permissions:", permissions);
```

2. **Verify Permission Format**
```tsx
// Make sure permission objects have the correct format
const requiredPermission = {
  resource: 'patient',
  action: 'view',
  name: 'View Patient Records', // Optional but helpful
  level: 'read' // The access level
};
```

3. **Debug Permission Checks**
```tsx
// Log detailed permission check results
const { checkPermissions } = usePermission();
const result = checkPermissions([
  { resource: 'patient', action: 'view' }
]);
console.log("Permission check result:", result);
```

4. **Fix Permission Mappings**
```tsx
// Example of how to update role-permission mappings in the database
// (This would usually be done through an admin interface)
await supabase
  .from('role_permissions')
  .insert({
    role_id: roleId, // The ID of the role
    permission_id: permissionId // The ID of the permission
  });
```

### Component Issues

**Symptoms:**
- Role-based components render incorrectly
- Protected routes redirect unexpectedly
- Form fields don't respect role-based access

**Possible Causes:**
1. Incorrect role names in component props
2. Role hooks not initialized properly
3. Component props mismatch with hook return values

**Solutions:**

1. **Check Role Names**
```tsx
// Make sure role names match exactly what's in the database
<RoleBasedGuard allowedRoles={['admin']} /> // Correct
<RoleBasedGuard allowedRoles={['Admin']} /> // Incorrect (case sensitive)
```

2. **Verify Hook Usage**
```tsx
// Ensure the RBAC hook is used correctly
function MyComponent() {
  const { hasRole, isLoading } = useRBAC();
  
  // Handle loading state properly
  if (isLoading) return <LoadingSpinner />;
  
  return hasRole('admin') ? <AdminPanel /> : <RegularView />;
}
```

3. **Debug Component Props**
```tsx
// Add debug logging to check component props
<RoleBasedGuard
  allowedRoles={['admin']}
  onRender={(allowed) => console.log("Render decision:", allowed)}
>
  <AdminContent />
</RoleBasedGuard>
```

### Debugging Tools

#### Role Troubleshooter Component

If you're experiencing persistent RBAC issues, use the `RoleTroubleshooter` component:

```tsx
import RoleTroubleshooter from '@/components/auth/RoleTroubleshooter';

// Add to your development environment
<RoleTroubleshooter userId={currentUser.id} autoRun />
```

#### Console Debugging Commands

Useful commands to run in the browser console:

```javascript
// Check current RBAC state
(async function() {
  const { roles, permissions } = await window.__RBAC_DEBUG__.getCurrentState();
  console.table(roles);
  console.table(permissions);
})();

// Force refresh roles
(async function() {
  const result = await window.__RBAC_DEBUG__.refreshRoles();
  console.log("Refresh result:", result);
})();

// Check role consistency
(async function() {
  const result = await window.__RBAC_DEBUG__.checkConsistency(true);
  console.log("Consistency check:", result);
})();
```

### Performance Troubleshooting

**Symptoms:**
- Role checks are slow
- UI feels laggy when rendering role-based components
- Multiple database calls observed for the same role check

**Possible Causes:**
1. Too many parallel role checks
2. Missing caching
3. Inefficient rendering

**Solutions:**

1. **Implement Batch Loading**
```tsx
// Load roles for multiple users at once
const userIds = ['user1', 'user2', 'user3'];
const rolesByUser = await batchLoadUserRoles(userIds);
console.log("Batch loaded roles:", rolesByUser);
```

2. **Use Memoized Role Checks**
```tsx
import { useMemoizedRoleCheck } from '@/utils/performance/selective-rerendering';

function AdminButton() {
  // This is a memoized check that doesn't cause re-renders
  const isAdmin = useMemoizedRoleCheck('admin');
  
  if (!isAdmin) return null;
  
  return <button>Admin Action</button>;
}
```

3. **Wrap Components with withMemoizedRoles**
```tsx
import { withMemoizedRoles } from '@/utils/performance/selective-rerendering';

const MemoUserPanel = withMemoizedRoles(UserPanel, {
  // Specify dependencies on roles to control re-rendering
  roles: ['admin', 'therapist']
});
```

## Escalation Process

If you're still experiencing issues after trying the solutions above:

1. **Generate a Diagnostic Report**
```tsx
// Use the troubleshooter to generate a complete report
const report = await generateRBACDiagnosticReport(userId);
console.log(report); // Log or save this for the support team
```

2. **Contact Support** with:
   - The diagnostic report
   - Steps to reproduce the issue
   - Expected vs. actual behavior
   - Environment information (browser, device, etc.)

## Prevention Best Practices

1. **Always implement server-side role checks** to complement client-side RBAC
2. **Use RLS policies** to enforce data access at the database level
3. **Set up monitoring** to detect role inconsistencies
4. **Regularly audit role assignments** to ensure users have the correct access
5. **Test role changes thoroughly** before deploying to production
