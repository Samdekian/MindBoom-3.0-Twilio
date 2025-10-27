
# Database Functions Review for Role Management

## Current Function Analysis

### Strengths

1. **Security-First Design**: Most functions use SECURITY DEFINER to safely bypass RLS
2. **Role Precedence Logic**: Clear hierarchy for determining primary role
3. **Audit Logging**: Many functions include audit trail creation
4. **Transaction Support**: Critical operations use transactions
5. **Error Capture**: Most functions capture and log errors

### Weaknesses

1. **Separate Queries**: Roles and permissions require multiple queries
2. **Limited Error Information**: Some errors lack detailed context
3. **No Performance Optimization**: Missing indexes on frequently queried columns
4. **Redundant Functions**: Multiple functions with overlapping functionality
5. **Inconsistent Return Types**: Mix of different return formats
6. **Limited Validation**: Minimal validation of inputs and business rules

## Critical Functions for Optimization

### `get_user_roles`

```sql
CREATE OR REPLACE FUNCTION public.get_user_roles(user_id UUID)
RETURNS TEXT[]
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT array_agg(r.name::TEXT)
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = user_id;
$$;
```

**Improvement opportunities:**
- Add support for returning permissions alongside roles
- Add timeout handling for long-running queries
- Implement result caching for frequently accessed users

### `check_and_repair_user_role_consistency`

**Improvement opportunities:**
- Add more detailed error reporting
- Implement row locking to prevent concurrent repairs
- Add transaction support for atomic repairs
- Return more detailed repair information

## Performance Analysis

### Query Performance

The current functions have not been optimized for repeated role fetching. Key observations:

1. **Missing Indexes**: No covering indexes for common query patterns
2. **No Result Caching**: Every call hits the database directly
3. **Sequential Scans**: Some operations might use sequential scans on larger tables
4. **Multiple Joins**: Some operations require multiple joins without optimization

### Execution Plans

Based on analysis of likely execution plans:

1. `get_user_roles` - Could benefit from a covering index on `user_roles(user_id, role_id)`
2. `has_role` - Currently performs a sequential scan on small tables, acceptable for now
3. `get_primary_role` - Requires multiple joins that could be optimized

## Recommended Improvements

1. **Create Combined Roles and Permissions Function**:
   - Single query to fetch both roles and related permissions
   - Return JSON structure with all needed data
   - Use proper indexing for performance

2. **Optimize Existing Functions**:
   - Add covering indexes for common query patterns
   - Implement proper error handling with context
   - Add better transaction support

3. **Standardize Return Types**:
   - Use consistent JSON structures for returns
   - Include standard fields for status, message, and data
   - Ensure proper error information is included

4. **Implement Function-Based Caching**:
   - Add timestamp-based invalidation
   - Use temporary tables for frequent access patterns
   - Implement materialized views for complex aggregations
