
import { supabase } from '@/integrations/supabase/client';
import { RoleDiagnosticResult } from '@/types/core/rbac';
import { createDiagnosticResult } from './diagnostic-helpers';

export class RBACConsistencyChecker {
  /**
   * Check if a user's roles are consistent across all systems
   */
  async checkUserConsistency(userId: string): Promise<RoleDiagnosticResult> {
    try {
      // Call the RPC function to check consistency
      const { data, error } = await supabase.rpc('check_and_repair_user_role_consistency', {
        p_user_id: userId,
        p_auto_repair: false  // Just check, don't repair
      });

      if (error) {
        throw error;
      }

      const result = data as any;
      
      return createDiagnosticResult({
        userId,
        userExists: result?.user_exists || false,
        isConsistent: result?.is_consistent || false,
        repaired: false,
        issue: result?.is_consistent ? 'All role data is consistent' : 'Role inconsistency detected',
        databaseRoles: result?.database_roles || [],
        errors: result?.errors || [],
        severity: result?.is_consistent ? 'low' : 'medium'
      });

    } catch (error: any) {
      console.error('Error checking user consistency:', error);
      
      return createDiagnosticResult({
        userId,
        userExists: false,
        isConsistent: false,
        issue: error.message || 'Error checking user consistency',
        errors: [error.message || 'Unknown error'],
        severity: 'high',
        suggestedFixes: ['Contact support if this error persists'],
        databaseRoles: []
      });
    }
  }

  /**
   * Repair user role inconsistencies
   */
  async repairUserRoleConsistency(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('check_and_repair_user_role_consistency', {
        p_user_id: userId,
        p_auto_repair: true  // Enable repair
      });

      if (error) {
        throw error;
      }

      const result = data as any;
      return result?.repaired || false;

    } catch (error) {
      console.error('Error repairing user role consistency:', error);
      return false;
    }
  }

  /**
   * Check consistency for multiple users
   */
  async checkMultipleUsers(userIds: string[]): Promise<RoleDiagnosticResult[]> {
    const results: RoleDiagnosticResult[] = [];
    
    for (const userId of userIds) {
      try {
        const result = await this.checkUserConsistency(userId);
        results.push(result);
      } catch (error) {
        console.error(`Error checking user ${userId}:`, error);
        results.push(createDiagnosticResult({
          userId,
          userExists: false,
          isConsistent: false,
          issue: 'Error checking user consistency',
          errors: ['Failed to check user'],
          severity: 'high',
          databaseRoles: []
        }));
      }
    }
    
    return results;
  }
}

// Export singleton instance
export const rbacConsistencyChecker = new RBACConsistencyChecker();

// Export the checkRoleConsistency function for compatibility
export const checkRoleConsistency = async (userId: string, autoRepair: boolean = false): Promise<RoleDiagnosticResult> => {
  if (autoRepair) {
    await rbacConsistencyChecker.repairUserRoleConsistency(userId);
  }
  return rbacConsistencyChecker.checkUserConsistency(userId);
};
