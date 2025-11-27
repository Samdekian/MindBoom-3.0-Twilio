
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/core/rbac';
import { mapLegacyRoleToUserRole, isValidUserRole } from '@/utils/auth/auth-compatibility';

export type ExtendedUserRole = UserRole | 'guest' | 'user';

// Create as a class for import in other files
export class RBACConsistencyChecker {
  /**
   * Checks and repairs user role consistency between metadata and role tables
   * @param userId User ID to check
   * @param autoRepair Whether to automatically repair inconsistencies
   * @returns Object with consistency check results
   */
  async checkUserConsistency(userId: string, autoRepair = false) {
    try {
      // Use the RPC function to check and optionally repair consistency
      const { data, error } = await supabase.rpc('check_and_repair_user_role_consistency', {
        p_user_id: userId,
        p_auto_repair: autoRepair
      });
      
      if (error) throw error;
      
      // Process and normalize the result
      const result = data || {};
      
      // Safely access properties with type checking
      const missingRoles = this.safeGetArrayProperty(result, 'missing_roles');
      const extraRoles = this.safeGetArrayProperty(result, 'extra_roles');
      const isConsistent = this.safeGetBooleanProperty(result, 'is_consistent');
      const wasRepaired = this.safeGetBooleanProperty(result, 'fixed');
      const details = this.safeGetProperty(result, 'details');
      
      // Convert legacy roles to valid UserRoles
      const normalizedMissingRoles = missingRoles.map((role: string) => 
        isValidUserRole(role) ? role : mapLegacyRoleToUserRole(role)
      );
      
      const normalizedExtraRoles = extraRoles.map((role: string) =>
        isValidUserRole(role) ? role : mapLegacyRoleToUserRole(role)
      );
      
      return {
        isConsistent,
        wasRepaired,
        details,
        missingRoles: normalizedMissingRoles,
        extraRoles: normalizedExtraRoles,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error checking user role consistency:', error);
      return {
        isConsistent: false,
        wasRepaired: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  /**
   * Repairs user role consistency issues
   * @param userId User ID to repair
   * @returns Boolean indicating if repair was successful
   */
  async repairUserRoleConsistency(userId: string): Promise<boolean> {
    try {
      // Use the RPC function to check and repair consistency
      const { data, error } = await supabase.rpc('check_and_repair_user_role_consistency', {
        p_user_id: userId,
        p_auto_repair: true
      });
      
      if (error) throw error;
      
      // Check if repair was successful
      const result = data || {};
      const wasRepaired = this.safeGetBooleanProperty(result, 'auto_repaired') || 
                          this.safeGetBooleanProperty(result, 'fixed');
      
      return wasRepaired;
    } catch (error) {
      console.error('Error repairing user role consistency:', error);
      return false;
    }
  }

  /**
   * Retrieves the consistency check history
   * @param limit Maximum number of records to retrieve
   * @returns Array of consistency check records
   */
  async getConsistencyCheckHistory(limit = 10) {
    try {
      // Use audit_logs table instead of non-existent role_consistency_checks
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('activity_type', 'role_consistency_repair')
        .order('activity_timestamp', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching consistency check history:', error);
      return [];
    }
  }

  /**
   * Records a consistency check result
   * @param userId User ID
   * @param isConsistent Whether the user's roles are consistent
   * @param wasRepaired Whether the roles were repaired
   * @param details Details about the consistency check
   */
  async recordConsistencyCheck(
    userId: string,
    isConsistent: boolean,
    wasRepaired: boolean,
    details: any
  ) {
    try {
      // Insert into audit_logs instead of role_consistency_checks
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          user_id: userId,
          activity_type: 'role_consistency_check',
          resource_type: 'user_roles',
          resource_id: userId,
          metadata: {
            is_consistent: isConsistent,
            was_repaired: wasRepaired,
            details: details,
            timestamp: new Date().toISOString() // Convert Date to string for JSON compatibility
          }
        });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Error recording consistency check:', error);
      return { success: false, error };
    }
  }
  
  // Utility methods for safe property access
  private safeGetArrayProperty(obj: any, property: string): any[] {
    if (obj && typeof obj === 'object' && property in obj && Array.isArray(obj[property])) {
      return obj[property];
    }
    return [];
  }
  
  private safeGetBooleanProperty(obj: any, property: string): boolean {
    if (obj && typeof obj === 'object' && property in obj) {
      return !!obj[property];
    }
    return false;
  }
  
  private safeGetProperty(obj: any, property: string): any {
    if (obj && typeof obj === 'object' && property in obj) {
      return obj[property];
    }
    return null;
  }
}

// Create and export a singleton instance
export const rbacConsistencyChecker = new RBACConsistencyChecker();
