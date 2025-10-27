
// @vitest-only
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react-hooks';
import { setupRoleScenario } from './utils/test-utils';
import { usePermission } from '@/hooks/use-permission';
import { checkPermissions, getFieldAccess } from '@/utils/rbac/permission-service';
import { IntegrationTestProvider } from '@/components/test-utils/IntegrationTestProvider';
import { ComponentPermission } from '@/utils/rbac/component-types';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => {
  return import('./utils/supabase-mock').then(({ setupSupabaseMock }) => setupSupabaseMock());
});

describe('RBAC Permission Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  test('checkPermissions returns true when user has required permissions', async () => {
    const userId = 'test-user';
    const requiredPermissions = [
      { resource: 'dashboard', action: 'view', level: 'read', name: 'View Dashboard', description: 'Can view dashboard', category: 'general' }
    ] as any[]; // Use any[] to avoid type mismatch between different Permission interfaces
    
    const result = await checkPermissions(userId, requiredPermissions);
    expect(result).toBe(true);
  });
  
  test('getFieldAccess returns correct field access settings', async () => {
    const userId = 'test-user';
    const fieldName = 'patient.billing';
    
    const access = await getFieldAccess(userId, fieldName);
    expect(access).toEqual({
      readOnly: true,
      hidden: false,
      mask: false
    });
  });
  
  test('usePermission hook correctly checks permissions', async () => {
    // Setup role scenario with 'admin' role
    setupRoleScenario('admin');
    
    const { result } = renderHook(() => usePermission(), {
      wrapper: IntegrationTestProvider
    });
    
    expect(result.current.isLoading).toBeDefined();
    expect(typeof result.current.checkPermissions).toBe('function');
    expect(typeof result.current.getFieldAccess).toBe('function');
    
    // Admin should have access to everything - use the correct type
    const mockPermissions = [
      { resource: 'admin', action: 'manage' } as ComponentPermission
    ];
    
    const hasAccess = result.current.checkPermissions(mockPermissions);
    expect(hasAccess).toBe(true);
  });
});
