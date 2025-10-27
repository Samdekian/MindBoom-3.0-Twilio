
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import RoleBasedGuard from '@/components/RoleBasedGuard';
import RoleBasedField from '@/components/RoleBasedField';
import { setupRoleScenario } from '../utils/test-utils';
import { usePermission } from '@/hooks/use-permission';

describe('Patient Role Scenario', () => {
  beforeEach(() => {
    setupRoleScenario('patient');
  });

  it('should have access to patient features', () => {
    render(
      <RoleBasedGuard allowedRoles={['patient', 'admin', 'therapist']}>
        <div data-testid="patient-feature">Patient Feature</div>
      </RoleBasedGuard>
    );
    
    expect(screen.getByTestId('patient-feature')).toBeInTheDocument();
  });

  it('should not have access to therapist features', () => {
    render(
      <RoleBasedGuard allowedRoles={['therapist', 'admin']}>
        <div data-testid="therapist-feature">Therapist Feature</div>
      </RoleBasedGuard>
    );
    
    expect(screen.queryByTestId('therapist-feature')).not.toBeInTheDocument();
  });

  it('should not see diagnosis fields', () => {
    // Override field access for this specific test
    (usePermission as any).mockReturnValue({
      getFieldAccess: () => ({
        readOnly: false,
        hidden: true,
        mask: false,
      }),
    });

    render(
      <RoleBasedField fieldName="patient.diagnosis">
        <input data-testid="diagnosis-input" />
      </RoleBasedField>
    );
    
    expect(screen.queryByTestId('diagnosis-input')).not.toBeInTheDocument();
  });
});
