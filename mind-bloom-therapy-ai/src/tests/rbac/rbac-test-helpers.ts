// @vitest-only
import { beforeEach, afterEach, vi } from 'vitest';
import { act } from '@testing-library/react';
import { UserRole } from '@/types/core/rbac';
import { IntegrationTestProvider } from '@/components/test-utils/IntegrationTestProvider';
import { renderHook } from '@testing-library/react-hooks';
import { useRBAC } from '@/hooks/useRBAC';
import { usePermission } from '@/hooks/use-permission';

export type RBACTestContext = {
  mockRole: (role: UserRole | null) => void;
  mockPermissions: (permissions: Record<string, boolean>) => void;
  mockFieldAccess: (fieldName: string, access: { readOnly: boolean; hidden: boolean; mask: boolean }) => void;
  clearMocks: () => void;
};

/**
 * Setup RBAC testing environment with proper mocks
 * @returns Testing context with helper methods
 */
export function setupRBACTestEnvironment(): RBACTestContext {
  // Mock state for permissions and field access
  const mockPermissionsState: Record<string, boolean> = {};
  const mockFieldAccessState: Record<string, { readOnly: boolean; hidden: boolean; mask: boolean }> = {};
  
  // Mock for useRBAC
  const rbacMock = vi.fn().mockImplementation((userRole: UserRole | null) => ({
    roles: userRole ? [userRole] : [],
    isLoading: false,
    hasRole: (role: string) => userRole === role,
    hasAnyRole: (roles: string[]) => userRole ? roles.includes(userRole) : false,
    hasAllRoles: (roles: string[]) => userRole ? roles.every(r => r === userRole) : false,
    error: null,
    isAuthenticated: !!userRole
  }));
  
  // Mock for usePermission
  const permissionMock = vi.fn().mockImplementation(() => ({
    isLoading: false,
    checkPermissions: (permissions: any[]) => {
      // If any permission is explicitly set to false, return false
      return !permissions.some(p => {
        const key = `${p.resource}.${p.action}`;
        return mockPermissionsState[key] === false;
      });
    },
    getFieldAccess: (fieldName: string) => {
      return mockFieldAccessState[fieldName] || {
        readOnly: false, 
        hidden: false, 
        mask: false
      };
    }
  }));
  
  // Setup mocks
  vi.mock('@/hooks/useRBAC', () => ({
    useRBAC: () => rbacMock(null), // Default to no role
    UserRole: {
      ADMIN: 'admin',
      THERAPIST: 'therapist',
      PATIENT: 'patient',
      SUPPORT: 'support'
    }
  }));
  
  vi.mock('@/hooks/use-permission', () => ({
    usePermission: () => permissionMock()
  }));
  
  // Clear mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(mockPermissionsState).forEach(key => delete mockPermissionsState[key]);
    Object.keys(mockFieldAccessState).forEach(key => delete mockFieldAccessState[key]);
  });
  
  // Update hook mock with new role
  const mockRole = (role: UserRole | null) => {
    vi.mocked(rbacMock).mockImplementation(() => ({
      roles: role ? [role] : [],
      isLoading: false,
      hasRole: (r: string) => role === r,
      hasAnyRole: (roles: string[]) => role ? roles.includes(role) : false,
      hasAllRoles: (roles: string[]) => role ? roles.every(r => r === role) : false,
      error: null,
      isAuthenticated: !!role
    }));
  };
  
  // Update permission mock
  const mockPermissions = (permissions: Record<string, boolean>) => {
    Object.entries(permissions).forEach(([key, value]) => {
      mockPermissionsState[key] = value;
    });
  };
  
  // Update field access mock
  const mockFieldAccess = (
    fieldName: string, 
    access: { readOnly: boolean; hidden: boolean; mask: boolean }
  ) => {
    mockFieldAccessState[fieldName] = access;
  };
  
  // Reset all mocks
  const clearMocks = () => {
    vi.resetAllMocks();
    Object.keys(mockPermissionsState).forEach(key => delete mockPermissionsState[key]);
    Object.keys(mockFieldAccessState).forEach(key => delete mockFieldAccessState[key]);
  };
  
  afterEach(() => {
    clearMocks();
  });
  
  return {
    mockRole,
    mockPermissions,
    mockFieldAccess,
    clearMocks
  };
}

/**
 * Test helper that verifies component behavior with different roles
 * @param render Function that renders the component to test
 * @param expectations Map of roles to expected behaviors
 */
export async function testWithRoles<T = any>(
  render: () => T,
  expectations: Record<UserRole | 'unauthenticated', (result: T) => void>
) {
  const roles: (UserRole | 'unauthenticated')[] = [
    'admin', 'therapist', 'patient', 'support', 'unauthenticated'
  ];
  
  const { mockRole } = setupRBACTestEnvironment();
  
  // Test each role scenario
  for (const role of roles) {
    if (expectations[role]) {
      // Set up the role
      mockRole(role === 'unauthenticated' ? null : role as UserRole);
      
      // Render and test
      const result = render();
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0)); // Wait for renders to complete
      });
      
      // Run the expectation for this role
      expectations[role](result);
    }
  }
}

// This ensures the file is treated as a module
export default {};
