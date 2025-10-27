
# Database Functions and Triggers Review

## Role Management Functions

### 1. `get_user_roles`
- **Purpose**: Retrieves all roles for a user
- **Implementation**: Security definer function that bypasses RLS
- **Return Type**: `text[]` (array of role names)
- **Issues**: 
  - Only returns role names, not additional permissions
  - Requires separate query for permissions

### 2. `has_role`
- **Purpose**: Checks if a user has a specific role
- **Implementation**: Stable security definer function
- **Return Type**: `boolean`
- **Usage**: Used in RLS policies for permission checking

### 3. `get_primary_role`
- **Purpose**: Determines the primary role for a user based on precedence
- **Implementation**: Security definer function with role precedence logic
- **Return Type**: `text`
- **Notes**: Uses a hardcoded precedence: admin > therapist > patient > support

### 4. `manage_user_role`
- **Purpose**: Assigns or removes roles from users
- **Implementation**: Security definer function with special handling for admin roles
- **Return Type**: `jsonb` with success status and message
- **Issues**: No validation for role conflicts or business rules

## Synchronization Functions

### 1. `sync_user_roles_robust`
- **Purpose**: Trigger function to sync roles between database and auth metadata
- **Implementation**: Updates both profile and user metadata when roles change
- **Issues**: 
  - Error handling could be improved
  - Doesn't guarantee atomicity across both updates

### 2. `auto_sync_user_metadata`
- **Purpose**: Synchronizes user metadata based on role changes
- **Implementation**: Updates profile and auth user metadata with primary role
- **Return Type**: `boolean`
- **Usage**: Called by various trigger functions and manually

### 3. `check_and_repair_user_role_consistency`
- **Purpose**: Checks and optionally repairs role consistency issues
- **Implementation**: Compares database roles with profile and metadata roles
- **Return Type**: `jsonb` with detailed results
- **Issues**: No protection against concurrent repairs

## Triggers

### 1. `on_user_role_change`
- **Purpose**: Triggers role synchronization when roles are changed
- **Implementation**: Calls `auto_sync_user_metadata` after role changes
- **Events**: INSERT, UPDATE, DELETE on user_roles table

### 2. `sync_account_type_from_roles`
- **Purpose**: Alternative trigger for role synchronization
- **Implementation**: Older version with similar functionality to `on_user_role_change`
- **Issues**: Possible overlap with other triggers

## Key Issues

1. **Multiple Synchronization Methods**: Several functions and triggers perform similar synchronization tasks
2. **No Combined Role-Permission Query**: Requires multiple queries to get roles and permissions
3. **Limited Error Handling**: Some functions lack comprehensive error handling
4. **Performance Concerns**: No optimization for repeated role fetching
5. **Lack of Indexing**: Some queries might benefit from additional indexes
6. **No Caching Strategy**: No database-level caching for frequently accessed role data

## Integration Opportunities

1. **Create Combined Data Function**: New function to fetch roles and permissions in a single query
2. **Standardize Synchronization**: Consolidate synchronization functions
3. **Improve Error Handling**: Add better error reporting and recovery
4. **Add Performance Optimizations**: Indexes and query improvements
