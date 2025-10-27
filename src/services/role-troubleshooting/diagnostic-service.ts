
import { supabase } from '@/integrations/supabase/client';
import { RoleDiagnosticResult, UserRole } from '@/types/core/rbac';
import { checkRoleConsistency } from '@/utils/rbac/consistency-checker';
import { safeJsonToObject, safeJsonAccess } from '@/utils/json-utils';

/**
 * Service to handle role diagnostics
 */
export class RoleDiagnosticService {
  /**
   * Check role consistency for a user by ID
   * @param userId User ID to check
   * @returns Diagnostic result
   */
  async checkUserById(userId: string): Promise<RoleDiagnosticResult> {
    return checkRoleConsistency(userId, false);
  }
  
  /**
   * Find a user by email
   * @param email Email to search for
   * @returns User ID if found
   */
  async findUserByEmail(email: string): Promise<string | null> {
    try {
      // Call the safe get_user_email_safe function
      const { data, error } = await supabase.rpc('get_user_email_safe');
      
      if (error) throw error;
      
      return data || null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }
  
  /**
   * Set a user's primary role
   * @param userId User ID to update
   * @param role Role to set as primary
   * @returns Success status
   */
  async setPrimaryRole(userId: string, role: string): Promise<boolean> {
    try {
      // We need to ensure role is a valid UserRole
      const validatedRole = role as UserRole;
      
      const { data, error } = await supabase
        .rpc('manage_user_role', {
          p_user_id: userId,
          p_role_name: validatedRole,
          p_operation: 'assign'
        });
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error setting primary role:', error);
      return false;
    }
  }
}

// Export singleton instance
export const roleDiagnosticService = new RoleDiagnosticService();
