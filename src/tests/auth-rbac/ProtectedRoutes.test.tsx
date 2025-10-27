
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RoleProtectedRoute from '@/components/RoleProtectedRoute';
import PermissionProtectedRoute from '@/components/PermissionProtectedRoute';
import '@testing-library/jest-dom';
import { vi, describe, it, expect } from 'vitest';

// Mock AuthRBACContext
const mockHasRole = vi.fn().mockReturnValue(false);
const mockHasAnyRole = vi.fn().mockReturnValue(false);
const mockHasAllRoles = vi.fn().mockReturnValue(false);
const mockCheckPermissions = vi.fn().mockReturnValue(false);
const mockUser = { id: 'test-user-id' };

vi.mock('@/contexts/AuthRBACContext', () => ({
  useAuthRBAC: () => ({
    user: mockUser,
    loading: false,
    hasRole: mockHasRole,
    hasAnyRole: mockHasAnyRole,
    hasAllRoles: mockHasAllRoles,
    checkPermissions: mockCheckPermissions,
    roles: ['user']
  })
}));

// Mock useToast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

describe('Protected Routes', () => {
  describe('RoleProtectedRoute', () => {
    it('redirects when user does not have required role', () => {
      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/dashboard" element={<div data-testid="dashboard">Dashboard</div>} />
            <Route
              path="/protected"
              element={
                <RoleProtectedRoute 
                  allowedRoles={['admin']} 
                  redirectPath="/dashboard"
                >
                  <div>Protected Content</div>
                </RoleProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );
      
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });
  });
  
  describe('PermissionProtectedRoute', () => {
    it('redirects when user does not have required permissions', () => {
      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/dashboard" element={<div data-testid="dashboard">Dashboard</div>} />
            <Route
              path="/protected"
              element={
                <PermissionProtectedRoute 
                  permissions={[{ resource: 'users', action: 'manage', level: 'admin' }]} 
                  redirectPath="/dashboard"
                >
                  <div>Protected Content</div>
                </PermissionProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );
      
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });
  });
});
