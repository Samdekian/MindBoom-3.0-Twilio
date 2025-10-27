
import { vi } from 'vitest';

// Mock implementation of Supabase client for testing
export const mockSupabase = {
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } } }),
    getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn().mockResolvedValue({}),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
    signInWithOtp: vi.fn(),
  },
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    match: vi.fn().mockReturnThis(),
    then: vi.fn().mockImplementation(callback => Promise.resolve({}).then(callback)),
  }),
  rpc: vi.fn().mockReturnValue({
    then: vi.fn().mockImplementation(callback => Promise.resolve({ data: {} }).then(callback)),
  }),
};

// Mock the supabase import in files
vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

export default mockSupabase;
