
// @vitest-only
import { vi } from 'vitest';
import { UserRole } from '@/types/core/rbac';

/**
 * Configure the RBAC hooks for testing with a specific role
 * @param role The role to set for the current test
 */
export function setupRoleScenario(role: UserRole | null) {
  const mockRoles = role ? [role] : [];
  
  // Mock useRBAC hook
  vi.mock('@/hooks/useRBAC', () => ({
    useRBAC: vi.fn(() => ({
      roles: mockRoles,
      isLoading: false,
      hasRole: (testRole: string) => mockRoles.includes(testRole as UserRole),
      hasAnyRole: (testRoles: string[]) => testRoles.some(r => mockRoles.includes(r as UserRole)),
      hasAllRoles: (testRoles: string[]) => testRoles.every(r => mockRoles.includes(r as UserRole)),
      error: null,
    })),
  }));
  
  // Mock usePermission hook with role-specific behavior
  vi.mock('@/hooks/use-permission', () => ({
    usePermission: vi.fn(() => {
      // Default permissions for the role
      const fieldPermissions: Record<string, Record<string, boolean>> = {
        patient: {
          'patient.medical': true,
          'patient.diagnosis': false,
          'patient.billing': false
        },
        therapist: {
          'patient.medical': true,
          'patient.diagnosis': true,
          'patient.billing': true,
          'therapist.schedule': true
        },
        admin: {
          // Admins have access to everything
        },
        support: {
          'patient.billing': true,
          'support.tickets': true
        }
      };
      
      return {
        isLoading: false,
        checkPermissions: () => role === 'admin' ? true : Math.random() > 0.2,
        getFieldAccess: (fieldName: string) => {
          if (role === 'admin') {
            return { readOnly: false, hidden: false, mask: false };
          }
          
          if (!role) {
            return { readOnly: true, hidden: true, mask: true };
          }
          
          const rolePermissions = fieldPermissions[role] || {};
          const hasAccess = rolePermissions[fieldName] !== false;
          
          return {
            readOnly: role === 'patient' && fieldName.includes('diagnosis'),
            hidden: !hasAccess,
            mask: role === 'support' && fieldName.includes('ssn')
          };
        }
      };
    })
  }));
}

/**
 * Reset all mocks after each test
 */
export function resetRoleMocks() {
  vi.resetAllMocks();
  vi.resetModules();
}
