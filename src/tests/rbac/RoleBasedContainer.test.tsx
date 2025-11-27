
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import RoleBasedContainer from '@/components/RoleBasedContainer';
import { useRBAC } from '@/hooks/useRBAC';
import { usePermission } from '@/hooks/use-permission';

// Mock the hooks
vi.mock('@/hooks/useRBAC', () => ({
  useRBAC: vi.fn(),
}));

vi.mock('@/hooks/use-permission', () => ({
  usePermission: vi.fn(),
}));

describe('RoleBasedContainer', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Default mock implementations
    (useRBAC as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoading: false,
      hasAnyRole: vi.fn().mockReturnValue(true),
      hasAllRoles: vi.fn().mockReturnValue(true),
    });
    
    (usePermission as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoading: false,
      checkPermissions: vi.fn().mockReturnValue(true),
    });
  });

  it('renders children when user has access', () => {
    // Act
    render(
      <RoleBasedContainer allowedRoles={['admin']}>
        <div data-testid="container-content">Container Content</div>
      </RoleBasedContainer>
    );

    // Assert
    expect(screen.getByTestId('container-content')).toBeInTheDocument();
  });

  it('does not render children when user lacks required roles', () => {
    // Arrange
    (useRBAC as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoading: false,
      hasAnyRole: vi.fn().mockReturnValue(false),
      hasAllRoles: vi.fn().mockReturnValue(false),
    });

    // Act
    render(
      <RoleBasedContainer allowedRoles={['admin']}>
        <div data-testid="container-content">Container Content</div>
      </RoleBasedContainer>
    );

    // Assert
    expect(screen.queryByTestId('container-content')).not.toBeInTheDocument();
  });

  it('renders fallback when provided and user lacks access', () => {
    // Arrange
    (useRBAC as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoading: false,
      hasAnyRole: vi.fn().mockReturnValue(false),
      hasAllRoles: vi.fn().mockReturnValue(false),
    });

    // Act
    render(
      <RoleBasedContainer 
        allowedRoles={['admin']} 
        fallback={<div data-testid="fallback">No Access</div>}
      >
        <div data-testid="container-content">Container Content</div>
      </RoleBasedContainer>
    );

    // Assert
    expect(screen.queryByTestId('container-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('fallback')).toBeInTheDocument();
  });

  it('shows loading state when configured', () => {
    // Arrange
    (useRBAC as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoading: true,
      hasAnyRole: vi.fn(),
      hasAllRoles: vi.fn(),
    });

    // Act
    render(
      <RoleBasedContainer allowedRoles={['admin']} showLoading={true}>
        <div data-testid="container-content">Container Content</div>
      </RoleBasedContainer>
    );

    // Assert
    expect(screen.queryByTestId('container-content')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
