
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import RoleBasedContainer from '@/components/RoleBasedContainer';
import RoleBasedField from '@/components/RoleBasedField';
import RoleBasedGuard from '@/components/RoleBasedGuard';
import { setupRoleScenario } from '../utils/test-utils';

describe('Admin Role Scenario', () => {
  beforeEach(() => {
    setupRoleScenario('admin');
  });

  it('should have access to admin features', () => {
    render(
      <RoleBasedGuard allowedRoles={['admin']}>
        <div data-testid="admin-feature">Admin Feature</div>
      </RoleBasedGuard>
    );
    
    expect(screen.getByTestId('admin-feature')).toBeInTheDocument();
  });

  it('should have read/write access to all fields', () => {
    render(
      <RoleBasedField fieldName="sensitive-field">
        <input data-testid="sensitive-input" />
      </RoleBasedField>
    );
    
    const input = screen.getByTestId('sensitive-input');
    expect(input).toBeInTheDocument();
    expect(input).not.toHaveAttribute('readOnly');
  });

  it('should see all containers regardless of role restrictions', () => {
    render(
      <RoleBasedContainer allowedRoles={['therapist']}>
        <div data-testid="therapist-container">Therapist Content</div>
      </RoleBasedContainer>
    );
    
    // Admins override normal role restrictions
    expect(screen.getByTestId('therapist-container')).toBeInTheDocument();
  });
});
