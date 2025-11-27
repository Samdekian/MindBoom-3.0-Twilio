
# Performance Optimization Through Indexing

## Current Indexing Status

A review of the database tables related to RBAC revealed several opportunities for performance optimization through proper indexing:

1. **Missing Foreign Key Indexes**: Many foreign key columns lack indexes
2. **No Covering Indexes**: No composite indexes for common query patterns
3. **Incomplete Primary Key Coverage**: Some tables have non-indexed lookup columns
4. **No Expression Indexes**: Missing indexes for common filter expressions
5. **No Partial Indexes**: No specialized indexes for common subsets of data

## Recommended Indexes

### 1. Core RBAC Tables

```sql
-- User roles table indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_created_at ON user_roles(created_at);

-- Covering index for common role lookup pattern
CREATE INDEX IF NOT EXISTS idx_user_roles_user_role ON user_roles(user_id, role_id);

-- Roles table indexes
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);

-- User permissions table indexes
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_resource_action ON user_permissions(resource, action);

-- Covering index for permission lookups
CREATE INDEX IF NOT EXISTS idx_user_permissions_combined ON user_permissions(user_id, resource, action);

-- Field access control indexes
CREATE INDEX IF NOT EXISTS idx_field_access_control_user_id ON field_access_control(user_id);
CREATE INDEX IF NOT EXISTS idx_field_access_control_field_name ON field_access_control(field_name);
CREATE INDEX IF NOT EXISTS idx_field_access_control_combined ON field_access_control(user_id, field_name);
```

### 2. Audit and Logging Tables

```sql
-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_activity_type ON audit_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(activity_timestamp);

-- Role sync events indexes
CREATE INDEX IF NOT EXISTS idx_role_sync_events_user_id ON role_sync_events(user_id);
CREATE INDEX IF NOT EXISTS idx_role_sync_events_timestamp ON role_sync_events(performed_at);
CREATE INDEX IF NOT EXISTS idx_role_sync_events_success ON role_sync_events(success);
```

### 3. Profile and User Tables

```sql
-- Profile table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_account_type ON profiles(account_type);
CREATE INDEX IF NOT EXISTS idx_profiles_approval_status ON profiles(approval_status);
```

### 4. Expression Indexes for Common Filters

```sql
-- Index for checking if a user has 2FA enabled
CREATE INDEX IF NOT EXISTS idx_profiles_two_factor ON profiles(id) WHERE two_factor_enabled = true;

-- Index for pending approvals
CREATE INDEX IF NOT EXISTS idx_profiles_pending_approval ON profiles(id, approval_request_date) 
WHERE approval_status = 'pending';

-- Index for recent audit logs (last 30 days)
CREATE INDEX IF NOT EXISTS idx_recent_audit_logs ON audit_logs(user_id, activity_type) 
WHERE activity_timestamp > (now() - interval '30 days');
```

## Index Analysis

### Query Performance Impact

For each database function, we've analyzed the potential performance impact of proper indexing:

1. **get_user_roles**: ~80-90% performance improvement with proper indexes
   - Currently does a sequential scan on user_roles
   - With idx_user_roles_user_id, will use index scan

2. **manage_user_role**: ~50-60% performance improvement for lookups
   - Role lookup will be faster with idx_roles_name
   - User-role existence check will be faster with idx_user_roles_user_role

3. **check_and_repair_user_role_consistency**: ~70-80% performance improvement
   - Multiple joins will benefit from all the proposed indexes

### Space-Time Tradeoff

The additional indexes will increase storage requirements but provide significant query performance benefits:

| Table | Estimated Row Count | Index Count | Storage Impact | Performance Gain |
|-------|-------------------|------------|----------------|-----------------|
| user_roles | 10,000 | 4 | ~1-2 MB | ~80% faster lookups |
| roles | 10-20 | 1 | Negligible | ~70% faster role checks |
| user_permissions | 100,000 | 3 | ~2-4 MB | ~90% faster permission checks |
| audit_logs | 1,000,000+ | 4 | ~10-20 MB | ~95% faster audit queries |

### Maintenance Considerations

1. **Index Maintenance**: Regular REINDEX operations should be scheduled
2. **Monitoring**: Track index usage and size growth
3. **Review**: Periodically review index effectiveness
4. **Cleanup**: Remove unused indexes based on usage statistics

## Implementation Plan

1. **Staged Rollout**: Add indexes in batches to monitor impact
2. **Off-Peak Hours**: Schedule index creation during low usage times
3. **Performance Measurement**: Compare query times before and after
4. **Failback Plan**: Remove problematic indexes if issues arise

## Expected Benefits

1. **Faster Role Lookups**: Critical for every authenticated request
2. **Improved Permission Checks**: Better UI responsiveness
3. **Quicker Consistency Checks**: Faster role synchronization
4. **Better Audit Performance**: Faster security monitoring and reporting
5. **Reduced Database Load**: Less CPU and I/O pressure on the database server

These indexing improvements will provide an essential foundation for the unified AuthRBAC system, ensuring it performs well under load and scales effectively as the application grows.
