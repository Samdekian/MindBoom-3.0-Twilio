
# RBAC Component Catalog

This document catalogs the React components available in the RBAC system, their properties, and usage patterns.

## Protection Components

### RoleProtectedRoute

Restricts route access to users with specific roles.

```tsx
import RoleProtectedRoute from "@/components/RoleProtectedRoute";

<RoleProtectedRoute 
  allowedRoles={['admin', 'therapist']} 
  redirectPath="/access-denied"
>
  <AdminDashboard />
</RoleProtectedRoute>
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `allowedRoles` | `string[]` | Roles allowed to access the route |
| `redirectPath` | `string` | Path to redirect if access denied (optional) |
| `showFallback` | `boolean` | Whether to show fallback component instead of redirecting |
| `fallback` | `React.ReactNode` | Component to show if access denied (optional) |
| `loading` | `React.ReactNode` | Component to show while checking roles (optional) |
| `children` | `React.ReactNode` | Protected content |

### RoleBasedGuard

Conditionally renders children based on user roles.

```tsx
import { RoleBasedGuard } from "@/components/RoleBasedGuard";

<RoleBasedGuard 
  allowedRoles={['admin']}
  fallback={<AccessDeniedMessage />}
>
  <AdminControls />
</RoleBasedGuard>
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `allowedRoles` | `string[]` | Roles allowed to see the content |
| `permissions` | `Permission[]` | Required permissions (optional) |
| `requireAll` | `boolean` | If true, requires all roles, otherwise any role (optional) |
| `requireAllPermissions` | `boolean` | If true, requires all permissions (optional) |
| `fallback` | `React.ReactNode` | Component to show if access denied (optional) |
| `showLoading` | `boolean` | Whether to show loading state (optional) |
| `className` | `string` | CSS class name (optional) |
| `children` | `React.ReactNode` | Protected content |

### RoleBasedField

Controls field visibility and editability based on user roles.

```tsx
import { RoleBasedField } from "@/components/RoleBasedField";

<RoleBasedField
  fieldName="patient.diagnosis"
  allowedRoles={['therapist', 'admin']}
  readOnlyRoles={['support']}
  hiddenRoles={['patient']}
>
  <textarea name="diagnosis" />
</RoleBasedField>
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `fieldName` | `string` | Field identifier |
| `allowedRoles` | `string[]` | Roles allowed to see and edit the field (optional) |
| `readOnlyRoles` | `string[]` | Roles that can see but not edit the field (optional) |
| `hiddenRoles` | `string[]` | Roles that cannot see the field (optional) |
| `requireAll` | `boolean` | If true, requires all roles, otherwise any role (optional) |
| `className` | `string` | CSS class name (optional) |
| `children` | `React.ReactNode` | Field content |

### PermissionField

Controls field access based on specific permissions.

```tsx
import { PermissionField } from "@/components/PermissionField";

<PermissionField
  fieldName="patient.diagnosis"
  requiredPermissions={[
    { resource: 'patient', action: 'view_diagnosis', level: 'read' }
  ]}
>
  <textarea name="diagnosis" />
</PermissionField>
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `fieldName` | `string` | Field identifier |
| `requiredPermissions` | `Permission[]` | Permissions required to access the field |
| `requireAll` | `boolean` | If true, requires all permissions, otherwise any (optional) |
| `className` | `string` | CSS class name (optional) |
| `children` | `React.ReactNode` | Field content |

### RoleBasedNavItem

Navigation item with role-based visibility.

```tsx
import { RoleBasedNavItem } from "@/components/RoleBasedNavItem";

<RoleBasedNavItem allowedRoles={['admin']} icon={<SettingsIcon />}>
  Admin Settings
</RoleBasedNavItem>
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `allowedRoles` | `string[]` | Roles allowed to see the item |
| `icon` | `React.ReactNode` | Icon to display (optional) |
| `active` | `boolean` | Whether the item is active (optional) |
| `className` | `string` | CSS class name (optional) |
| `children` | `React.ReactNode` | Item label |

### RoleBasedNavLink

Navigation link with role-based activation.

```tsx
import { RoleBasedNavLink } from "@/components/RoleBasedNavLink";

<RoleBasedNavLink
  to="/admin-panel"
  allowedRoles={['admin']}
  showIfDisallowed={true}
  disabledTooltip="Admin access required"
>
  Admin Panel
</RoleBasedNavLink>
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `to` | `string` | Link destination |
| `allowedRoles` | `string[]` | Roles allowed to access the link |
| `showIfDisallowed` | `boolean` | Whether to show the link when access is denied (optional) |
| `disabledClassName` | `string` | CSS class when disabled (optional) |
| `disabledTooltip` | `string` | Tooltip text when disabled (optional) |
| `className` | `string` | CSS class name (optional) |
| `children` | `React.ReactNode` | Link content |

## Management Components

### RoleHistoryTimeline

Displays history of role changes for a user.

```tsx
import RoleHistoryTimeline from "@/components/auth/RoleHistoryTimeline";

<RoleHistoryTimeline userId="user-id" />
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `userId` | `string` | User ID to show history for |
| `limit` | `number` | Number of events to show (optional) |
| `showFilters` | `boolean` | Whether to show filtering controls (optional) |
| `className` | `string` | CSS class name (optional) |

### UserRoleManager

Component for managing user roles.

```tsx
import UserRoleManager from "@/components/admin/UserRoleManager";

<UserRoleManager userId="user-id" />
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `userId` | `string` | User ID to manage roles for |
| `showHistory` | `boolean` | Whether to show role history (optional) |
| `compact` | `boolean` | Whether to use compact layout (optional) |
| `className` | `string` | CSS class name (optional) |
| `onRoleChange` | `(roles: string[]) => void` | Callback when roles change (optional) |

### EnhancedRoleManagement

Complete UI for role management.

```tsx
import EnhancedRoleManagement from "@/components/admin/EnhancedRoleManagement";

<EnhancedRoleManagement />
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `showFilters` | `boolean` | Whether to show filtering controls (optional) |
| `pageSize` | `number` | Number of users per page (optional) |
| `className` | `string` | CSS class name (optional) |

### RoleSyncStatusIndicator

Shows role synchronization status.

```tsx
import RoleSyncStatusIndicator from "@/components/auth/RoleSyncStatusIndicator";

<RoleSyncStatusIndicator userId="user-id" />
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `userId` | `string` | User ID to check status for |
| `showDetails` | `boolean` | Whether to show detailed information (optional) |
| `className` | `string` | CSS class name (optional) |

## Monitoring Components

### RBACMonitoringDashboard

Complete monitoring dashboard for RBAC.

```tsx
import RBACMonitoringDashboard from "@/components/admin/RBACMonitoringDashboard";

<RBACMonitoringDashboard />
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `defaultTab` | `'overview' \| 'events' \| 'users' \| 'monitoring'` | Initial active tab (optional) |
| `className` | `string` | CSS class name (optional) |

### RBACEventsTimeline

Displays RBAC events in a timeline.

```tsx
import { RBACEventsTimeline } from "@/components/admin/rbac-dashboard/RBACEventsTimeline";

<RBACEventsTimeline limit={10} />
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `limit` | `number` | Number of events to show (optional) |
| `filter` | `string` | Event type filter (optional) |
| `userId` | `string` | Filter by user ID (optional) |
| `className` | `string` | CSS class name (optional) |

### RoleConsistencySection

Shows role consistency information and actions.

```tsx
import { RoleConsistencySection } from "@/components/admin/rbac-dashboard/RoleConsistencySection";

<RoleConsistencySection />
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `autoRefresh` | `boolean` | Whether to automatically refresh data (optional) |
| `showControls` | `boolean` | Whether to show control buttons (optional) |
| `className` | `string` | CSS class name (optional) |

### UserInconsistenciesTable

Displays users with role inconsistencies.

```tsx
import { UserInconsistenciesTable } from "@/components/admin/rbac-dashboard/UserInconsistenciesTable";

<UserInconsistenciesTable onFixAll={() => {}} />
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `data` | `UserInconsistency[]` | Inconsistency data (optional) |
| `loading` | `boolean` | Whether data is loading (optional) |
| `onFix` | `(userId: string) => void` | Callback when fixing a user (optional) |
| `onFixAll` | `() => void` | Callback when fixing all users (optional) |
| `className` | `string` | CSS class name (optional) |

## Troubleshooting Components

### RoleTroubleshooter

Tool for diagnosing and fixing role issues.

```tsx
import RoleTroubleshooter from "@/components/auth/RoleTroubleshooter";

<RoleTroubleshooter />
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `userId` | `string` | User ID to troubleshoot (optional) |
| `autoRun` | `boolean` | Whether to automatically run check (optional) |
| `showSearch` | `boolean` | Whether to show user search (optional) |
| `className` | `string` | CSS class name (optional) |

### DiagnosticResults

Displays role diagnostic results.

```tsx
import DiagnosticResults from "@/components/auth/DiagnosticResults";

<DiagnosticResults result={diagnosticResult} onRepair={() => {}} />
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `result` | `RoleDiagnosticResult` | Diagnostic result |
| `onRepair` | `() => void` | Callback when repairing (optional) |
| `showDetails` | `boolean` | Whether to show detailed information (optional) |
| `className` | `string` | CSS class name (optional) |

### SuggestedFixes

Displays suggested fixes for role issues.

```tsx
import SuggestedFixes from "@/components/auth/SuggestedFixes";

<SuggestedFixes
  fixes={["Update profile role", "Resync metadata"]}
  onApply={() => {}}
/>
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `fixes` | `string[]` | Suggested fixes |
| `onApply` | `() => void` | Callback when applying fixes (optional) |
| `applied` | `boolean` | Whether fixes have been applied (optional) |
| `className` | `string` | CSS class name (optional) |

## Permission Management Components

### PermissionMatrix

Displays and manages role permissions.

```tsx
import PermissionMatrix from "@/components/admin/PermissionMatrix";

<PermissionMatrix />
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `roleId` | `string` | Role ID to manage permissions for (optional) |
| `editable` | `boolean` | Whether the matrix is editable (optional) |
| `className` | `string` | CSS class name (optional) |

### PermissionManager

Advanced permission management interface.

```tsx
import PermissionManager from "@/components/admin/PermissionManager";

<PermissionManager />
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `userId` | `string` | User ID to manage permissions for (optional) |
| `roleId` | `string` | Role ID to manage permissions for (optional) |
| `className` | `string` | CSS class name (optional) |

## Integration Components

### RBACVerificationPanel

Panel to verify RBAC system functionality.

```tsx
import RBACVerificationPanel from "@/components/admin/RBACVerificationPanel";

<RBACVerificationPanel />
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `runOnLoad` | `boolean` | Whether to run tests on load (optional) |
| `showControls` | `boolean` | Whether to show control buttons (optional) |
| `className` | `string` | CSS class name (optional) |

### RoleHealthDashboard

Dashboard showing RBAC system health.

```tsx
import RoleHealthDashboard from "@/components/admin/rbac-dashboard/RoleHealthDashboard";

<RoleHealthDashboard />
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `refreshInterval` | `number` | Auto-refresh interval in seconds (optional) |
| `className` | `string` | CSS class name (optional) |
