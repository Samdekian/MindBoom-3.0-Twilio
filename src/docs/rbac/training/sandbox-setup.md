
# RBAC Sandbox Environment Setup Guide

This guide explains how to set up a sandbox environment for practicing with the RBAC system, allowing developers to experiment with roles and permissions in a safe, isolated environment.

## Purpose of the Sandbox Environment

The RBAC sandbox environment provides:

- A safe space to experiment with role configurations
- Test data for simulating various user scenarios
- Isolated database to prevent affecting production data
- Tools for visualizing and understanding RBAC behavior

## Setup Instructions

### 1. Local Development Setup

To set up a local RBAC sandbox:

```bash
# Clone the repository
git clone https://github.com/your-org/rbac-sandbox.git
cd rbac-sandbox

# Install dependencies
npm install

# Set up the database
npm run setup:db

# Seed the database with test data
npm run seed:db

# Start the development server
npm run dev
```

### 2. Database Configuration

The sandbox uses a separate schema in your Supabase database:

```sql
-- Run this in Supabase SQL Editor
-- Create sandbox schema
CREATE SCHEMA IF NOT EXISTS rbac_sandbox;

-- Set up role tables in sandbox schema
CREATE TABLE rbac_sandbox.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name app_role NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Set up other necessary tables
-- (Copy structure from main schema)

-- Insert test roles
INSERT INTO rbac_sandbox.roles (name, description)
VALUES 
  ('admin', 'Administrator with full system access'),
  ('therapist', 'Therapist with patient management abilities'),
  ('patient', 'Standard patient user'),
  ('support', 'Customer support user');
```

### 3. Environment Configuration

Create a `.env.sandbox` file with the sandbox configuration:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SANDBOX_MODE=true
VITE_SANDBOX_SCHEMA=rbac_sandbox
```

## Using the Sandbox

### Test Users

The sandbox comes with pre-configured test users:

| Email | Password | Role(s) |
|-------|----------|---------|
| admin@example.com | sandbox123 | admin |
| therapist@example.com | sandbox123 | therapist |
| patient@example.com | sandbox123 | patient |
| support@example.com | sandbox123 | support |
| multi@example.com | sandbox123 | therapist, support |

### Sandbox Features

#### Role Playground

The Role Playground allows you to:

1. Experiment with different role combinations
2. Visualize which UI elements are visible with different roles
3. Test how role changes affect the user experience

To access the Role Playground:

1. Log in with any sandbox user
2. Navigate to `/sandbox/role-playground`
3. Use the role selector to simulate different role combinations

#### Permission Tester

The Permission Tester lets you:

1. Test specific permission checks
2. See how permissions are derived from roles
3. Experiment with custom permission combinations

To use the Permission Tester:

1. Navigate to `/sandbox/permission-tester`
2. Select resources and actions to test
3. See the results for different user roles

#### Component Sandbox

The Component Sandbox showcases:

1. All RBAC-related components
2. How they behave with different roles
3. Code examples for implementation

To explore the Component Sandbox:

1. Navigate to `/sandbox/components`
2. Browse the component gallery
3. View source code examples
4. Test with different simulated roles

## Development Workflow

### Testing Role Changes

To test how role changes affect the UI:

1. Log in with a test user
2. Navigate to the Role Management screen
3. Modify the user's roles
4. Observe the changes in real-time

### Creating Test Scenarios

To create custom test scenarios:

1. Use the Scenario Builder at `/sandbox/scenarios`
2. Define user roles and permissions
3. Save the scenario for future testing
4. Share scenarios with other developers

### Debugging Tools

The sandbox includes special debugging tools:

1. **RBAC Inspector** (browser extension):
   - Shows role and permission information for the current user
   - Highlights elements affected by RBAC
   - Provides detailed permission check information

2. **RBAC Console**:
   - Available in browser console when in sandbox mode
   - Provides commands for inspecting and modifying RBAC state
   - Example: `RBAC.simulateRole('admin')` to temporarily change roles

## Learning Exercises

### Exercise 1: Role-Based UI Exploration

1. Log in with the `multi@example.com` user (has multiple roles)
2. Navigate to the main dashboard
3. Use the role selector to toggle between roles
4. Observe how the UI changes
5. Note which elements are visible or hidden based on roles

### Exercise 2: Permission Debugging

1. Log in with the `therapist@example.com` user
2. Navigate to the Patient Management screen
3. Enable the RBAC Inspector
4. Hover over UI elements to see the permission checks
5. Identify which permissions are needed for each action

### Exercise 3: Creating a Custom Role

1. Navigate to the Role Editor
2. Create a new role called "Supervisor"
3. Assign permissions from other roles
4. Create a test user with this role
5. Test the user experience with the new role

## Troubleshooting

### Common Issues

1. **Sandbox Reset**
   - If the sandbox environment becomes unstable, use:
   ```bash
   npm run sandbox:reset
   ```

2. **Permission Caching Issues**
   - If permission changes don't take effect immediately:
   ```javascript
   // In browser console
   RBAC.clearCache();
   ```

3. **User Session Problems**
   - If user sessions become corrupted:
   ```bash
   npm run sandbox:reset-sessions
   ```

## Support and Feedback

For help with the sandbox environment:

- Contact the RBAC Support Team on Slack (#rbac-sandbox)
- Submit issues on GitHub
- Share feedback and suggestions for improvement

## Conclusion

The RBAC sandbox environment provides a safe and comprehensive way to learn, experiment with, and test the RBAC system. By using this environment, developers can gain confidence in implementing RBAC features correctly and efficiently.

Happy experimenting!
