
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  testComponentRenders,
  testHookPerformance,
  testToastPerformance,
  testRbacComponentAccess
} from '@/utils/rbac-testing-tools';
import { useRBAC } from '@/hooks/useRBAC';
import { usePermission } from '@/hooks/use-permission';
import RoleBasedContainer from '@/components/RoleBasedContainer';
import RoleBasedGuard from '@/components/RoleBasedGuard';
import { toast } from '@/hooks/use-toast';
import React, { useState } from 'react';

// Mock the hooks
vi.mock('@/hooks/useRBAC', () => ({
  useRBAC: vi.fn().mockImplementation(() => ({
    roles: ['patient'],
    isLoading: false,
    hasAnyRole: (roles: string[]) => roles.includes('patient'),
    hasAllRoles: (roles: string[]) => roles.every(role => role === 'patient'),
    error: null,
  })),
}));

vi.mock('@/hooks/use-permission', () => ({
  usePermission: vi.fn().mockImplementation(() => ({
    isLoading: false,
    checkPermissions: () => true,
    getFieldAccess: () => ({ readOnly: false, hidden: false, mask: false }),
  })),
}));

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
  useToast: () => ({ toast: vi.fn() }),
}));

// Wrapper component for toast testing
const ToastTester: React.FC<{ message: string }> = ({ message }) => {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    setCount(prev => prev + 1);
    toast({
      title: "Toast Test",
      description: `${message} (${count})`,
    });
  };
  
  return (
    <button onClick={handleClick} data-testid="toast-btn">
      Show Toast ({count})
    </button>
  );
};

describe('RBAC Components Performance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  test('RoleBasedContainer renders efficiently', () => {
    // Test component render optimization
    const perfResults = testComponentRenders(
      'RoleBasedContainer',
      () => (
        <RoleBasedContainer allowedRoles={['patient']}>
          <div>Protected Content</div>
        </RoleBasedContainer>
      ),
      () => {
        // Change a prop that shouldn't cause unnecessary re-renders
        (useRBAC as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
          roles: ['patient'],
          isLoading: false,
          hasAnyRole: (roles: string[]) => roles.includes('patient'),
          hasAllRoles: (roles: string[]) => roles.every(role => role === 'patient'),
          error: null,
        }));
      }
    );
    
    expect(perfResults.renderCount).toBeLessThanOrEqual(3);
    expect(perfResults.isOptimized).toBe(true);
  });
  
  test('Toast system does not cause unnecessary re-renders', async () => {
    render(<ToastTester message="Test Message" />);
    
    // Measure toast performance
    const toastPerf = testToastPerformance(() => {
      fireEvent.click(screen.getByTestId('toast-btn'));
    }, 3);
    
    // If toast is optimized properly, the average should be reasonable
    expect(toastPerf.averageTime).toBeLessThan(100); // Adjust this threshold as needed
  });
  
  test('Multiple role checks do not cause performance issues', () => {
    const renderCounts = [0, 0];
    
    const TestComponent = () => {
      renderCounts[0]++;
      const { hasAnyRole } = useRBAC();
      
      // Multiple role checks in the same component
      const canViewUsers = hasAnyRole(['admin', 'support']);
      const canEditRoles = hasAnyRole(['admin']);
      const canViewReports = hasAnyRole(['admin', 'therapist']);
      
      return (
        <div>
          {canViewUsers && <div data-testid="users-section">Users</div>}
          {canEditRoles && <div data-testid="roles-section">Roles</div>}
          {canViewReports && <div data-testid="reports-section">Reports</div>}
        </div>
      );
    };
    
    // First render
    const { rerender } = render(<TestComponent />);
    
    // Update props (which shouldn't cause unnecessary rerenders)
    (useRBAC as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      roles: ['patient', 'admin'],
      isLoading: false,
      hasAnyRole: (roles: string[]) => roles.some(role => ['patient', 'admin'].includes(role)),
      hasAllRoles: (roles: string[]) => roles.every(role => ['patient', 'admin'].includes(role)),
      error: null,
    }));
    
    // Second render
    rerender(<TestComponent />);
    
    // Expect efficient rendering (only 2 renders total)
    expect(renderCounts[0]).toBeLessThanOrEqual(2);
    
    // Verify correct rendering based on roles
    expect(screen.getByTestId('users-section')).toBeInTheDocument();
    expect(screen.getByTestId('roles-section')).toBeInTheDocument();
    expect(screen.getByTestId('reports-section')).toBeInTheDocument();
  });
});

describe('RBAC Hooks Performance', () => {
  test('useRBAC hook performs efficiently with repeated calls', async () => {
    (useRBAC as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      roles: ['patient'],
      isLoading: false,
      hasAnyRole: vi.fn().mockImplementation((roles: string[]) => roles.includes('patient')),
      hasAllRoles: vi.fn().mockImplementation((roles: string[]) => roles.every(role => role === 'patient')),
      refreshRoles: vi.fn().mockResolvedValue(undefined),
      error: null,
    }));
    
    const hookPerf = testHookPerformance(
      'useRBAC',
      () => useRBAC(),
      async (hook) => {
        // Multiple role checks (simulates real-world usage)
        for (let i = 0; i < 10; i++) {
          hook.hasAnyRole(['admin', 'patient']);
          hook.hasAllRoles(['patient']);
        }
        if (hook.refreshRoles) {
          await hook.refreshRoles();
        }
      }
    );
    
    // Set reasonable performance expectations
    expect(hookPerf.initialRenderTime).toBeLessThan(100);
    expect(hookPerf.actionTime).toBeLessThan(200);
  });
});

describe('RBAC Components Type Safety', () => {
  test('RoleBasedGuard handles different role configurations correctly', () => {
    const roles = ['admin', 'patient', 'therapist', 'support'];
    
    // Test with various roles to ensure correct behavior
    roles.forEach(role => {
      // Set up the mock for this specific role
      (useRBAC as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        roles: [role],
        isLoading: false,
        hasAnyRole: (testRoles: string[]) => testRoles.includes(role),
        hasAllRoles: (testRoles: string[]) => testRoles.every(r => r === role),
        error: null,
      }));
      
      const { queryByTestId } = render(
        <RoleBasedGuard
          allowedRoles={['admin']}
          fallback={<div data-testid="fallback">Access Denied</div>}
        >
          <div data-testid="protected">Protected Content</div>
        </RoleBasedGuard>
      );
      
      if (role === 'admin') {
        expect(queryByTestId('protected')).toBeInTheDocument();
        expect(queryByTestId('fallback')).not.toBeInTheDocument();
      } else {
        expect(queryByTestId('protected')).not.toBeInTheDocument();
        expect(queryByTestId('fallback')).toBeInTheDocument();
      }
    });
  });
  
  test('Role components work correctly with TypeScript type constraints', () => {
    // This test verifies that components work with the UserRole type
    // In real code, TypeScript would catch this at compile time
    
    // Test with valid role
    (useRBAC as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      roles: ['admin'],
      isLoading: false,
      hasAnyRole: () => true,
      hasAllRoles: () => true,
      error: null,
    }));
    
    const { getByTestId } = render(
      <RoleBasedContainer allowedRoles={['admin']}>
        <div data-testid="content">Type-safe content</div>
      </RoleBasedContainer>
    );
    
    expect(getByTestId('content')).toBeInTheDocument();
  });
});
