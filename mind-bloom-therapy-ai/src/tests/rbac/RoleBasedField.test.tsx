
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import RoleBasedField from '@/components/RoleBasedField';
import { useRBAC } from '@/hooks/useRBAC';
import { usePermission } from '@/hooks/use-permission';

// Mock the hooks
vi.mock('@/hooks/useRBAC', () => ({
  useRBAC: vi.fn(),
}));

vi.mock('@/hooks/use-permission', () => ({
  usePermission: vi.fn(),
}));

describe('RoleBasedField', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Default mock implementations
    (useRBAC as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      hasAnyRole: vi.fn().mockReturnValue(true),
      hasAllRoles: vi.fn().mockReturnValue(true),
    });
    
    (usePermission as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      getFieldAccess: vi.fn().mockReturnValue({
        readOnly: false,
        hidden: false,
        mask: false
      }),
    });
  });

  it('renders children when user has access', () => {
    // Arrange & Act
    render(
      <RoleBasedField fieldName="test-field">
        <input data-testid="test-input" />
      </RoleBasedField>
    );

    // Assert
    expect(screen.getByTestId('test-input')).toBeInTheDocument();
  });

  it('applies readOnly when field should be read-only', () => {
    // Arrange
    (useRBAC as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      hasAnyRole: vi.fn().mockReturnValue(true),
      hasAllRoles: vi.fn().mockReturnValue(true),
    });
    
    (usePermission as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      getFieldAccess: vi.fn().mockReturnValue({
        readOnly: true,
        hidden: false,
        mask: false
      }),
    });

    // Act
    render(
      <RoleBasedField fieldName="test-field">
        <input data-testid="test-input" />
      </RoleBasedField>
    );

    // Assert
    expect(screen.getByTestId('test-input')).toHaveAttribute('readOnly');
    expect(screen.getByTestId('test-input')).toHaveAttribute('disabled');
  });

  it('hides field when hidden role applies', () => {
    // Arrange
    (useRBAC as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      hasAnyRole: vi.fn().mockReturnValue(true),
      hasAllRoles: vi.fn().mockReturnValue(true),
    });
    
    (usePermission as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      getFieldAccess: vi.fn().mockReturnValue({
        readOnly: false,
        hidden: true,
        mask: false
      }),
    });

    // Act
    render(
      <RoleBasedField fieldName="test-field">
        <input data-testid="test-input" />
      </RoleBasedField>
    );

    // Assert
    expect(screen.queryByTestId('test-input')).not.toBeInTheDocument();
  });

  it('renders fallback when field is hidden and fallback is provided', () => {
    // Arrange
    (useRBAC as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      hasAnyRole: vi.fn().mockReturnValue(true),
      hasAllRoles: vi.fn().mockReturnValue(true),
    });
    
    (usePermission as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      getFieldAccess: vi.fn().mockReturnValue({
        readOnly: false,
        hidden: true,
        mask: false
      }),
    });

    // Act
    render(
      <RoleBasedField 
        fieldName="test-field"
        fallback={<div data-testid="fallback">Restricted</div>}
      >
        <input data-testid="test-input" />
      </RoleBasedField>
    );

    // Assert
    expect(screen.queryByTestId('test-input')).not.toBeInTheDocument();
    expect(screen.getByTestId('fallback')).toBeInTheDocument();
  });
});
