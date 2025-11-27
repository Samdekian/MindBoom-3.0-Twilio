
// @vitest-only
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react-hooks';
import { useRBAC } from '@/hooks/useRBAC';
import { IntegrationTestProvider } from '@/components/test-utils/IntegrationTestProvider';
import { supabase } from '@/integrations/supabase/client';
import { createMockRpcResponse } from './utils/mock-utils';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => {
  return import('./utils/supabase-mock').then(({ setupSupabaseMock }) => setupSupabaseMock());
});

describe('Role Consistency Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  test('useRBAC returns consistent roles', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useRBAC(), {
      wrapper: IntegrationTestProvider
    });
    
    // Initially loading
    expect(result.current.loading).toBe(true);
    
    await waitForNextUpdate();
    
    // After loading
    expect(result.current.loading).toBe(false);
    expect(result.current.roles).toEqual(['patient']);
    expect(result.current.hasRole('patient')).toBe(true);
  });
  
  // Test multiple roles for a user
  test('RBAC handles multiple roles correctly', async () => {
    // Create a properly structured mock that implements PostgrestFilterBuilder
    const mockRpcCall = vi.fn().mockReturnValue(
      createMockRpcResponse([{role_name: 'admin'}, {role_name: 'therapist'}])
    );
    
    // Replace the rpc method with our mock
    vi.mocked(supabase).rpc = mockRpcCall;
    
    const { result, waitForNextUpdate } = renderHook(() => useRBAC(), {
      wrapper: IntegrationTestProvider
    });
    
    await waitForNextUpdate();
    
    expect(result.current.roles).toEqual(['admin', 'therapist']);
    expect(result.current.hasRole('admin')).toBe(true);
    expect(result.current.hasRole('therapist')).toBe(true);
    expect(result.current.hasRole('patient')).toBe(false);
    expect(result.current.hasAnyRole(['admin', 'support'])).toBe(true);
    expect(result.current.hasAllRoles(['admin', 'therapist'])).toBe(true);
    expect(result.current.hasAllRoles(['admin', 'patient'])).toBe(false);
  });
  
  // Test for unauthenticated users
  test('RBAC handles unauthenticated users', async () => {
    // Mock no user in session using the auth mock directly
    const mockGetSession = vi.fn().mockResolvedValue({ 
      data: { session: null }, 
      error: null 
    });
    
    vi.mocked(supabase).auth.getSession = mockGetSession;
    
    const { result, waitForNextUpdate } = renderHook(() => useRBAC(), {
      wrapper: IntegrationTestProvider
    });
    
    await waitForNextUpdate();
    
    expect(result.current.roles).toEqual([]);
    expect(result.current.hasRole('admin')).toBe(false);
  });
});
