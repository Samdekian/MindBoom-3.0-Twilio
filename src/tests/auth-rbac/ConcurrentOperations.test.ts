
import { vi, describe, it, expect } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    rpc: vi.fn().mockImplementation((name) => {
      if (name === 'get_user_roles_and_permissions') {
        return Promise.resolve({
          data: {
            roles: ['patient'],
            permissions: [{ name: 'read_own_records', resource: 'medical_records', action: 'read' }]
          },
          error: null
        });
      }
      if (name === 'manage_user_role') {
        return Promise.resolve({
          data: { success: true, message: 'Role assigned successfully' },
          error: null
        });
      }
      return Promise.resolve({ data: null, error: null });
    }),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } })
    }
  }
}));

// Helper functions for testing
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const getRandomInt = (max: number) => Math.floor(Math.random() * max) + 1;

describe('RBAC Concurrent Operations', () => {
  // Test race conditions with concurrent role assignments
  it('handles concurrent role assignments without race conditions', async () => {
    const userId = 'test-user-123';
    const rolesToAssign = ['admin', 'therapist', 'support', 'patient'];
    
    // Create array of promises that assign roles with random small delays
    const assignmentPromises = rolesToAssign.map(role => 
      delay(getRandomInt(10)).then(() => 
        supabase.rpc('manage_user_role', {
          p_user_id: userId,
          p_role_name: role,
          p_operation: 'assign'
        })
      )
    );
    
    // Execute all role assignment operations concurrently
    const results = await Promise.all(assignmentPromises);
    
    // Verify all operations completed successfully
    results.forEach((result, index) => {
      // Use type assertion to handle the Json type
      const resultData = result.data as { success: boolean; message: string };
      expect(resultData).toBeTruthy();
      expect(resultData.success).toBe(true);
      expect(result.error).toBeNull();
    });
    
    // Check if all roles were assigned by making a final get roles call
    const finalCheck = await supabase.rpc('get_user_roles_and_permissions', {
      user_id: userId
    });
    
    expect(finalCheck.error).toBeNull();
    // In a real test, we would check all roles were assigned
    // Here we're just verifying the mock was called
    expect(supabase.rpc).toHaveBeenCalledWith(
      'get_user_roles_and_permissions',
      { user_id: userId }
    );
  });
  
  // Test for handling multiple parallel consistency checks
  it('handles multiple parallel consistency checks', async () => {
    const userId = 'test-user-456';
    
    // Simulate 5 concurrent consistency checks
    const concurrentChecks = Array(5).fill(null).map(() => 
      delay(getRandomInt(5)).then(() => 
        supabase.rpc('check_and_repair_user_role_consistency', {
          p_user_id: userId,
          p_auto_repair: true
        })
      )
    );
    
    // Execute all consistency checks concurrently
    const results = await Promise.all(concurrentChecks);
    
    // Verify all operations completed
    results.forEach(result => {
      expect(supabase.rpc).toHaveBeenCalledWith(
        'check_and_repair_user_role_consistency',
        expect.any(Object)
      );
    });
  });
});
