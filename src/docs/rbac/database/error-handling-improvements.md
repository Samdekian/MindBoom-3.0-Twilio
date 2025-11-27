
# Database Function Error Handling Improvements

## Current Error Handling Issues

A review of the existing database functions revealed several issues with error handling:

1. **Inconsistent Error Formats**: Different functions return errors in different formats
2. **Limited Error Context**: Most errors lack detailed context for troubleshooting
3. **Silent Failures**: Some functions silently continue after errors
4. **No Transaction Management**: Inconsistent use of transactions leads to partial updates
5. **Error Logging Gaps**: Not all errors are logged to the audit system

## General Error Handling Pattern

We will standardize on the following pattern for all database functions:

```sql
CREATE OR REPLACE FUNCTION function_name(params)
RETURNS return_type
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  -- Declare variables
  v_result return_type;
  v_error TEXT;
  v_context TEXT;
  v_detail TEXT;
BEGIN
  -- Start transaction if needed
  -- BEGIN;
  
  BEGIN
    -- Function logic here
    
    -- Set success result
    -- ...

    -- Commit if in transaction
    -- COMMIT;
    
    RETURN v_result;
  EXCEPTION 
    WHEN OTHERS THEN
      -- Rollback if in transaction
      -- ROLLBACK;
      
      -- Get detailed error information
      GET STACKED DIAGNOSTICS 
        v_error = MESSAGE_TEXT,
        v_context = PG_EXCEPTION_CONTEXT,
        v_detail = PG_EXCEPTION_DETAIL;
      
      -- Log error to audit system
      PERFORM log_database_error(
        'function_name', 
        v_error, 
        jsonb_build_object(
          'context', v_context,
          'detail', v_detail,
          'params', to_jsonb(params)
        )
      );
      
      -- Return error result
      -- ...
      
      RETURN v_result;
  END;
END;
$$;
```

## Error Logging Function

We will create a new function to standardize error logging:

```sql
CREATE OR REPLACE FUNCTION public.log_database_error(
  p_function_name TEXT,
  p_error_message TEXT,
  p_error_context JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    activity_type,
    resource_type,
    resource_id,
    metadata
  ) VALUES (
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    'database_error',
    'database_function',
    p_function_name,
    jsonb_build_object(
      'error_message', p_error_message,
      'timestamp', now(),
      'context', p_error_context
    )
  );
EXCEPTION 
  WHEN OTHERS THEN
    -- Last-resort fallback if even the error logging fails
    -- This ensures the original function can still return a result
    -- even if error logging fails
    NULL;
END;
$$;
```

## Specific Function Updates

### 1. Improve `get_user_roles`

```sql
CREATE OR REPLACE FUNCTION public.get_user_roles(user_id UUID)
RETURNS TEXT[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_roles TEXT[];
  v_error TEXT;
  v_context TEXT;
BEGIN
  BEGIN
    SELECT array_agg(r.name::TEXT)
    INTO v_roles
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = user_id;
    
    -- Handle null case
    IF v_roles IS NULL THEN
      v_roles := ARRAY[]::TEXT[];
    END IF;
    
    RETURN v_roles;
  EXCEPTION 
    WHEN OTHERS THEN
      GET STACKED DIAGNOSTICS 
        v_error = MESSAGE_TEXT,
        v_context = PG_EXCEPTION_CONTEXT;
      
      PERFORM log_database_error(
        'get_user_roles', 
        v_error, 
        jsonb_build_object(
          'context', v_context,
          'user_id', user_id
        )
      );
      
      RETURN ARRAY[]::TEXT[];
  END;
END;
$$;
```

### 2. Improve `manage_user_role`

```sql
CREATE OR REPLACE FUNCTION public.manage_user_role(
  p_user_id UUID,
  p_role_name TEXT,
  p_operation TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role_id UUID;
  v_result JSONB;
  v_error TEXT;
  v_context TEXT;
  v_detail TEXT;
  v_admin_count INTEGER;
BEGIN
  BEGIN
    -- Get role id
    SELECT id INTO v_role_id 
    FROM roles 
    WHERE name = p_role_name::app_role;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Role % not found', p_role_name
        USING ERRCODE = 'RBAC001';
    END IF;
    
    -- Handle different operations
    CASE p_operation
      WHEN 'assign' THEN
        -- Check if the role is already assigned
        IF EXISTS (
          SELECT 1 FROM user_roles 
          WHERE user_id = p_user_id AND role_id = v_role_id
        ) THEN
          v_result := jsonb_build_object(
            'success', true,
            'message', 'Role already assigned',
            'role', p_role_name,
            'user_id', p_user_id,
            'operation', p_operation
          );
        ELSE
          -- Assign role
          INSERT INTO user_roles (user_id, role_id)
          VALUES (p_user_id, v_role_id);
          
          v_result := jsonb_build_object(
            'success', true,
            'message', 'Role assigned successfully',
            'role', p_role_name,
            'user_id', p_user_id,
            'operation', p_operation
          );
        END IF;
        
      WHEN 'remove' THEN
        -- Special handling for admin role
        IF p_role_name = 'admin' THEN
          SELECT COUNT(*) INTO v_admin_count 
          FROM user_roles ur
          JOIN roles r ON ur.role_id = r.id
          WHERE r.name = 'admin';
          
          IF v_admin_count <= 1 AND EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = p_user_id AND r.name = 'admin'
          ) THEN
            RAISE EXCEPTION 'Cannot remove the last admin'
              USING ERRCODE = 'RBAC002';
          END IF;
        END IF;
        
        -- Remove role
        DELETE FROM user_roles
        WHERE user_id = p_user_id AND role_id = v_role_id;
        
        IF FOUND THEN
          v_result := jsonb_build_object(
            'success', true,
            'message', 'Role removed successfully',
            'role', p_role_name,
            'user_id', p_user_id,
            'operation', p_operation
          );
        ELSE
          v_result := jsonb_build_object(
            'success', true,
            'message', 'User did not have the specified role',
            'role', p_role_name,
            'user_id', p_user_id,
            'operation', p_operation
          );
        END IF;
        
      ELSE
        RAISE EXCEPTION 'Invalid operation: %. Must be "assign" or "remove"', p_operation
          USING ERRCODE = 'RBAC003';
    END CASE;
    
    -- Insert audit log
    INSERT INTO audit_logs (
      user_id,
      activity_type,
      resource_type,
      resource_id,
      metadata
    ) VALUES (
      p_user_id,
      CASE p_operation 
        WHEN 'assign' THEN 'role_assigned'
        WHEN 'remove' THEN 'role_removed'
      END,
      'user_roles',
      p_user_id::text,
      jsonb_build_object(
        'role', p_role_name,
        'operation', p_operation,
        'status', 'success'
      )
    );
    
  EXCEPTION 
    WHEN OTHERS THEN
      GET STACKED DIAGNOSTICS 
        v_error = MESSAGE_TEXT,
        v_context = PG_EXCEPTION_CONTEXT,
        v_detail = PG_EXCEPTION_DETAIL;
      
      v_result := jsonb_build_object(
        'success', false,
        'error', v_error,
        'error_code', SQLSTATE,
        'role', p_role_name,
        'user_id', p_user_id,
        'operation', p_operation
      );
      
      -- Log the error
      INSERT INTO audit_logs (
        user_id,
        activity_type,
        resource_type,
        resource_id,
        metadata
      ) VALUES (
        p_user_id,
        'role_operation_error',
        'user_roles',
        p_user_id::text,
        jsonb_build_object(
          'role', p_role_name,
          'operation', p_operation,
          'error', v_error,
          'error_detail', v_detail,
          'error_context', v_context,
          'status', 'error'
        )
      );
  END;
  
  RETURN v_result;
END;
$$;
```

## Benefits of Improved Error Handling

These improvements will provide several benefits:

1. **Standardized Error Format**: All functions will return errors in a consistent format
2. **Better Debugging Information**: More context for troubleshooting issues
3. **Comprehensive Audit Trail**: All errors will be logged for analysis
4. **Error Codes**: Custom error codes for specific error types
5. **Improved Security**: Better error isolation prevents information leakage
6. **Transaction Safety**: Proper transaction handling prevents partial updates
