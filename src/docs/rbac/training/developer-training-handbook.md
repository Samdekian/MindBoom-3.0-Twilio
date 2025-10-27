
# RBAC Developer Training Handbook

This handbook provides comprehensive training materials for developers working with the Role-Based Access Control (RBAC) system.

## Module 1: Core Concepts

### What is RBAC?

Role-Based Access Control (RBAC) is a security approach that restricts system access based on the roles assigned to users. In our implementation:

- **Roles** represent broad categories of users (admin, therapist, patient, support)
- **Permissions** represent specific actions that can be performed on resources
- **Resources** are the objects or data being protected
- **Actions** are operations that can be performed on resources

### RBAC vs. Other Access Control Models

| Model | Description | Best For |
|-------|-------------|----------|
| **RBAC** | Access based on roles | Organizations with well-defined job functions |
| **ABAC** | Access based on attributes | Complex, dynamic access requirements |
| **MAC** | Mandatory access control based on security levels | High-security environments |
| **DAC** | Discretionary access control where owners set permissions | Collaborative environments |

Our system primarily uses RBAC but incorporates elements of ABAC for fine-grained control.

## Module 2: System Architecture

### Component Layers

1. **Database Layer**: Stores roles, permissions, and user assignments
2. **API Layer**: RPC functions and database views for secure access
3. **Service Layer**: Business logic and role management
4. **Hook Layer**: React hooks for accessing RBAC functionality
5. **Component Layer**: UI components with built-in RBAC functionality

### Type System

Our RBAC system is built on a TypeScript type system that enforces correct usage:

```typescript
// Core types
type UserRole = 'admin' | 'therapist' | 'patient' | 'support';

interface Permission {
  resource: string;
  action: string;
  level?: 'none' | 'read' | 'write' | 'admin';
  name?: string;
  description?: string;
  category?: string;
}

// Role definition
interface RoleDefinition {
  name: UserRole;
  description: string;
  permissions: Permission[];
  inherits?: UserRole[];
}
```

## Module 3: Key Components

### RBAC Hooks

Our system provides hooks for clean integration with React components:

```typescript
// Role checking
const { hasRole, hasAnyRole, hasAllRoles } = useRBAC();

// Permission checking
const { hasPermission, checkPermissions } = usePermission();

// Role management (admin functions)
const { assignRole, removeRole } = useRoleManagement();
```

### Guard Components

Components that conditionally render based on roles:

```tsx
// Basic usage
<RoleBasedGuard allowedRoles={['admin']}>
  <AdminPanel />
</RoleBasedGuard>

// With fallback
<RoleBasedGuard 
  allowedRoles={['therapist']} 
  fallback={<AccessDeniedMessage />}
>
  <TherapistTools />
</RoleBasedGuard>

// With permissions
<RoleBasedGuard 
  permissions={[{ resource: 'patient', action: 'edit' }]}
>
  <PatientEditForm />
</RoleBasedGuard>
```

### Route Protection

Secure routes based on roles:

```tsx
<Route 
  path="/admin" 
  element={
    <RoleProtectedRoute allowedRoles={['admin']} redirectPath="/access-denied">
      <AdminDashboard />
    </RoleProtectedRoute>
  } 
/>
```

## Module 4: Implementation Patterns

### Client-Side Pattern

```tsx
function PatientList() {
  const { hasPermission } = usePermission();
  const canEditPatients = hasPermission({ resource: 'patient', action: 'edit' });
  
  return (
    <div>
      <h2>Patients</h2>
      <table>
        {/* Table content */}
        <tbody>
          {patients.map(patient => (
            <tr key={patient.id}>
              <td>{patient.name}</td>
              <td>
                {canEditPatients && (
                  <button onClick={() => editPatient(patient.id)}>Edit</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Server-Side Pattern

```typescript
// In an RPC function or API endpoint
export async function updatePatient(patientId: string, data: PatientData) {
  // Get the current user ID
  const userId = auth.uid();
  
  // Check if user has permission using a secure RPC function
  const hasPermission = await supabase.rpc('has_permission', {
    user_id: userId,
    resource: 'patient',
    action: 'edit'
  });
  
  if (!hasPermission) {
    throw new Error('Access denied');
  }
  
  // Proceed with the update
  const { data: updatedPatient, error } = await supabase
    .from('patients')
    .update(data)
    .eq('id', patientId);
    
  // Handle result
  if (error) throw error;
  return updatedPatient;
}
```

### Combined Approach (Best Practice)

Always implement both client-side and server-side checks:

1. Client-side: For responsive UI and good UX
2. Server-side: For security enforcement
3. Database RLS: For data-level protection

## Module 5: Security Best Practices

### Defense in Depth

Implement multiple layers of security:

1. **UI Layer**: Hide/disable features based on roles
2. **API Layer**: Validate permissions before operations
3. **Database Layer**: Apply RLS policies
4. **Monitoring Layer**: Detect and alert on suspicious activities

### Common Vulnerabilities to Avoid

1. **Client-Side Only Checks**: Always enforce permissions server-side
2. **Hardcoded Roles**: Never hardcode role checks in a way that bypasses the RBAC system
3. **Inadequate Logging**: Log all permission-related failures for auditing
4. **Missing RLS Policies**: Ensure all tables have appropriate RLS

### Audit and Monitoring

Our system includes built-in auditing:

```typescript
// All role changes are automatically logged
await assignRole(userId, 'admin'); // Creates audit log entry

// Manually log security-relevant events
import { logRBACEvent } from '@/utils/rbac/audit';

await logRBACEvent(
  userId,
  'permission_override',
  'patient_records',
  patientId,
  { reason: 'emergency_access', approved_by: adminId }
);
```

## Module 6: Exercises and Examples

### Exercise 1: Implementing Basic Role Checks

Create a component that shows different content based on user roles:

```tsx
import { useRBAC } from '@/hooks/useRBAC';

function Dashboard() {
  const { hasRole, isLoading } = useRBAC();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      {/* Everyone sees this */}
      <DashboardSummary />
      
      {/* Only therapists and admins see this */}
      {hasRole('therapist') || hasRole('admin') ? (
        <PatientSchedule />
      ) : null}
      
      {/* Only admins see this */}
      {hasRole('admin') && <SystemSettings />}
    </div>
  );
}
```

### Exercise 2: Implementing Permission-Based UI

Create a component that uses fine-grained permissions:

```tsx
import { usePermission } from '@/hooks/usePermission';

function PatientRecord({ patientId }) {
  const { hasPermission, getFieldAccess } = usePermission();
  const medicalHistoryAccess = getFieldAccess('patient.medical_history');
  
  const canEditMedication = hasPermission({
    resource: 'medication',
    action: 'prescribe',
    level: 'write'
  });
  
  return (
    <div className="patient-record">
      <h2>Patient Record</h2>
      
      {/* Basic info visible to all */}
      <PatientBasicInfo patientId={patientId} />
      
      {/* Medical history with access control */}
      {!medicalHistoryAccess.hidden && (
        <div className="medical-history">
          <h3>Medical History</h3>
          <div className={medicalHistoryAccess.readOnly ? 'read-only' : ''}>
            {/* Form or display based on access */}
            <MedicalHistoryForm 
              patientId={patientId} 
              readOnly={medicalHistoryAccess.readOnly} 
            />
          </div>
        </div>
      )}
      
      {/* Medication management with permission check */}
      {canEditMedication && (
        <div className="medication">
          <h3>Prescription Management</h3>
          <PrescriptionForm patientId={patientId} />
        </div>
      )}
    </div>
  );
}
```

### Exercise 3: Handling Role Changes

Implement proper handling of role changes:

```tsx
import { useEffect } from 'react';
import { useRBAC } from '@/hooks/useRBAC';
import { useNavigate } from 'react-router-dom';

function AdminPage() {
  const { hasRole, isLoading } = useRBAC();
  const navigate = useNavigate();
  
  // Redirect if user loses admin role
  useEffect(() => {
    if (!isLoading && !hasRole('admin')) {
      navigate('/dashboard');
    }
  }, [hasRole, isLoading, navigate]);
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div className="admin-page">
      <h1>Admin Dashboard</h1>
      {/* Admin content */}
    </div>
  );
}
```

## Module 7: Troubleshooting Guide

See our [Troubleshooting Guide](../guides/troubleshooting-guide.md) for detailed information on diagnosing and fixing common RBAC issues.

## Module 8: Advanced Topics

### Role Inheritance

Our system supports role inheritance, where one role can include all permissions of another:

```typescript
// Example role definition with inheritance
const roleDefinitions: RoleDefinition[] = [
  {
    name: 'user',
    description: 'Basic user access',
    permissions: [
      { resource: 'profile', action: 'view', level: 'read' },
      { resource: 'profile', action: 'edit', level: 'write' }
    ]
  },
  {
    name: 'therapist',
    description: 'Therapist access',
    inherits: ['user'], // Inherits all user permissions
    permissions: [
      { resource: 'patient', action: 'view', level: 'read' },
      { resource: 'patient', action: 'edit', level: 'write' },
      { resource: 'appointment', action: 'schedule', level: 'write' }
    ]
  }
];
```

### Custom Permission Validators

For complex permission logic, create custom validators:

```typescript
function canAccessPatientRecord(patientId: string, userId: string) {
  const { hasRole } = useRBAC();
  const { hasPermission } = usePermission();
  
  // Admins can access all records
  if (hasRole('admin')) return true;
  
  // Therapists can access their assigned patients
  if (hasRole('therapist')) {
    // Check if patient is assigned to this therapist
    return isPatientAssignedToTherapist(patientId, userId);
  }
  
  // Patients can only access their own records
  if (hasRole('patient')) {
    return patientId === userId;
  }
  
  // Support staff needs explicit permission
  if (hasRole('support')) {
    return hasPermission({
      resource: 'patient',
      action: 'support_access',
      level: 'read'
    });
  }
  
  return false;
}
```

## Conclusion

This handbook serves as a comprehensive guide to understanding and working with our RBAC system. Remember these key points:

1. **Security is Multi-Layered**: Always implement checks at UI, API, and database levels
2. **Separation of Concerns**: Use the appropriate hooks and components for each task
3. **Type Safety**: Leverage TypeScript to catch potential issues early
4. **Performance Matters**: Use optimized queries and memoization for better performance
5. **Maintainability**: Follow established patterns for consistent implementation

For additional help, consult the other documentation guides or reach out to the security team.
