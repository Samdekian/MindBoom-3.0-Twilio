
# AuthContext Implementation Analysis

## Current Implementation

The current `AuthContext` is implemented in `src/contexts/AuthContext.tsx` and provides basic authentication functionality with mock role data.

### State Management
- Maintains `user`, `session`, `loading`, `error`, and `isInitialized` states
- Also maintains mock `userRoles` (hardcoded to `['patient']`) and mock `permissions` (hardcoded to `['read:profile']`)
- These mock roles don't reflect the actual roles stored in the database

### Authentication Flow
1. On component mount, checks for an active session using `supabase.auth.getSession()`
2. Sets up a subscription to auth state changes via `supabase.auth.onAuthStateChange`
3. Updates the user and session state when auth state changes
4. No integration with the RBAC system during authentication

### Authentication Methods
- `signIn`: Email/password authentication
- `signUp`: User registration
- `signOut`: User logout
- `resetPassword`: Password reset flow
- `updatePassword`: Change password functionality
- `loginWithMagicLink`: Email link authentication
- Also includes aliases `register` and `logout` for backward compatibility

### Key Issues
1. **Separate Authentication and RBAC**: The AuthContext uses mock roles while the real roles are fetched separately by `useRBAC`
2. **Inconsistent Data**: The mock roles in AuthContext may not match the actual roles from the database
3. **Inefficient Queries**: Authentication and role fetching happen separately, causing multiple database queries
4. **No Role Synchronization**: Changes to roles in the database aren't reflected in the AuthContext
5. **No Permission Derivation**: Permissions are mocked rather than derived from roles

### Integration Points
The main integration point will be connecting the session initialization in AuthContext with the role fetching in useRBAC.
