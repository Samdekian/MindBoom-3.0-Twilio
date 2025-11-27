
// @vitest-only
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { UserRole } from '@/types/core/rbac';

// Setup mocks for global objects
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Mock for IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock for window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Add additional mocks for RBAC tests
vi.mock('@/utils/rbac-tester', () => ({
  testScenario: vi.fn(),
  performSecurityAudit: vi.fn().mockResolvedValue({
    timestamp: new Date(),
    passedTests: 5,
    failedTests: 0,
    vulnerabilitiesFound: []
  }),
  testRouteAccess: vi.fn(),
  testOperationPermission: vi.fn(),
  rbacRouteTests: [
    { path: '/admin', allowedRoles: ['admin'], testId: 'admin-route' },
    { path: '/dashboard', allowedRoles: ['admin', 'patient', 'therapist', 'support'], testId: 'dashboard-route' }
  ],
  rbacOperationTests: [
    { operation: 'manage-users', allowedRoles: ['admin'], testId: 'manage-users-op' },
    { operation: 'view-profile', allowedRoles: ['admin', 'patient', 'therapist', 'support'], testId: 'view-profile-op' }
  ],
}));

// Helper function to setup role scenarios
export function setupRoleScenario(role: UserRole | null) {
  const mockRoles = role ? [role] : [];
  
  vi.mocked(vi.importActual('@/hooks/useRBAC') as any).mockImplementation(() => ({
    roles: mockRoles,
    loading: false,
    hasRole: (testRole: string) => mockRoles.includes(testRole as UserRole),
    hasAnyRole: (testRoles: string[]) => testRoles.some(r => mockRoles.includes(r as UserRole)),
    hasAllRoles: (testRoles: string[]) => testRoles.every(r => mockRoles.includes(r as UserRole)),
    error: null,
  }));
}

// Export a sentinel value to prevent tree-shaking
export const testEnvironmentSetup = true;
