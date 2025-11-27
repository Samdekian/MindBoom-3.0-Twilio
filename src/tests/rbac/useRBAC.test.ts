
// @vitest-only
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '../react-hooks-mock';
import { useRBAC } from '@/hooks/useRBAC';
import type { UserRole } from '@/types/core/rbac';

// Define the expected shape of the useRBAC hook result to match actual implementation
interface RBACResult {
  loading: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  roles: UserRole[];
  permissions: any[];
  error: any;
  autoRepair: boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAllRoles: (roles: string[]) => boolean;
  isAdmin: boolean;
  isTherapist: boolean;
  isPatient: boolean;
  isSupport: boolean;
  primaryRole: UserRole | undefined;
  hasPermission: (permission: string) => boolean;
  performConsistencyCheck: () => Promise<boolean>;
  refreshRoles: () => Promise<void>;
  setAutoRepair: () => void;
}

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    rpc: vi.fn().mockImplementation((fn, params) => ({
      data: ['admin', 'therapist'],
      error: null
    }))
  }
}));

vi.mock('@/contexts/AuthRBACContext', () => ({
  useAuthRBAC: vi.fn().mockReturnValue({
    userRoles: ['admin', 'therapist'],
    permissions: [],
    loading: false,
    isAuthenticated: true,
    hasRole: vi.fn().mockImplementation((role) => ['admin', 'therapist'].includes(role)),
    hasAnyRole: vi.fn().mockImplementation((roles) => roles.some(r => ['admin', 'therapist'].includes(r))),
    hasAllRoles: vi.fn().mockImplementation((roles) => roles.every(r => ['admin', 'therapist'].includes(r))),
    isAdmin: true,
    isTherapist: true,
    isPatient: false,
    isSupport: false,
    primaryRole: 'admin',
    hasPermission: vi.fn().mockReturnValue(false),
    refreshRoles: vi.fn().mockResolvedValue(undefined),
    performConsistencyCheck: vi.fn().mockResolvedValue(true)
  })
}));

describe('useRBAC hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should return roles and helper functions', async () => {
    const { result, waitForNextUpdate } = renderHook<RBACResult, unknown>(
      () => useRBAC() as RBACResult
    );
    
    expect((result.current as RBACResult).loading).toBe(false);
    expect((result.current as RBACResult).roles).toEqual(['admin', 'therapist']);
    expect((result.current as RBACResult).hasRole('admin')).toBe(true);
    expect((result.current as RBACResult).hasRole('patient')).toBe(false);
    expect((result.current as RBACResult).hasAnyRole(['admin', 'support'])).toBe(true);
    expect((result.current as RBACResult).hasAnyRole(['patient', 'support'])).toBe(false);
    expect((result.current as RBACResult).hasAllRoles(['admin', 'therapist'])).toBe(true);
    expect((result.current as RBACResult).hasAllRoles(['admin', 'patient'])).toBe(false);
  });
  
  it('should handle consistency checks', async () => {
    const { result, waitForNextUpdate } = renderHook<RBACResult, unknown>(
      () => useRBAC() as RBACResult
    );
    
    let success = false;
    await act(async () => {
      success = await (result.current as RBACResult).performConsistencyCheck();
    });
    
    expect(success).toBe(true);
  });
  
  it('should refresh roles', async () => {
    const { result, waitForNextUpdate } = renderHook<RBACResult, unknown>(
      () => useRBAC() as RBACResult
    );
    
    await act(async () => {
      await (result.current as RBACResult).refreshRoles();
    });
    
    expect((result.current as RBACResult).roles).toEqual(['admin', 'therapist']);
  });
});

// Ensure file is treated as a module
export default {};
