
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTwoFactorAuth } from '@/hooks/useTwoFactorAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { User } from '@supabase/supabase-js';

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(),
    update: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis()
  }
}));

// Mock the toast hook
vi.mock('@/components/ui/use-toast', () => ({
  useToast: vi.fn()
}));

describe('useTwoFactorAuth Hook', () => {
  const mockUser = { 
    id: 'test-user-id',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2023-01-01T00:00:00.000Z',
    updated_at: '2023-01-01T00:00:00.000Z',
    email: 'test@example.com',
    phone: '',
    confirmed_at: '2023-01-01T00:00:00.000Z',
    last_sign_in_at: '2023-01-01T00:00:00.000Z',
    role: 'authenticated',
    factors: null
  } as User;
  const mockToast = { toast: vi.fn() };
  
  beforeEach(() => {
    vi.clearAllMocks();
    (useToast as any).mockReturnValue(mockToast);
    
    // Default mock for supabase queries
    (supabase.from as any).mockImplementation((tableName) => {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: { 
            two_factor_enabled: false,
            two_factor_setup_complete: false
          },
          error: null
        }),
        update: vi.fn().mockReturnThis(),
        insert: vi.fn().mockResolvedValue({
          error: null
        })
      };
    });
  });

  it('initializes with correct default state', async () => {
    const { result } = renderHook(() => useTwoFactorAuth(mockUser));
    
    expect(result.current.status.isEnabled).toBe(false);
    expect(result.current.status.setupComplete).toBe(false);
    expect(result.current.loading).toBe(false);
  });

  it('fetches 2FA status on initialization', async () => {
    renderHook(() => useTwoFactorAuth(mockUser));
    
    expect(supabase.from).toHaveBeenCalledWith('profiles');
  });

  it('handles startTwoFactorSetup correctly', async () => {
    const { result } = renderHook(() => useTwoFactorAuth(mockUser));
    
    let success;
    await act(async () => {
      success = await result.current.startTwoFactorSetup();
    });
    
    expect(success).toBe(true);
    expect(result.current.status.secretKey).toBeDefined();
    expect(result.current.status.qrCodeUrl).toBeDefined();
    expect(result.current.status.recoveryFactors).toBeDefined();
    
    expect(supabase.from).toHaveBeenCalledWith('audit_logs');
  });

  it('handles disableTwoFactor correctly', async () => {
    const { result } = renderHook(() => useTwoFactorAuth(mockUser));
    
    await act(async () => {
      await result.current.disableTwoFactor();
    });
    
    expect(supabase.from).toHaveBeenCalledWith('profiles');
    expect(mockToast.toast).toHaveBeenCalled();
  });

  it('handles errors during initialization', async () => {
    // Setup mock to simulate an error
    (supabase.from as any).mockImplementation((tableName) => {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: null,
          error: new Error('Database error')
        })
      };
    });
    
    // Spy on console.error
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    renderHook(() => useTwoFactorAuth(mockUser));
    
    // Wait for the useEffect to complete
    await vi.runAllTimers();
    
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  it('handles null user correctly', () => {
    const { result } = renderHook(() => useTwoFactorAuth(null));
    
    expect(result.current.status.isEnabled).toBe(false);
    expect(supabase.from).not.toHaveBeenCalled();
  });
});
