
// @vitest-only
import { vi } from 'vitest';
import { createMockFilterBuilder, createMockRpcResponse } from './mock-utils';

/**
 * Mock implementation for Supabase client
 * Used in tests to avoid making actual API calls
 */
export const mockSupabaseClient = {
  from: vi.fn().mockImplementation(() => {
    return createMockFilterBuilder();
  }),
  rpc: vi.fn().mockImplementation((functionName, params) => {
    // Return different mock data based on the function name
    const data = functionName === 'get_user_roles' ? [{role_name: 'patient'}] : null;
    return createMockRpcResponse(data);
  }),
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null }),
    getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'test-user' } } }, error: null })
  }
};

/**
 * Setup mock for Supabase client module
 * This should be called in the vi.mock setup
 */
export function setupSupabaseMock() {
  return {
    supabase: mockSupabaseClient
  };
}
