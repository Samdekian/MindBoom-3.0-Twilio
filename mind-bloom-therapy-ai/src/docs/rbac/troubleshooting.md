# RBAC System Troubleshooting Guide

This guide helps you diagnose and fix common issues with the Role-Based Access Control (RBAC) system.

## Common Issues

### Roles Not Loading

**Symptom**: User roles are not loading or appear as an empty array.

**Possible causes**:
1. Authentication issues
2. Database connection problems
3. RPC function errors
4. RLS policies blocking access

**Troubleshooting steps**:

1. Check authentication status:
   ```typescript
   // In your component
   const { user } = useAuth();
   console.log("Auth state:", !!user);
   ```

2. Verify RPC function call:
   ```typescript
   const { data, error } = await supabase.rpc('get_user_roles', { user_id: userId });
   console.log("RPC result:", { data, error });
   ```

3. Check database directly using Supabase dashboard:
   ```sql
   -- Run in SQL editor
   SELECT r.name 
   FROM user_roles ur 
   JOIN roles r ON ur.role_id = r.id 
   WHERE ur.user_id = 'USER_ID_HERE';
   ```

4. Try adding the role manually:
   ```sql
   -- First, get the role ID
   SELECT id FROM roles WHERE name = 'admin';
   
   -- Then insert the user-role mapping
   INSERT INTO user_roles (user_id, role_id) 
   VALUES ('USER_ID_HERE', 'ROLE_ID_HERE');
   ```

### Role Inconsistencies

**Symptom**: Different parts of the system show different roles for the same user.

**Possible causes**:
1. Role synchronization failure
2. Stale data in caches
3. Misconfigured role precedence

**Troubleshooting steps**:

1. Run a consistency check:
   ```typescript
   import { rbacConsistencyChecker } from '@/services/rbac/consistency-checker';
   
   // Log results with detailed info
   const result = await rbacConsistencyChecker.checkUserConsistency(userId, false, true);
   console.log("Consistency result:", result);
   ```

2. Repair inconsistencies:
   ```typescript
   await rbacConsistencyChecker.fixUserConsistency(userId);
   ```

3. Clear role cache:
   ```typescript
   import { roleCache } from '@/utils/rbac/role-cache';
   roleCache.clearRoles(userId);
   ```

4. Refresh RBAC context:
   ```typescript
   const { refreshRoles } = useRBAC();
   await refreshRoles();
   ```

### Permission Checks Failing

**Symptom**: Permission checks return false even though the user should have access.

**Possible causes**:
1. Permissions not properly mapped to roles
2. Incorrect permission format in checks
3. Resource or action name mismatch

**Troubleshooting steps**:

1. Check user permissions in database:
   ```sql
   -- Run in SQL editor
   SELECT * FROM user_permissions
   WHERE user_id = 'USER_ID_HERE';
   ```

2. Verify permission format:
   ```typescript
   // Correct permission format
   const permission = {
     resource: 'dashboard',
     action: 'view',
     level: 'read',
     name: 'View Dashboard',
     description: 'Can view the dashboard',
     category: 'general'
   };
   ```

3. Debug permission check:
   ```typescript
   const { checkPermissions } = usePermission();
   
   console.log("Checking permission:", permission);
   const result = checkPermissions([permission]);
   console.log("Permission result:", result);
   ```

4. Verify role-permission mapping:
   ```sql
   -- Check role permissions for a specific resource
   SELECT r.name as role, up.resource, up.action, up.level
   FROM user_roles ur
   JOIN roles r ON ur.role_id = r.id
   JOIN user_permissions up ON ur.user_id = up.user_id
   WHERE ur.user_id = 'USER_ID_HERE'
   AND up.resource = 'dashboard';
   ```

### Field Access Control Issues

**Symptom**: Field access control settings (readonly, hidden, mask) not applying correctly.

**Possible causes**:
1. Missing field access control entries
2. Incorrect field name format
3. Component not using access control correctly

**Troubleshooting steps**:

1. Check field access entries:
   ```sql
   -- Run in SQL editor
   SELECT * FROM field_access_control
   WHERE user_id = 'USER_ID_HERE'
   AND field_name = 'patient.medical';
   ```

2. Verify field access retrieval:
   ```typescript
   const { getFieldAccess } = usePermission();
   const access = getFieldAccess('patient.medical');
   console.log("Field access:", access);
   ```

3. Ensure component is using field access correctly:
   ```tsx
   const { getFieldAccess } = usePermission();
   const { readOnly, hidden, mask } = getFieldAccess('patient.medical');
   
   if (hidden) return null;
   
   return (
     <input 
       type="text" 
       readOnly={readOnly}
       value={mask ? '********' : value} 
     />
   );
   ```

4. Add a field access control entry manually:
   ```sql
   INSERT INTO field_access_control (user_id, field_name, read_only, hidden, mask)
   VALUES ('USER_ID_HERE', 'patient.medical', true, false, false);
   ```

### RBAC Security Alerts

**Symptom**: Security alerts are being triggered for legitimate operations.

**Possible causes**:
1. Overly restrictive security rules
2. Rate limiting thresholds too low
3. Incorrect monitoring configuration

**Troubleshooting steps**:

1. Check security alert logs:
   ```sql
   -- Run in SQL editor
   SELECT * FROM audit_logs
   WHERE activity_type LIKE '%security%'
   ORDER BY activity_timestamp DESC
   LIMIT 20;
   ```

2. Adjust rate limiter thresholds:
   ```typescript
   import { rbacRateLimiter } from '@/utils/rbac/rate-limiter';
   
   // Increase thresholds
   rbacRateLimiter.updateThreshold('role-assign', {
     maxAttempts: 10,
     windowSeconds: 60
   });
   ```

3. Disable security monitoring temporarily (development only):
   ```typescript
   // In development environments only
   if (process.env.NODE_ENV === 'development') {
     // Mock security monitor
     vi.mock('@/services/rbac/security-monitor', () => ({
       rbacSecurityMonitor: {
         monitorRoleAssignment: vi.fn().mockResolvedValue(false),
         // other methods...
       }
     }));
   }
   ```

## Diagnostic Tools

### Role Troubleshooter

The Role Troubleshooter component can be added to your development environment:

```tsx
import RoleTroubleshooter from '@/components/auth/RoleTroubleshooter';

// Add to your component
<RoleTroubleshooter />
```

### RBAC Testing Dashboard

For thorough testing:

```tsx
import { useRbacTesting } from '@/hooks/use-rbac-testing';

function RBACTestingDashboard() {
  const { 
    runRouteTests, 
    runOperationTests, 
    runSecurityAudit 
  } = useRbacTesting();
  
  return (
    <div>
      <button onClick={runRouteTests}>Test Route Access</button>
      <button onClick={runOperationTests}>Test Operations</button>
      <button onClick={runSecurityAudit}>Run Security Audit</button>
      {/* Display results */}
    </div>
  );
}
```

### Console Debugging Commands

For debugging in the browser console:

```javascript
// Check user roles
await (async () => {
  const { data } = await supabase.rpc('get_user_roles', { user_id: 'USER_ID_HERE' });
  console.log('User roles:', data);
})();

// Check role consistency
await (async () => {
  const { data } = await supabase.rpc('check_and_repair_user_role_consistency', { 
    p_user_id: 'USER_ID_HERE', 
    p_auto_repair: false 
  });
  console.log('Consistency check:', data);
})();

// Run manual role sync
await (async () => {
  const { data } = await supabase.rpc('sync_user_roles', { user_id: 'USER_ID_HERE' });
  console.log('Sync result:', data);
})();
```

## Performance Troubleshooting

### Slow Loading Times

**Symptom**: RBAC operations are taking a long time to complete.

**Possible causes**:
1. Missing database indexes
2. Inefficient queries
3. Role cache issues
4. Too many database calls

**Troubleshooting steps**:

1. Add performance logging:
   ```typescript
   console.time('RBAC operation');
   await rbacOperation();
   console.timeEnd('RBAC operation');
   ```

2. Check for missing indexes:
   ```sql
   -- Add index for user_roles
   CREATE INDEX IF NOT EXISTS idx_user_roles_user_id
   ON user_roles(user_id);
   
   -- Add index for user_permissions
   CREATE INDEX IF NOT EXISTS idx_user_permissions_user_resource
   ON user_permissions(user_id, resource);
   ```

3. Optimize role fetching:
   ```typescript
   // Use caching for expensive operations
   import memoize from 'lodash/memoize';
   
   const getUserRolesMemo = memoize(async (userId) => {
     const { data } = await safeRpcCall<string[]>('get_user_roles', { user_id: userId });
     return data || [];
   }, userId => userId);
   ```

4. Batch related operations:
   ```typescript
   // Instead of multiple separate fetches
   const [rolesResult, permissionsResult] = await Promise.all([
     fetchRoles(),
     fetchPermissions()
   ]);
   ```

## System Recovery

### Reset Role Data

If you need to completely reset RBAC data for a user:

```sql
-- Warning: This will delete all role assignments for the user
DELETE FROM user_roles WHERE user_id = 'USER_ID_HERE';

-- Assign default role
INSERT INTO user_roles (user_id, role_id)
SELECT 'USER_ID_HERE', id FROM roles WHERE name = 'patient';

-- Trigger role synchronization
SELECT sync_user_roles('USER_ID_HERE');
```

### Rebuild Role Cache

To completely rebuild the role cache:

```typescript
import { roleCache } from '@/utils/rbac/role-cache';

// Clear entire cache
roleCache.clearAll();

// Force refresh for all visible users
const visibleUsers = ['user1', 'user2']; // Get from your user list
await Promise.all(visibleUsers.map(async userId => {
  const { data } = await safeRpcCall<string[]>('get_user_roles', { user_id: userId });
  // Cache will be automatically rebuilt on next access
}));
```

## Getting Additional Help

If you've tried all the troubleshooting steps and still have issues:

1. Check the [RBAC System Documentation](./rbac-system.md) for more information
2. Review the [API Reference](./api-reference.md) for proper usage patterns
3. Look for similar issues in the issue tracker
4. Contact the development team with the following information:
   - Exact steps to reproduce
   - Error messages and stack traces
   - User ID experiencing the issue
   - Database logs if available
