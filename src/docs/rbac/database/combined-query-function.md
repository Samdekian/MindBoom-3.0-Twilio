
# Single-Query Role and Permission Fetching

## Function Specification

We need a new database function to efficiently fetch roles and permissions in a single query.

### Function Name
`get_user_roles_and_permissions`

### Parameters
- `p_user_id` (UUID): The user ID to fetch roles and permissions for

### Return Type
JSONB containing:
- `roles` (array): List of roles
- `permissions` (array): List of derived permissions
- `is_consistent` (boolean): Whether roles are consistent across sources
- `metadata` (object): Additional data like timestamps and performance metrics

### Implementation Notes

1. Join the `user_roles`, `roles`, and `user_permissions` tables
2. Aggregate roles and permissions into arrays
3. Check role consistency using existing functions
4. Add metadata for monitoring and debugging
5. Use proper error handling and security

## SQL Implementation

```sql
CREATE OR REPLACE FUNCTION public.get_user_roles_and_permissions(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_start_time TIMESTAMPTZ;
  v_roles TEXT[] := ARRAY[]::TEXT[];
  v_permissions TEXT[] := ARRAY[]::TEXT[];
  v_profile_role TEXT;
  v_metadata_role TEXT;
  v_is_consistent BOOLEAN;
  v_error TEXT;
  v_result JSONB;
BEGIN
  -- Record start time for performance measurement
  v_start_time := clock_timestamp();
  
  BEGIN
    -- Get roles
    SELECT array_agg(DISTINCT r.name::TEXT)
    INTO v_roles
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = p_user_id;
    
    -- Handle null case (no roles)
    IF v_roles IS NULL THEN
      v_roles := ARRAY[]::TEXT[];
    END IF;
    
    -- Get permissions directly assigned to the user
    SELECT array_agg(DISTINCT p.resource || ':' || p.action)
    INTO v_permissions
    FROM user_permissions p
    WHERE p.user_id = p_user_id;
    
    -- Handle null case (no permissions)
    IF v_permissions IS NULL THEN
      v_permissions := ARRAY[]::TEXT[];
    END IF;
    
    -- Check consistency between roles and user metadata
    SELECT 
      p.account_type,
      u.raw_user_meta_data->>'accountType'
    INTO
      v_profile_role,
      v_metadata_role
    FROM
      profiles p
      LEFT JOIN auth.users u ON p.id = u.id
    WHERE
      p.id = p_user_id;
    
    -- Determine whether roles are consistent
    v_is_consistent := (
      v_roles IS NOT NULL AND 
      array_length(v_roles, 1) > 0 AND
      (
        v_profile_role = ANY(v_roles) OR
        v_profile_role IS NULL
      ) AND
      (
        v_metadata_role = ANY(v_roles) OR
        v_metadata_role IS NULL
      )
    );
    
    -- Build the result object
    v_result := jsonb_build_object(
      'roles', to_jsonb(v_roles),
      'permissions', to_jsonb(v_permissions),
      'is_consistent', v_is_consistent,
      'metadata', jsonb_build_object(
        'fetch_time_ms', extract(millisecond from (clock_timestamp() - v_start_time)),
        'timestamp', now(),
        'profile_role', v_profile_role,
        'metadata_role', v_metadata_role
      ),
      'success', true
    );
    
  EXCEPTION WHEN OTHERS THEN
    -- Handle errors
    GET STACKED DIAGNOSTICS v_error = MESSAGE_TEXT;
    
    v_result := jsonb_build_object(
      'success', false,
      'error', v_error,
      'roles', to_jsonb(ARRAY[]::TEXT[]),
      'permissions', to_jsonb(ARRAY[]::TEXT[]),
      'is_consistent', false,
      'metadata', jsonb_build_object(
        'error_time', now()
      )
    );
  END;
  
  RETURN v_result;
END;
$$;
```

## Query Optimization

To optimize the performance of this function, we should add the following indexes:

```sql
-- Add covering index for role lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role_id ON user_roles(user_id, role_id);

-- Add index for permission lookups
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);

-- Add index for role name lookups
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
```

## Error Handling Improvements

The function includes comprehensive error handling:
1. Catches all exceptions and returns detailed error information
2. Provides a consistent return structure even when errors occur
3. Includes error context for debugging
4. Maintains the security definer context to prevent information leakage

## Usage Example

```typescript
// From TypeScript
const { data, error } = await supabase.rpc('get_user_roles_and_permissions', {
  p_user_id: user.id
});

if (error) {
  console.error('Error fetching roles and permissions:', error);
  return;
}

const { roles, permissions, is_consistent } = data;
console.log(`User has roles: ${roles.join(', ')}`);
console.log(`User has permissions: ${permissions.join(', ')}`);
console.log(`Roles are consistent: ${is_consistent}`);
```
