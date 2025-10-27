
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import RoleBasedGuard from '@/components/RoleBasedGuard';
import RoleBasedField from '@/components/RoleBasedField';
import { setupRoleScenario } from '../utils/test-utils';
import { usePermission } from '@/hooks/use-permission';

describe('Therapist Role Scenario', () => {
  beforeEach(() => {
    setupRoleScenario('therapist');
  });

  it('should have access to therapist features', () => {
    render(
      <RoleBasedGuard allowedRoles={['therapist', 'admin']}>
        <div data-testid="therapist-feature">Therapist Feature</div>
      </RoleBasedGuard>
    );
    
    expect(screen.getByTestId('therapist-feature')).toBeInTheDocument();
  });

  it('should not have access to admin-only features', () => {
    render(
      <RoleBasedGuard allowedRoles={['admin']}>
        <div data-testid="admin-feature">Admin Feature</div>
      </RoleBasedGuard>
    );
    
    expect(screen.queryByTestId('admin-feature')).not.toBeInTheDocument();
  });

  it('should have full access to patient medical fields', () => {
    // Override field access for this specific test
    (usePermission as any).mockReturnValue({
      getFieldAccess: () => ({
        readOnly: false,
        hidden: false,
        mask: false,
      }),
    });

    render(
      <RoleBasedField fieldName="patient.medical">
        <input data-testid="medical-input" />
      </RoleBasedField>
    );
    
    const input = screen.getByTestId('medical-input');
    expect(input).toBeInTheDocument();
    expect(input).not.toHaveAttribute('readOnly');
  });

  it('should have read-only access to billing fields', () => {
    // Override field access for this specific test
    (usePermission as any).mockReturnValue({
      getFieldAccess: () => ({
        readOnly: true,
        hidden: false,
        mask: false,
      }),
    });

    render(
      <RoleBasedField fieldName="patient.billing">
        <input data-testid="billing-input" />
      </RoleBasedField>
    );
    
    const input = screen.getByTestId('billing-input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('readOnly');
  });
});
