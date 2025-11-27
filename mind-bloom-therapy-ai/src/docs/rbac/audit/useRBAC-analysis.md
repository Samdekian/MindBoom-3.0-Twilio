
# useRBAC Hook Analysis

## Current Implementation

The `useRBAC` hook is implemented in `src/hooks/useRBAC.ts` and handles role-based access control independently from the authentication context.

### State Management
- Maintains `roles`, `isLoading`, `error`, and `autoRepair` states
- Fetches actual roles from the database using Supabase RPC calls

### Role Fetching Flow
1. When the hook mounts and a user is authenticated, it calls `fetchRoles` with the user ID
2. Uses `supabase.rpc("get_user_roles", { user_id: userId })` to fetch roles from the database
3. Updates the local state with the fetched roles
4. Provides helper functions for role checking: `hasRole`, `hasAnyRole`, and `hasAllRoles`

### Key Functionality
- `refreshRoles`: Re-fetches roles from the database
- `performConsistencyCheck`: Verifies and optionally repairs role consistency
- `hasRole`: Checks if a user has a specific role
- `hasAnyRole`: Checks if a user has any of the specified roles
- `hasAllRoles`: Checks if a user has all of the specified roles
- Support for auto-repair of inconsistent roles

### Database Interactions
1. `get_user_roles` RPC function: Fetches all roles for a user
2. `rbacConsistencyChecker.checkUserConsistency`: Checks for inconsistencies between database roles and user metadata

### Key Issues
1. **Separate from Authentication**: Works independently from AuthContext
2. **Redundant Role Fetching**: Fetches roles after authentication has already completed
3. **No Role Caching**: Doesn't efficiently cache roles between renders
4. **Limited Error Handling**: Basic error handling without advanced fallback mechanisms
5. **No Permissions System**: Focuses only on roles, not derived permissions

### Integration Points
The main integration point will be combining the role fetching with the auth state change handling in AuthContext.
