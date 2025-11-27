
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AuthRBACProvider, useAuthRBAC } from '@/contexts/AuthRBACContext';
import '@testing-library/jest-dom';
import { mockSupabase } from '../mocks/supabaseMock';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

// Create a test component that uses the AuthRBACContext
const TestComponent = () => {
  const { user, loading, hasRole, getFieldAccess } = useAuthRBAC();
  
  return (
    <div>
      <div data-testid="loading-state">{loading ? 'Loading' : 'Not Loading'}</div>
      {user && <div data-testid="user-id">{user.id}</div>}
      <div data-testid="has-admin-role">{hasRole('admin') ? 'Yes' : 'No'}</div>
      <div data-testid="field-access">{JSON.stringify(getFieldAccess('testField'))}</div>
    </div>
  );
};

describe('AuthRBACProvider', () => {
  it('provides initial loading state', () => {
    render(
      <AuthRBACProvider>
        <TestComponent />
      </AuthRBACProvider>
    );
    
    expect(screen.getByTestId('loading-state')).toHaveTextContent('Loading');
  });
  
  it('provides user, roles, and field access', async () => {
    // Mock resolved auth state
    vi.spyOn(mockSupabase.auth, 'getSession').mockResolvedValueOnce({
      data: {
        session: {
          user: {
            id: 'test-user-id',
            user_metadata: {
              roles: ['admin']
            }
          }
        }
      }
    });
    
    await act(async () => {
      render(
        <AuthRBACProvider>
          <TestComponent />
        </AuthRBACProvider>
      );
    });
    
    expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    expect(screen.getByTestId('user-id')).toHaveTextContent('test-user-id');
    expect(screen.getByTestId('has-admin-role')).toHaveTextContent('Yes');
    expect(screen.getByTestId('field-access')).toBeTruthy();
  });
});
