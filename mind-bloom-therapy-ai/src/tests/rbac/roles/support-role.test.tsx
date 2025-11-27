
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import RoleBasedGuard from '@/components/RoleBasedGuard';
import RoleBasedField from '@/components/RoleBasedField';
import { setupRoleScenario } from '../utils/test-utils';
import { usePermission } from '@/hooks/use-permission';

describe('Support Role Scenario', () => {
  beforeEach(() => {
    setupRoleScenario('support');
  });

  it('should have access to support features', () => {
    render(
      <RoleBasedGuard allowedRoles={['support', 'admin']}>
        <div data-testid="support-feature">Support Feature</div>
      </RoleBasedGuard>
    );
    
    expect(screen.getByTestId('support-feature')).toBeInTheDocument();
  });

  it('should see masked sensitive data', () => {
    // Override field access for this specific test
    (usePermission as any).mockReturnValue({
      getFieldAccess: () => ({
        readOnly: true,
        hidden: false,
        mask: true,
      }),
    });

    render(
      <RoleBasedField fieldName="patient.ssn">
        <input data-testid="ssn-input" value="123-45-6789" readOnly />
      </RoleBasedField>
    );
    
    // Input should not be visible when masked
    expect(screen.queryByTestId('ssn-input')).not.toBeInTheDocument();
    // Instead, we should see masked content
    expect(screen.getByText('●●●●●●●●')).toBeInTheDocument();
  });
});
