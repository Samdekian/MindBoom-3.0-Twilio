
# RBAC System Flow Diagrams

This document contains flow diagrams illustrating key processes in the RBAC system.

## Authentication and Role Resolution Flow

```mermaid
sequenceDiagram
    participant User
    participant AppUI as Application UI
    participant AuthContext as AuthRBAC Context
    participant RBACHooks as RBAC Hooks
    participant API as Supabase API
    participant DB as Database

    User->>AppUI: Login
    AppUI->>AuthContext: Call signIn()
    AuthContext->>API: Authentication Request
    API->>DB: Verify Credentials
    DB->>API: Authentication Result
    API->>AuthContext: Auth Response + Session
    
    Note over AuthContext: Session Established
    
    AuthContext->>API: Fetch User Roles
    API->>DB: Query Role Assignments
    DB->>API: Return Roles
    API->>AuthContext: Role Data
    
    AuthContext->>RBACHooks: Initialize with Roles
    
    Note over RBACHooks: RBAC State Available
    
    RBACHooks->>AppUI: Render UI Based on Roles
    AppUI->>User: Role-Appropriate Interface
```

## Role Consistency Check and Repair

```mermaid
sequenceDiagram
    participant User
    participant AppUI as Application UI
    participant RBACHooks as RBAC Hooks
    participant ConsistencyChecker as Consistency Checker
    participant DB as Database
    
    User->>AppUI: Trigger Consistency Check
    AppUI->>RBACHooks: Call performConsistencyCheck()
    RBACHooks->>ConsistencyChecker: Check User Roles
    
    ConsistencyChecker->>DB: Query user_roles Table
    DB->>ConsistencyChecker: Database Roles
    
    ConsistencyChecker->>DB: Query profiles.account_type
    DB->>ConsistencyChecker: Profile Role
    
    ConsistencyChecker->>DB: Query auth.users Metadata
    DB->>ConsistencyChecker: Metadata Role
    
    Note over ConsistencyChecker: Compare Roles
    
    alt Roles are consistent
        ConsistencyChecker->>RBACHooks: Return isConsistent: true
        RBACHooks->>AppUI: Display Success
    else Roles are inconsistent
        ConsistencyChecker->>RBACHooks: Return isConsistent: false
        RBACHooks->>AppUI: Display Inconsistency
        
        alt Auto-repair enabled
            User->>AppUI: Confirm Repair
            AppUI->>RBACHooks: Trigger Repair
            RBACHooks->>ConsistencyChecker: Repair Inconsistency
            ConsistencyChecker->>DB: Update Profile Role
            ConsistencyChecker->>DB: Update Metadata Role
            DB->>ConsistencyChecker: Confirm Updates
            ConsistencyChecker->>RBACHooks: Return fixed: true
            RBACHooks->>AppUI: Display Success
        end
    end
    
    AppUI->>User: Show Result
```

## Permission Resolution Flow

```mermaid
flowchart TD
    A[Start: Permission Check] --> B{User Authenticated?}
    B -->|No| C[Return No Access]
    B -->|Yes| D[Load User Roles]
    D --> E{Roles Loaded?}
    E -->|No| F[Return Loading]
    E -->|Yes| G[Load Role Permissions]
    G --> H[Map Roles to Permissions]
    H --> I{Check Required Permissions}
    I -->|Has All Required| J[Grant Access]
    I -->|Missing Permissions| K[Deny Access]
    
    subgraph Permission Checking
    I --> L{requireAll Flag?}
    L -->|True| M[Check All Permissions]
    L -->|False| N[Check Any Permission]
    M --> O{All Required Met?}
    N --> P{Any Required Met?}
    O -->|Yes| Q[Return true]
    O -->|No| R[Return false]
    P -->|Yes| S[Return true]
    P -->|No| T[Return false]
    end
```

## Role-Based Component Rendering

```mermaid
flowchart TD
    A[Component with RBAC] --> B{isLoading?}
    B -->|Yes| C[Show Loading State]
    B -->|No| D{Check Roles}
    
    D -->|Has Required Role| E[Render Protected Content]
    D -->|Missing Role| F{Fallback Provided?}
    
    F -->|Yes| G[Render Fallback]
    F -->|No| H[Render Nothing]
    
    subgraph RoleBasedGuard Component
    I[RoleBasedGuard] --> J{Props}
    J --> K[allowedRoles]
    J --> L[permissions]
    J --> M[requireAll]
    J --> N[fallback]
    J --> O[children]
    end
```

## Role Assignment Process

```mermaid
sequenceDiagram
    participant Admin
    participant AdminUI as Admin Interface
    participant API as RBAC API
    participant RoleService as Role Service
    participant DB as Database
    participant Hooks as RBAC Hooks
    participant User as Target User
    
    Admin->>AdminUI: Access User Management
    AdminUI->>API: Load Users with Roles
    API->>DB: Query user_roles_view
    DB->>API: User List with Roles
    API->>AdminUI: Display User List
    
    Admin->>AdminUI: Select User
    Admin->>AdminUI: Choose Role to Assign
    Admin->>AdminUI: Click "Assign Role"
    
    AdminUI->>API: Call assignRole(userId, role)
    API->>RoleService: manage_user_role RPC
    
    RoleService->>DB: Check if Role Exists
    DB->>RoleService: Role Verification
    
    RoleService->>DB: Check if Already Assigned
    DB->>RoleService: Assignment Status
    
    alt Role Not Already Assigned
        RoleService->>DB: Insert user_roles Record
        DB->>RoleService: Confirmation
        
        Note over DB: Trigger Fires
        DB->>DB: Run on_user_role_change Trigger
        DB->>DB: Update Profile account_type
        DB->>DB: Update Auth Metadata
    end
    
    RoleService->>API: Return Success
    API->>AdminUI: Update UI
    
    Note over User: Next User Session
    User->>Hooks: Initialize RBAC Hooks
    Hooks->>API: Fetch Updated Roles
    API->>Hooks: New Role Included
    Hooks->>User: Access to New Features
```

## Security Monitoring Flow

```mermaid
flowchart TD
    A[RBAC Security Event] -->|Log Event| B[Security Monitor]
    B -->|Store| C[Audit Logs Table]
    B -->|Analyze| D{Suspicious?}
    
    D -->|Yes| E[Generate Security Alert]
    D -->|No| F[Normal Operation]
    
    E -->|High Severity| G[Immediate Notification]
    E -->|Medium Severity| H[Security Dashboard Alert]
    E -->|Low Severity| I[Security Log Entry]
    
    subgraph Security Events
    J[Role Assignment] --> B
    K[Multiple Failed Checks] --> B
    L[Role Removal] --> B
    M[Permission Override] --> B
    N[Inconsistency Detected] --> B
    end
    
    subgraph Analysis Criteria
    O[Time Pattern] --> D
    P[Location Change] --> D
    Q[Unusual Role Combo] --> D
    R[Sensitive Resource] --> D
    end
```
