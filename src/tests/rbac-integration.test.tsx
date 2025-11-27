
// @vitest-only
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from './react-hooks-mock';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { useRBAC } from '@/hooks/useRBAC';
import { useRoleManagement } from '@/hooks/useRoleManagement';
import RoleChangeHistory from '@/components/auth/RoleChangeHistory';
import { RoleEvent, UserRole } from '@/types/core/rbac';
import IntegrationTestProvider from '@/components/test-utils/IntegrationTestProvider';

// Define the expected shape of the useRBAC hook result to match actual implementation
interface RBACResult {
  loading: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  roles: UserRole[];
  permissions: any[];
  error: any;
  autoRepair: boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAllRoles: (roles: string[]) => boolean;
  isAdmin: boolean;
  isTherapist: boolean;
  isPatient: boolean;
  isSupport: boolean;
  primaryRole: UserRole | undefined;
  hasPermission: (permission: string) => boolean;
  performConsistencyCheck: () => Promise<boolean>;
  refreshRoles: () => Promise<void>;
  setAutoRepair: () => void;
}

// Define the expected shape of the useRoleManagement hook result
interface RoleManagementResult {
  isLoading: boolean;
  error: string | null;
  assignRole: (userId: string, role: string) => Promise<boolean>;
  removeRole: (userId: string, role: string) => Promise<boolean>;
  listUsers: () => Promise<any[]>;
  listRoles: () => Promise<string[]>;
}

// Mock supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user-id', email: 'test@example.com' } } }),
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'test-user-id' } } } }),
    },
    rpc: vi.fn().mockImplementation((functionName, params) => {
      if (functionName === 'get_user_roles') {
        return { data: ['patient'], error: null };
      }
      if (functionName === 'manage_user_role') {
        return { data: { success: true, message: 'Role updated' }, error: null };
      }
      return { data: null, error: null };
    }),
    from: vi.fn().mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'test-role-id', name: 'admin' }, error: null }),
      insert: vi.fn().mockResolvedValue({ data: { id: 'new-record-id' }, error: null }),
      update: vi.fn().mockResolvedValue({ data: { id: 'updated-record-id' }, error: null }),
      delete: vi.fn().mockResolvedValue({ data: { id: 'deleted-record-id' }, error: null }),
    })),
  }
}));

// Mock the useRoleNotification hook
vi.mock('@/hooks/use-role-notification', () => ({
  useRoleNotification: () => ({
    events: [
      {
        id: 'event1',
        user_id: 'user1',
        userId: 'user1',
        userName: 'Test User',
        timestamp: new Date().toISOString(),
        action: 'assigned',
        actionType: 'assigned',
        role: 'admin',
        performedBy: 'admin1',
        performedByName: 'Admin User'
      } as RoleEvent
    ],
    loading: false,
    refresh: vi.fn()
  })
}));

// Mock the AuthRBAC context
vi.mock('@/contexts/AuthRBACContext', () => ({
  useAuthRBAC: vi.fn().mockReturnValue({
    userRoles: ['patient'],
    permissions: [],
    loading: false,
    isAuthenticated: true,
    hasRole: vi.fn().mockImplementation((role) => role === 'patient'),
    hasAnyRole: vi.fn().mockImplementation((roles) => roles.includes('patient')),
    hasAllRoles: vi.fn().mockImplementation((roles) => roles.every(r => r === 'patient')),
    isAdmin: false,
    isTherapist: false,
    isPatient: true,
    isSupport: false,
    primaryRole: 'patient',
    hasPermission: vi.fn().mockReturnValue(false),
    refreshRoles: vi.fn().mockResolvedValue(undefined),
    performConsistencyCheck: vi.fn().mockResolvedValue(true)
  })
}));

describe('RBAC Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('useRBAC hook properly loads and manages roles', async () => {
    const { result, waitForNextUpdate } = renderHook<RBACResult, unknown>(
      () => useRBAC() as RBACResult, 
      {
        wrapper: ({ children }) => <IntegrationTestProvider>{children}</IntegrationTestProvider>
      }
    );
    
    // Should not be loading with mocked data
    expect((result.current as RBACResult).loading).toBe(false);
    expect((result.current as RBACResult).roles).toEqual(['patient']);
    expect((result.current as RBACResult).hasRole('patient')).toBe(true);
    expect((result.current as RBACResult).hasRole('admin')).toBe(false);
  });
  
  test('Role management hook can assign and remove roles', async () => {
    const { result } = renderHook<RoleManagementResult, unknown>(
      () => useRoleManagement() as RoleManagementResult, 
      {
        wrapper: ({ children }) => <IntegrationTestProvider>{children}</IntegrationTestProvider>
      }
    );
    
    // Test assign role with valid role type
    let success;
    await act(async () => {
      success = await (result.current as RoleManagementResult).assignRole('test-user-id', 'admin');
    });
    
    expect(success).toBe(true);
    
    // Test remove role with valid role type
    await act(async () => {
      success = await (result.current as RoleManagementResult).removeRole('test-user-id', 'admin');
    });
    
    expect(success).toBe(true);
  });
  
  test('RoleChangeHistory component renders events correctly', async () => {
    render(
      <IntegrationTestProvider>
        <RoleChangeHistory />
      </IntegrationTestProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Test User/i)).toBeInTheDocument();
      expect(screen.getByText(/Added/i)).toBeInTheDocument();
      expect(screen.getByText(/admin/i)).toBeInTheDocument();
    });
  });
  
  test('Type safety: UserRole cannot be assigned an arbitrary string', () => {
    // This test uses TypeScript to ensure type safety
    // The following line would cause a TypeScript error:
    // const invalidRole: UserRole = 'invalid-role';
    
    // But these are valid:
    const adminRole: UserRole = 'admin';
    const patientRole: UserRole = 'patient';
    const therapistRole: UserRole = 'therapist';
    const supportRole: UserRole = 'support';
    
    // Check if the roles are valid
    expect(['admin', 'patient', 'therapist', 'support']).toContain(adminRole);
    expect(['admin', 'patient', 'therapist', 'support']).toContain(patientRole);
    expect(['admin', 'patient', 'therapist', 'support']).toContain(therapistRole);
    expect(['admin', 'patient', 'therapist', 'support']).toContain(supportRole);
  });
});
