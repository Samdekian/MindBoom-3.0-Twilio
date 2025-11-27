
# Role-Based Components Inventory

## Components Using Role-Based Rendering

### Core RBAC Components
1. **RoleBasedContainer** (`src/components/RoleBasedContainer.tsx`)
   - Renders children based on user roles and permissions
   - Props: `allowedRoles`, `permissions`, `config`, `fallback`
   - Uses both `useRBAC` and `usePermission` hooks

2. **RoleBasedGuard** (`src/components/RoleBasedGuard.tsx`)
   - Similar to RoleBasedContainer but with a focus on access control
   - Displays access denied messages when permissions are insufficient
   - Props: `allowedRoles`, `permissions`, `fallback`, `requireAll`

3. **RoleBasedField** (`src/components/RoleBasedField.tsx`)
   - Controls field-level access based on roles
   - Can make fields read-only based on roles
   - Props: `fieldName`, `allowedRoles`, `readOnlyRoles`, `hiddenRoles`

4. **RoleProtectedRoute** (`src/components/RoleProtectedRoute.tsx`)
   - Route protection based on roles
   - Redirects unauthorized users
   - Props: `allowedRoles`, `permissions`, `redirectPath`, `requireAll`
   
5. **RoleBasedNavItem** (read-only component)
   - Controls navigation visibility based on roles
   - Used in navigation menus

### Dashboard Components
1. **WelcomeSection** (`src/components/dashboard/WelcomeSection.tsx`)
   - Uses role-based content customization
   - Directly uses `useRBAC` hook for role checking

2. **Dashboard** (`src/pages/Dashboard.tsx`)
   - Uses role checks to conditionally render different sections
   - Direct usage of `hasRole` from useRBAC

### Admin Components
Multiple admin components use role-based rendering, including:
- Role management interfaces
- Permission matrices
- User administration panels

### Auth Components
1. **NavbarAuthButtons** (`src/components/NavbarAuthButtons.tsx`)
   - Shows different options based on authentication and roles
   - Uses both `useAuth` and `useRBAC`

### Other Components
Various other components use role-based rendering for specific features or UI elements.

## Integration Challenges
1. **Inconsistent API Usage**: Some components use direct hook access, others use wrapper components
2. **Mixed Permission Checking**: Some components check roles, others check permissions
3. **Performance Optimization**: Need to ensure components don't trigger unnecessary re-renders
4. **Backward Compatibility**: Changes should maintain compatibility with existing component usage patterns
