# RBAC Code Examples and Patterns

This document provides real-world code examples for implementing RBAC features in your application.

## Basic Role Checking

### Example 1: Simple Role Check

```tsx
import { useRBAC } from '@/hooks/useRBAC';

function AdminButton() {
  const { hasRole, isLoading } = useRBAC();
  
  if (isLoading) return null;
  
  return hasRole('admin') ? (
    <button className="btn btn-danger">Delete Record</button>
  ) : null;
}
```

### Example 2: Multiple Role Check with Any Logic

```tsx
import { useRBAC } from '@/hooks/useRBAC';

function EditButton() {
  const { hasAnyRole, isLoading } = useRBAC();
  
  if (isLoading) return null;
  
  return hasAnyRole(['admin', 'therapist']) ? (
    <button className="btn btn-primary">Edit Record</button>
  ) : (
    <span className="text-muted">View Only</span>
  );
}
```

### Example 3: Role Check with All Logic

```tsx
import { useRBAC } from '@/hooks/useRBAC';

function SuperAdminPanel() {
  const { hasAllRoles, isLoading } = useRBAC();
  
  if (isLoading) return <div>Loading...</div>;
  
  // User must have both admin and support roles
  if (!hasAllRoles(['admin', 'support'])) {
    return <div>You need both admin and support roles to access this.</div>;
  }
  
  return (
    <div className="super-admin-panel">
      {/* Super admin content */}
    </div>
  );
}
```

## Permission-Based Controls

### Example 4: Resource-Action Permission Check

```tsx
import { usePermission } from '@/hooks/usePermission';

function PatientActions({ patientId }) {
  const { hasPermission, isLoading } = usePermission();
  
  if (isLoading) return <div>Loading...</div>;
  
  const canViewMedicalHistory = hasPermission({
    resource: 'patient',
    action: 'view_medical_history'
  });
  
  const canEditDiagnosis = hasPermission({
    resource: 'patient',
    action: 'edit_diagnosis'
  });
  
  return (
    <div className="patient-actions">
      {canViewMedicalHistory && (
        <button onClick={() => viewMedicalHistory(patientId)}>
          View Medical History
        </button>
      )}
      
      {canEditDiagnosis && (
        <button onClick={() => editDiagnosis(patientId)}>
          Edit Diagnosis
        </button>
      )}
    </div>
  );
}
```

### Example 5: Field-Level Access Control

```tsx
import { usePermission } from '@/hooks/usePermission';

function PatientForm({ patient, onSave }) {
  const { getFieldAccess, isLoading } = usePermission();
  
  if (isLoading) return <div>Loading...</div>;
  
  // Get access settings for specific fields
  const diagnosisAccess = getFieldAccess('patient.diagnosis');
  const notesAccess = getFieldAccess('patient.therapist_notes');
  const emailAccess = getFieldAccess('patient.email');
  
  return (
    <form onSubmit={onSave}>
      <div className="form-group">
        <label>Name</label>
        <input 
          type="text" 
          name="name" 
          defaultValue={patient.name} 
        />
      </div>
      
      {/* Email field with access control */}
      {!emailAccess.hidden && (
        <div className="form-group">
          <label>Email</label>
          <input 
            type="email" 
            name="email" 
            defaultValue={patient.email}
            readOnly={emailAccess.readOnly}
            className={emailAccess.readOnly ? 'read-only' : ''}
          />
        </div>
      )}
      
      {/* Diagnosis field with access control */}
      {!diagnosisAccess.hidden && (
        <div className="form-group">
          <label>Diagnosis</label>
          <textarea 
            name="diagnosis" 
            defaultValue={diagnosisAccess.mask ? '••••••••' : patient.diagnosis}
            readOnly={diagnosisAccess.readOnly}
            className={diagnosisAccess.readOnly ? 'read-only' : ''}
          />
        </div>
      )}
      
      {/* Notes field with access control */}
      {!notesAccess.hidden && (
        <div className="form-group">
          <label>Therapist Notes</label>
          <textarea 
            name="therapistNotes" 
            defaultValue={patient.therapistNotes}
            readOnly={notesAccess.readOnly}
            className={notesAccess.readOnly ? 'read-only' : ''}
          />
        </div>
      )}
      
      <button type="submit">Save</button>
    </form>
  );
}
```

## Component-Based RBAC

### Example 6: Using RoleBasedGuard

```tsx
import { RoleBasedGuard } from '@/components/RoleBasedGuard';

function PatientDetailPage({ patientId }) {
  return (
    <div className="patient-detail">
      <h1>Patient Details</h1>
      
      {/* Basic information visible to all */}
      <PatientBasicInfo patientId={patientId} />
      
      {/* Medical history only visible to therapists and admins */}
      <RoleBasedGuard allowedRoles={['therapist', 'admin']}>
        <div className="section">
          <h2>Medical History</h2>
          <MedicalHistoryViewer patientId={patientId} />
        </div>
      </RoleBasedGuard>
      
      {/* Billing section only visible to admins and support */}
      <RoleBasedGuard 
        allowedRoles={['admin', 'support']} 
        fallback={<div>Contact billing department for information.</div>}
      >
        <div className="section">
          <h2>Billing Information</h2>
          <BillingViewer patientId={patientId} />
        </div>
      </RoleBasedGuard>
      
      {/* Admin-only section */}
      <RoleBasedGuard allowedRoles={['admin']}>
        <div className="section admin-section">
          <h2>Administrative Controls</h2>
          <PatientAdminControls patientId={patientId} />
        </div>
      </RoleBasedGuard>
    </div>
  );
}
```

### Example 7: Using RoleBasedField

```tsx
import RoleBasedField from '@/components/RoleBasedField';

function PatientIntakeForm() {
  return (
    <form className="intake-form">
      <h2>Patient Intake</h2>
      
      {/* Fields visible to all */}
      <div className="form-group">
        <label>First Name</label>
        <input type="text" name="firstName" />
      </div>
      
      <div className="form-group">
        <label>Last Name</label>
        <input type="text" name="lastName" />
      </div>
      
      {/* Email is read-only for support staff */}
      <RoleBasedField
        fieldName="patient.email"
        readOnlyRoles={['support']}
      >
        <div className="form-group">
          <label>Email</label>
          <input type="email" name="email" />
        </div>
      </RoleBasedField>
      
      {/* Medical history only editable by therapists and admins */}
      <RoleBasedField
        fieldName="patient.medical_history"
        allowedRoles={['therapist', 'admin']}
        readOnlyRoles={['support']}
        hiddenRoles={['patient']}
      >
        <div className="form-group">
          <label>Medical History</label>
          <textarea name="medicalHistory" rows={5} />
        </div>
      </RoleBasedField>
      
      {/* Payment info only visible to admins and support */}
      <RoleBasedField
        fieldName="patient.payment_info"
        allowedRoles={['admin']}
        readOnlyRoles={['support']}
        hiddenRoles={['patient', 'therapist']}
      >
        <div className="form-group">
          <label>Payment Information</label>
          <input type="text" name="paymentMethod" />
        </div>
      </RoleBasedField>
      
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Example 8: Role-Protected Routes

```tsx
import RoleProtectedRoute from '@/components/RoleProtectedRoute';

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      
      {/* Patient dashboard - accessible to patients */}
      <Route 
        path="/dashboard" 
        element={
          <RoleProtectedRoute 
            allowedRoles={['patient', 'therapist', 'admin']} 
            redirectPath="/login"
          >
            <Dashboard />
          </RoleProtectedRoute>
        } 
      />
      
      {/* Therapist routes */}
      <Route 
        path="/patients/*" 
        element={
          <RoleProtectedRoute 
            allowedRoles={['therapist', 'admin']} 
            redirectPath="/access-denied"
          >
            <PatientManagement />
          </RoleProtectedRoute>
        } 
      />
      
      {/* Admin routes */}
      <Route 
        path="/admin/*" 
        element={
          <RoleProtectedRoute 
            allowedRoles={['admin']} 
            redirectPath="/access-denied"
          >
            <AdminPanel />
          </RoleProtectedRoute>
        } 
      />
      
      {/* Support routes */}
      <Route 
        path="/support/*" 
        element={
          <RoleProtectedRoute 
            allowedRoles={['support', 'admin']} 
            redirectPath="/access-denied"
          >
            <SupportPortal />
          </RoleProtectedRoute>
        } 
      />
      
      {/* Access denied page */}
      <Route path="/access-denied" element={<AccessDenied />} />
    </Routes>
  );
}
```

## Role Management

### Example 9: Role Management Interface

```tsx
import { useRoleManagement } from '@/hooks/useRoleManagement';
import { useState, useEffect } from 'react';

function UserRoleManager({ userId, userName }) {
  const [availableRoles, setAvailableRoles] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { assignRole, removeRole, listRoles } = useRoleManagement();
  
  // Load roles
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Get all available roles
        const roles = await listRoles();
        setAvailableRoles(roles);
        
        // Get user's current roles
        const { data } = await supabase
          .from('user_roles_view')
          .select('roles')
          .eq('user_id', userId)
          .single();
          
        setUserRoles(data?.roles || []);
      } catch (error) {
        console.error("Error loading roles:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [userId, listRoles]);
  
  const handleAssignRole = async (role) => {
    try {
      await assignRole(userId, role);
      setUserRoles([...userRoles, role]);
    } catch (error) {
      console.error("Error assigning role:", error);
    }
  };
  
  const handleRemoveRole = async (role) => {
    try {
      await removeRole(userId, role);
      setUserRoles(userRoles.filter(r => r !== role));
    } catch (error) {
      console.error("Error removing role:", error);
    }
  };
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div className="user-role-manager">
      <h2>Manage Roles for {userName}</h2>
      
      <div className="current-roles">
        <h3>Current Roles</h3>
        {userRoles.length === 0 ? (
          <p>No roles assigned</p>
        ) : (
          <ul className="role-list">
            {userRoles.map(role => (
              <li key={role} className="role-item">
                <span className="role-badge">{role}</span>
                <button 
                  className="remove-role-btn"
                  onClick={() => handleRemoveRole(role)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="available-roles">
        <h3>Available Roles</h3>
        <ul className="role-list">
          {availableRoles
            .filter(role => !userRoles.includes(role))
            .map(role => (
              <li key={role} className="role-item">
                <span className="role-name">{role}</span>
                <button 
                  className="assign-role-btn"
                  onClick={() => handleAssignRole(role)}
                >
                  Assign
                </button>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
```

## Advanced Patterns

### Example 10: Role-Based Navigation

```tsx
import { useRBAC } from '@/hooks/useRBAC';
import { Link } from 'react-router-dom';

function MainNavigation() {
  const { hasRole, hasAnyRole, isLoading } = useRBAC();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <nav className="main-nav">
      <ul>
        {/* Always visible */}
        <li><Link to="/">Home</Link></li>
        
        {/* Patient Profile - visible to patients and their caregivers */}
        {hasAnyRole(['patient', 'therapist', 'admin']) && (
          <li><Link to="/profile">My Profile</Link></li>
        )}
        
        {/* Appointments - visible to all authenticated users */}
        <li><Link to="/appointments">Appointments</Link></li>
        
        {/* Patient Management - only for therapists and admins */}
        {hasAnyRole(['therapist', 'admin']) && (
          <li><Link to="/patients">Patient Management</Link></li>
        )}
        
        {/* Therapist Management - only for admins */}
        {hasRole('admin') && (
          <li><Link to="/therapists">Therapist Management</Link></li>
        )}
        
        {/* Billing - for support staff and admins */}
        {hasAnyRole(['support', 'admin']) && (
          <li><Link to="/billing">Billing</Link></li>
        )}
        
        {/* Admin Panel - admin only */}
        {hasRole('admin') && (
          <li><Link to="/admin">Admin Panel</Link></li>
        )}
        
        {/* Support Portal - support staff only */}
        {hasRole('support') && (
          <li><Link to="/support-portal">Support Portal</Link></li>
        )}
      </ul>
    </nav>
  );
}
```

### Example 11: Conditional API Calls with Permissions

```tsx
import { usePermission } from '@/hooks/usePermission';
import { useQuery, useMutation } from '@tanstack/react-query';

function PatientDataManager({ patientId }) {
  const { hasPermission } = usePermission();
  
  // Check permissions
  const canViewFullHistory = hasPermission({
    resource: 'patient',
    action: 'view_full_history'
  });
  
  const canEditRecords = hasPermission({
    resource: 'patient',
    action: 'edit_records'
  });
  
  // Fetch patient data with permission-based query parameters
  const { data: patientData, isLoading } = useQuery({
    queryKey: ['patient', patientId, { fullHistory: canViewFullHistory }],
    queryFn: async () => {
      const { data } = await supabase
        .from('patients')
        .select(`
          *,
          ${canViewFullHistory ? 'medical_history(*)' : ''}
        `)
        .eq('id', patientId)
        .single();
      
      return data;
    },
    enabled: !!patientId
  });
  
  // Edit mutation only enabled if user has permission
  const mutation = useMutation({
    mutationFn: async (updatedData) => {
      if (!canEditRecords) {
        throw new Error("You don't have permission to edit patient records");
      }
      
      const { data, error } = await supabase
        .from('patients')
        .update(updatedData)
        .eq('id', patientId);
        
      if (error) throw error;
      return data;
    }
  });
  
  // Component rendering logic
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div className="patient-data-manager">
      <h2>{patientData.name}'s Records</h2>
      
      {/* Basic info always visible */}
      <div className="basic-info">
        {/* ... display basic info ... */}
      </div>
      
      {/* Medical history conditionally displayed */}
      {canViewFullHistory && patientData.medical_history && (
        <div className="medical-history">
          <h3>Medical History</h3>
          {/* ... display medical history ... */}
        </div>
      )}
      
      {/* Edit form only if user has permission */}
      {canEditRecords && (
        <div className="edit-section">
          <h3>Edit Patient Information</h3>
          <form onSubmit={/* ... form submission logic ... */}>
            {/* ... form fields ... */}
            <button type="submit">Save Changes</button>
          </form>
        </div>
      )}
    </div>
  );
}
```

### Example 12: Role-Based Error Boundaries

```tsx
import { Component, ErrorInfo, ReactNode } from 'react';
import { useRBAC } from '@/hooks/useRBAC';

// Error boundary component
class RoleAwareErrorBoundary extends Component<{
  children: ReactNode;
  fallback: ReactNode;
  showDetails: boolean;
}> {
  state = { hasError: false, error: null, errorInfo: null };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log error to your monitoring system
    console.error("Error caught by RoleAwareErrorBoundary:", error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      // If showing details is allowed, include the error information
      if (this.props.showDetails) {
        return (
          <div className="error-boundary">
            <h2>Something went wrong</h2>
            <details>
              <summary>Error Details</summary>
              <p>{this.state.error?.toString()}</p>
              <pre>{this.state.errorInfo?.componentStack}</pre>
            </details>
          </div>
        );
      }
      
      // Otherwise, show the fallback
      return this.props.fallback;
    }
    
    return this.props.children;
  }
}

// Wrapper component that checks roles
function RoleBasedErrorBoundary({ 
  children, 
  adminFallback, 
  userFallback 
}) {
  const { hasRole } = useRBAC();
  const isAdmin = hasRole('admin');
  
  return (
    <RoleAwareErrorBoundary
      fallback={isAdmin ? adminFallback : userFallback}
      showDetails={isAdmin}
    >
      {children}
    </RoleAwareErrorBoundary>
  );
}

// Usage
function App() {
  return (
    <RoleBasedErrorBoundary
      adminFallback={<AdminErrorView />}
      userFallback={<UserFriendlyError />}
    >
      <MainApplication />
    </RoleBasedErrorBoundary>
  );
}
```

## Performance Patterns

### Example 13: Memoized Role Checks

```tsx
import { useMemoizedRoleCheck, useMemoizedPermissionCheck } from '@/utils/performance/selective-rerendering';

// This component only re-renders when the admin role changes
function AdminOnlyFeature() {
  // Using the memoized hook
  const isAdmin = useMemoizedRoleCheck('admin');
  
  console.log('AdminOnlyFeature render');
  
  if (!isAdmin) return null;
  
  return (
    <div className="admin-feature">
      <h2>Admin-Only Feature</h2>
      <p>This section only renders for administrators.</p>
    </div>
  );
}

// This component only re-renders when a specific permission changes
function EditPatientButton({ patientId }) {
  // Using memoized permission check
  const canEditPatient = useMemoizedPermissionCheck({
    resource: 'patient',
    action: 'edit'
  });
  
  console.log('EditPatientButton render');
  
  if (!canEditPatient) return null;
  
  return (
    <button onClick={() => editPatient(patientId)}>
      Edit Patient
    </button>
  );
}
```

### Example 14: Using Higher-Order Components for Optimization

```tsx
import { withMemoizedRoles, withMemoizedPermissions } from '@/utils/performance/selective-rerendering';

// Original component
function UserActions({ userId, isAdmin, canEditUser, canDeleteUser }) {
  return (
    <div className="user-actions">
      {canEditUser && (
        <button onClick={() => editUser(userId)}>Edit</button>
      )}
      
      {canDeleteUser && (
        <button onClick={() => deleteUser(userId)}>Delete</button>
      )}
      
      {isAdmin && (
        <button onClick={() => impersonateUser(userId)}>Impersonate</button>
      )}
    </div>
  );
}

// Wrap with memoized roles HOC
const MemoizedUserActions = withMemoizedRoles(UserActions, {
  roleProps: {
    isAdmin: 'admin'
  },
  permissionProps: {
    canEditUser: { resource: 'user', action: 'edit' },
    canDeleteUser: { resource: 'user', action: 'delete' }
  }
});

// Usage remains simple
function UserList() {
  const users = useUsers();
  
  return (
    <div className="user-list">
      {users.map(user => (
        <div key={user.id} className="user-item">
          <UserInfo user={user} />
          <MemoizedUserActions userId={user.id} />
        </div>
      ))}
    </div>
  );
}
```

## Security Patterns

### Example 15: Combined Client and Server Validation

```tsx
// Client-side component
function DeleteUserButton({ userId }) {
  const { hasRole } = useRBAC();
  const isAdmin = hasRole('admin');
  
  // Client-side check
  if (!isAdmin) return null;
  
  const handleDelete = async () => {
    try {
      // Call server function that also validates permissions
      const { error } = await supabase.rpc('delete_user_secure', {
        target_user_id: userId
      });
      
      if (error) throw error;
      
      // Handle success
    } catch (error) {
      // Handle error
      console.error('Error deleting user:', error);
    }
  };
  
  return (
    <button onClick={handleDelete} className="btn btn-danger">
      Delete User
    </button>
  );
}

// Server-side function (in Supabase)
/* SQL
CREATE OR REPLACE FUNCTION delete_user_secure(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  -- Check if the current user is an admin
  SELECT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'admin'
  ) INTO v_is_admin;
  
  -- If not admin, deny the operation
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Permission denied: Only admins can delete users';
  END IF;
  
  -- Proceed with deletion
  DELETE FROM auth.users WHERE id = target_user_id;
  
  -- Log the action
  INSERT INTO audit_logs (
    user_id,
    activity_type,
    resource_type,
    resource_id,
    metadata
  ) VALUES (
    auth.uid(),
    'user_deleted',
    'users',
    target_user_id::text,
    jsonb_build_object(
      'performer', auth.uid(),
      'timestamp', now()
    )
  );
  
  RETURN TRUE;
END;
$$;
*/
```

## Integration Patterns

### Example 16: Integrating RBAC with React Query

```tsx
import { useRBAC } from '@/hooks/useRBAC';
import { useQuery } from '@tanstack/react-query';

function PatientDirectory() {
  const { hasRole, isLoading: rolesLoading } = useRBAC();
  const isAdmin = hasRole('admin');
  const isTherapist = hasRole('therapist');
  
  // Different queries based on role
  const { data: patients, isLoading: patientsLoading } = useQuery({
    queryKey: ['patients', { isAdmin, isTherapist }],
    queryFn: async () => {
      let query = supabase.from('patients').select('*');
      
      // Admins can see all patients
      if (isAdmin) {
        // No filtering needed
      } 
      // Therapists can only see their assigned patients
      else if (isTherapist) {
        query = query.eq('therapist_id', auth.user().id);
      } 
      // Other roles can only see themselves
      else {
        query = query.eq('id', auth.user().id);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
    // Only run the query when role loading is complete
    enabled: !rolesLoading
  });
  
  if (rolesLoading || patientsLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="patient-directory">
      <h1>Patient Directory</h1>
      
      {patients.length === 0 ? (
        <p>No patients found.</p>
      ) : (
        <table className="patients-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map(patient => (
              <tr key={patient.id}>
                <td>{patient.name}</td>
                <td>{patient.email}</td>
                <td>{patient.status}</td>
                <td>
                  <div className="actions">
                    <button onClick={() => viewPatient(patient.id)}>
                      View
                    </button>
                    
                    {/* Only admins and therapists can edit */}
                    {(isAdmin || isTherapist) && (
                      <button onClick={() => editPatient(patient.id)}>
                        Edit
                      </button>
                    )}
                    
                    {/* Only admins can delete */}
                    {isAdmin && (
                      <button 
                        className="delete-btn"
                        onClick={() => deletePatient(patient.id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

### Example 17: RBAC with Form Libraries (React Hook Form)

```tsx
import { useForm } from 'react-hook-form';
import { usePermission } from '@/hooks/usePermission';

function PatientEditForm({ patient, onSubmit }) {
  const { getFieldAccess, isLoading } = usePermission();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: patient
  });
  
  if (isLoading) return <div>Loading...</div>;
  
  // Get field access for each field
  const nameAccess = getFieldAccess('patient.name');
  const emailAccess = getFieldAccess('patient.email');
  const diagnosisAccess = getFieldAccess('patient.diagnosis');
  const notesAccess = getFieldAccess('patient.notes');
  
  const processSubmit = (data) => {
    // Only include fields the user can edit
    const submittableData = {
      ...(nameAccess.readOnly ? {} : { name: data.name }),
      ...(emailAccess.readOnly ? {} : { email: data.email }),
      ...(diagnosisAccess.readOnly ? {} : { diagnosis: data.diagnosis }),
      ...(notesAccess.readOnly ? {} : { notes: data.notes })
    };
    
    onSubmit(submittableData);
  };
  
  return (
    <form onSubmit={handleSubmit(processSubmit)}>
      {/* Name field */}
      {!nameAccess.hidden && (
        <div className="form-group">
          <label>Name</label>
          <input
            {...register('name', { required: !nameAccess.readOnly })}
            readOnly={nameAccess.readOnly}
            className={nameAccess.readOnly ? 'read-only' : ''}
          />
          {errors.name && <span className="error">Name is required</span>}
        </div>
      )}
      
      {/* Email field */}
      {!emailAccess.hidden && (
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            {...register('email', { 
              required: !emailAccess.readOnly,
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address"
              }
            })}
            readOnly={emailAccess.readOnly}
            className={emailAccess.readOnly ? 'read-only' : ''}
          />
          {errors.email && <span className="error">{errors.email.message}</span>}
        </div>
      )}
      
      {/* Diagnosis field */}
      {!diagnosisAccess.hidden && (
        <div className="form-group">
          <label>Diagnosis</label>
          <textarea
            {...register('diagnosis')}
            readOnly={diagnosisAccess.readOnly}
            className={diagnosisAccess.readOnly ? 'read-only' : ''}
          />
        </div>
      )}
      
      {/* Notes field */}
      {!notesAccess.hidden && (
        <div className="form-group">
          <label>Notes</label>
          <textarea
            {...register('notes')}
            readOnly={notesAccess.readOnly}
            className={notesAccess.readOnly ? 'read-only' : ''}
          />
        </div>
      )}
      
      <button type="submit">Save Changes</button>
    </form>
  );
}
```

These examples demonstrate a variety of patterns for implementing RBAC in your application. By following these patterns, you can create a secure, maintainable, and user-friendly system that enforces proper access control at multiple levels.
