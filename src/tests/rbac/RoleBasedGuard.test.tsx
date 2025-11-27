
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import RoleBasedGuard from '@/components/RoleBasedGuard';

vi.mock('@/contexts/AuthRBACContext', () => ({
  useAuthRBAC: vi.fn(),
}));

describe('RoleBasedGuard', () => {
  const queryClient = new QueryClient();

  it('renders children when user has the required role', () => {
    (useAuthRBAC as any).mockReturnValue({ hasRole: () => true });

    render(
      <QueryClientProvider client={queryClient}>
        <RoleBasedGuard allowedRoles={['admin']}>
          <div>Content for admins</div>
        </RoleBasedGuard>
      </QueryClientProvider>
    );

    expect(screen.getByText('Content for admins')).toBeInTheDocument();
  });

  it('renders fallback content when user does not have the required role', () => {
    (useAuthRBAC as any).mockReturnValue({ hasRole: () => false });

    render(
      <QueryClientProvider client={queryClient}>
        <RoleBasedGuard allowedRoles={['admin']} fallback={<p>Access denied</p>}>
          <div>Content for admins</div>
        </RoleBasedGuard>
      </QueryClientProvider>
    );

    expect(screen.getByText('Access denied')).toBeInTheDocument();
  });

  it('renders null when user is not authenticated and no fallback is provided', () => {
    (useAuthRBAC as any).mockReturnValue({ isAuthenticated: false, hasRole: () => false });

    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <RoleBasedGuard allowedRoles={['admin']}>
          <div>Content for admins</div>
        </RoleBasedGuard>
      </QueryClientProvider>
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders fallback when user is not authenticated', () => {
    (useAuthRBAC as any).mockReturnValue({ isAuthenticated: false, hasRole: () => false });

    render(
      <QueryClientProvider client={queryClient}>
        <RoleBasedGuard allowedRoles={['admin']} fallback={<p>Not authenticated</p>}>
          <div>Content for admins</div>
        </RoleBasedGuard>
      </QueryClientProvider>
    );

    expect(screen.getByText('Not authenticated')).toBeInTheDocument();
  });
});
