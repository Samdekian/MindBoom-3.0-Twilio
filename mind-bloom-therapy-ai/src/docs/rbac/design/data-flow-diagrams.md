
# Authentication and Role Fetching Data Flow

## Authentication Flow

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│             │         │             │         │             │
│    User     │ ───────▶│ AuthRBACProvider │ ───────▶│  Supabase   │
│             │ signIn()│             │ auth.signIn()│   Auth     │
└─────────────┘         └──────┬──────┘         └──────┬──────┘
                              │                        │
                              │                        │
                              │                        │
                              │                        ▼
                              │               ┌─────────────┐
                              │               │             │
                              │               │  Auth Event │
                              │               │   Change    │
                              │               │             │
                              │               └──────┬──────┘
                              │                      │
                              │                      │
                              │                      │
                              ▼                      ▼
                        ┌─────────────┐       ┌─────────────┐
                        │             │       │             │
                        │  Update     │◀──────│  onAuth     │
                        │  Auth State │       │  StateChange│
                        │             │       │             │
                        └──────┬──────┘       └─────────────┘
                              │
                              │
                              │
                              ▼
                        ┌─────────────┐
                        │             │
                        │  Fetch      │
                        │  Roles      │
                        │             │
                        └──────┬──────┘
                              │
                              │
                              │
                              ▼
                        ┌─────────────┐
                        │             │
                        │  Update     │
                        │  RBAC State │
                        │             │
                        └─────────────┘
```

## Role Fetching and Synchronization Flow

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│             │         │             │         │             │
│   Auth      │ ───────▶│ AuthRBACProvider │ ───────▶│  Database   │
│  Change     │         │             │ fetchRoles()│  Function   │
└─────────────┘         └──────┬──────┘         └──────┬──────┘
                              │                        │
                              │                        │
                              │                        │
                              │                        ▼
                              │               ┌─────────────┐
                              │               │             │
                              │               │ Return Roles│
                              │               │     +      │
                              │               │ Permissions │
                              │               │             │
                              │               └──────┬──────┘
                              │                      │
                              │                      │
                              │                      │
                              ▼                      ▼
                        ┌─────────────┐       ┌─────────────┐
                        │             │       │             │
                        │  Update     │◀──────│  Process    │
                        │  RBAC State │       │  Response   │
                        │             │       │             │
                        └──────┬──────┘       └─────────────┘
                              │
                              │
                              │
                              ▼
                        ┌─────────────┐
                        │             │
                        │  Derive     │
                        │ Permissions │
                        │             │
                        └──────┬──────┘
                              │
                              │
                              │
                              ▼
                        ┌─────────────┐
                        │             │
                        │  Cache      │
                        │  Results    │
                        │             │
                        └──────┬──────┘
                              │
                              │
                              │
                              ▼
                        ┌─────────────┐
                        │             │
                        │  Check      │
                        │ Consistency │
                        │             │
                        └─────────────┘
```

## Permission Checking Flow

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│             │         │             │         │             │
│ Component   │ ───────▶│   useAuthRBAC   │ ───────▶│ Permission │
│             │hasPermission()│           │         │  Mapping   │
└─────────────┘         └──────┬──────┘         └──────┬──────┘
                              │                        │
                              │                        │
                              │                        │
                              │                        ▼
                              │               ┌─────────────┐
                              │               │             │
                              │               │  Check      │
                              │               │ Permission  │
                              │               │  Cache      │
                              │               │             │
                              │               └──────┬──────┘
                              │                      │
                              │                      │
                              │                      │
                              ▼                      ▼
                        ┌─────────────┐       ┌─────────────┐
                        │             │       │             │
                        │  Return     │◀──────│  Evaluate   │
                        │  Result     │       │ Permission  │
                        │             │       │             │
                        └─────────────┘       └─────────────┘
```
