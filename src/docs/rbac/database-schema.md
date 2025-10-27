
# RBAC Database Schema

This document details the database schema for the Role-Based Access Control (RBAC) system.

## Tables Overview

| Table | Description |
|-------|-------------|
| `roles` | Defines the available roles in the system |
| `user_roles` | Maps users to their assigned roles |
| `user_permissions` | Stores individual user permissions |
| `field_access_control` | Controls field-level access settings |
| `audit_logs` | Records system events for auditing |
| `role_sync_events` | Tracks role synchronization events |

## Schema Details

### roles

Defines the available roles in the system.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `name` | app_role (enum) | Role name (admin, therapist, patient, support) |
| `description` | text | Role description |
| `created_at` | timestamptz | Creation timestamp |
| `updated_at` | timestamptz | Last update timestamp |

```sql
CREATE TYPE app_role AS ENUM ('admin', 'therapist', 'patient', 'support');

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name app_role NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### user_roles

Maps users to their assigned roles.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `user_id` | uuid | Foreign key to auth.users |
| `role_id` | uuid | Foreign key to roles |
| `created_at` | timestamptz | Creation timestamp |
| `updated_at` | timestamptz | Last update timestamp |

```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role_id)
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
```

### user_permissions

Stores individual user permissions.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `user_id` | uuid | Foreign key to auth.users |
| `resource` | text | Resource identifier |
| `action` | text | Action on the resource |
| `level` | text | Permission level (none, read, write, admin) |
| `name` | text | Permission name |
| `description` | text | Permission description |
| `category` | text | Permission category |
| `created_at` | timestamptz | Creation timestamp |
| `updated_at` | timestamptz | Last update timestamp |

```sql
CREATE TABLE user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  level TEXT NOT NULL,
  name TEXT,
  description TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX idx_user_permissions_resource_action ON user_permissions(resource, action);
```

### field_access_control

Controls field-level access settings.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `user_id` | uuid | Foreign key to auth.users |
| `field_name` | text | Field identifier |
| `read_only` | boolean | Whether the field is read-only |
| `hidden` | boolean | Whether the field is hidden |
| `mask` | boolean | Whether the field should be masked |
| `created_at` | timestamptz | Creation timestamp |
| `updated_at` | timestamptz | Last update timestamp |

```sql
CREATE TABLE field_access_control (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  read_only BOOLEAN DEFAULT false,
  hidden BOOLEAN DEFAULT false,
  mask BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_field_access_control_user_id ON field_access_control(user_id);
CREATE INDEX idx_field_access_control_field_name ON field_access_control(field_name);
```

### audit_logs

Records system events for auditing.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `user_id` | uuid | User who performed the action |
| `activity_timestamp` | timestamptz | When the action occurred |
| `activity_type` | text | Type of activity |
| `resource_type` | text | Type of resource affected |
| `resource_id` | text | ID of resource affected |
| `metadata` | jsonb | Additional information |
| `ip_address` | text | IP address of the request |

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  activity_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  activity_type TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  ip_address TEXT
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_activity_timestamp ON audit_logs(activity_timestamp);
CREATE INDEX idx_audit_logs_activity_type ON audit_logs(activity_type);
```

### role_sync_events

Tracks role synchronization events.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `user_id` | uuid | User whose roles were synced |
| `performed_at` | timestamptz | When the sync occurred |
| `success` | boolean | Whether sync was successful |
| `previous_profile_role` | text | Previous role in profile |
| `previous_metadata_role` | text | Previous role in metadata |
| `new_role` | text | New role assigned |
| `error_message` | text | Error message if any |
| `sync_type` | text | Type of sync |
| `source` | text | Source of sync request |

```sql
CREATE TABLE role_sync_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  performed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  success BOOLEAN NOT NULL DEFAULT true,
  previous_profile_role TEXT,
  previous_metadata_role TEXT,
  new_role TEXT NOT NULL,
  error_message TEXT,
  sync_type TEXT NOT NULL,
  source TEXT NOT NULL
);

CREATE INDEX idx_role_sync_events_user_id ON role_sync_events(user_id);
CREATE INDEX idx_role_sync_events_performed_at ON role_sync_events(performed_at);
```

## Views

### user_roles_view

Shows users with their assigned roles.

```sql
CREATE OR REPLACE VIEW user_roles_view AS
SELECT
  ur.user_id,
  array_agg(r.name::text) as roles,
  count(*) as role_count,
  min(ur.created_at) as first_role_assigned_at,
  max(ur.updated_at) as last_role_updated_at,
  u.email,
  p.full_name,
  p.account_type
FROM
  user_roles ur
JOIN
  roles r ON ur.role_id = r.id
JOIN
  profiles p ON ur.user_id = p.id
LEFT JOIN
  auth.users u ON ur.user_id = u.id
GROUP BY
  ur.user_id, u.email, p.full_name, p.account_type;
```

### role_assignments_view

Shows detailed role assignments.

```sql
CREATE OR REPLACE VIEW role_assignments_view AS
SELECT
  ur.id as assignment_id,
  ur.user_id,
  ur.role_id,
  r.name as role_name,
  ur.created_at as assigned_at,
  ur.updated_at,
  p.full_name,
  r.description as role_description
FROM
  user_roles ur
JOIN
  roles r ON ur.role_id = r.id
JOIN
  profiles p ON ur.user_id = p.id;
```

### role_audit_logs_view

Shows role-related audit logs.

```sql
CREATE OR REPLACE VIEW role_audit_logs_view AS
SELECT
  al.id,
  al.user_id,
  al.activity_timestamp,
  al.metadata,
  al.activity_type,
  al.resource_id,
  p.full_name
FROM
  audit_logs al
JOIN
  profiles p ON al.user_id = p.id
WHERE
  al.resource_type = 'user_roles'
  OR al.activity_type LIKE 'role%';
```

## Database Functions

### get_user_roles

Retrieves all roles for a user.

```sql
CREATE OR REPLACE FUNCTION get_user_roles(user_id UUID)
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

### has_role

Checks if a user has a specific role.

```sql
CREATE OR REPLACE FUNCTION has_role(user_id UUID, role_name app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = user_id AND r.name = role_name
  );
$$;
```

### get_primary_role

Determines the primary role for a user based on precedence.

```sql
CREATE OR REPLACE FUNCTION get_primary_role(user_id UUID)
RETURNS TEXT
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
  roles TEXT[];
  primary_role TEXT;
BEGIN
  -- Get all roles for the user
  SELECT array_agg(r.name::TEXT)
  INTO roles
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = user_id;
  
  -- Return default role if no roles found
  IF roles IS NULL OR array_length(roles, 1) IS NULL THEN
    RETURN 'patient';
  END IF;
  
  -- Determine primary role based on precedence
  IF 'admin' = ANY(roles) THEN
    primary_role := 'admin';
  ELSIF 'therapist' = ANY(roles) THEN
    primary_role := 'therapist';
  ELSIF 'patient' = ANY(roles) THEN
    primary_role := 'patient';
  ELSIF 'support' = ANY(roles) THEN
    primary_role := 'support';
  ELSE
    primary_role := 'patient'; -- Default
  END IF;
  
  RETURN primary_role;
END;
$$;
```

## Security Policies

### Roles Table

```sql
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Administrators can manage roles"
ON roles
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "All authenticated users can view roles"
ON roles
FOR SELECT
USING (auth.role() = 'authenticated');
```

### User Roles Table

```sql
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Administrators can manage user roles"
ON user_roles
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "All authenticated users can view user roles"
ON user_roles
FOR SELECT
USING (auth.role() = 'authenticated');
```

### User Permissions Table

```sql
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own permissions"
ON user_permissions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Administrators can manage all permissions"
ON user_permissions
USING (has_role(auth.uid(), 'admin'::app_role));
```

### Field Access Control Table

```sql
ALTER TABLE field_access_control ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own field access settings"
ON field_access_control
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Administrators can manage all field access settings"
ON field_access_control
USING (has_role(auth.uid(), 'admin'::app_role));
```

## Database Triggers

### Role Synchronization

```sql
-- Trigger function to sync user roles with profile and user metadata
CREATE OR REPLACE FUNCTION on_user_role_change()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Determine affected user_id based on operation type
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    v_user_id := NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    v_user_id := OLD.user_id;
  END IF;

  -- Call our sync function with the source set to the trigger operation
  PERFORM auto_sync_user_metadata(
    v_user_id, 
    'user_roles_' || lower(TG_OP),
    'trigger'
  );
  
  -- Return the appropriate record
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- Attach the trigger to user_roles table
CREATE TRIGGER sync_user_roles_on_change
AFTER INSERT OR UPDATE OR DELETE ON user_roles
FOR EACH ROW
EXECUTE FUNCTION on_user_role_change();
```
