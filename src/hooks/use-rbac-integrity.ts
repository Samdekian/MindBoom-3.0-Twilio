import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RoleDiagnosticResult } from '@/types/core/rbac';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { safeJsonToObject, safeJsonAccess } from '@/utils/json-utils';

interface SystemStats {
  totalUsers: number;
  inconsistentUsers: number;
  lastCheckDate: string | null;
  healthStatus: 'healthy' | 'warning' | 'critical';
  healthMessage: string;
}

export function useRBACIntegrity() {
  const [loading, setLoading] = useState(false);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [inconsistentUsers, setInconsistentUsers] = useState<RoleDiagnosticResult[]>([]);
  const { toast } = useToast();
  const { isAdmin } = useAuthRBAC();

  /**
   * Check role consistency for a specific user
   */
  const checkIntegrity = async (userId: string): Promise<RoleDiagnosticResult> => {
    try {
      setLoading(true);
      
      // Use check_and_repair_user_role_consistency with repair set to false
      const { data, error } = await supabase.rpc('check_and_repair_user_role_consistency', {
        p_user_id: userId,
        p_auto_repair: false
      });
      
      if (error) {
        throw error;
      }
      
      // Convert data to object safely
      const resultData = safeJsonToObject<any>(data) || {};
      
      // Format the response into the expected RoleDiagnosticResult type
      const result: RoleDiagnosticResult = {
        id: `diagnostic-${Date.now()}`,
        user_id: userId,
        userId,
        user_email: safeJsonAccess<string>(resultData, 'user_email', ''),
        expected_roles: [],
        actual_roles: [],
        missing_roles: [],
        extra_roles: [],
        permissions_count: 0,
        last_checked: new Date().toISOString(),
        status: 'warning',
        issues: [],
        userExists: true,
        databaseRoles: Array.isArray(safeJsonAccess<any[]>(resultData, 'db_roles', [])) ? 
                       safeJsonAccess<any[]>(resultData, 'db_roles', []) : [],
        dbRoles: Array.isArray(safeJsonAccess<any[]>(resultData, 'db_roles', [])) ? 
                 safeJsonAccess<any[]>(resultData, 'db_roles', []) : [],
        isConsistent: Boolean(safeJsonAccess<boolean>(resultData, 'is_consistent', false)),
        issue: safeJsonAccess<string>(resultData, 'issue', 'Unknown issue'),
        errors: Array.isArray(safeJsonAccess<any[]>(resultData, 'errors', [])) 
          ? safeJsonAccess<any[]>(resultData, 'errors', []) 
          : [String(safeJsonAccess<any>(resultData, 'errors', 'Unknown error'))],
        severity: safeJsonAccess<any>(resultData, 'severity', 'medium'),
        suggestedFixes: Array.isArray(safeJsonAccess<any[]>(resultData, 'suggested_fixes', [])) 
          ? safeJsonAccess<any[]>(resultData, 'suggested_fixes', []) 
          : [],
        repaired: false
      };
      
      return result;
    } catch (error: any) {
      console.error('Error checking role integrity:', error);
      
      // Return error result with required properties
      const errorResult: RoleDiagnosticResult = {
        id: `diagnostic-error-${Date.now()}`,
        user_id: userId,
        userId,
        user_email: '',
        expected_roles: [],
        actual_roles: [],
        missing_roles: [],
        extra_roles: [],
        permissions_count: 0,
        last_checked: new Date().toISOString(),
        status: 'error',
        issues: [],
        userExists: false,
        databaseRoles: [],
        dbRoles: [],
        isConsistent: false,
        issue: 'Error checking role consistency',
        errors: [error.message || 'Unknown error occurred'],
        severity: 'high',
        suggestedFixes: ['Please contact support if this error persists'],
        repaired: false
      };
      
      return errorResult;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Repair roles for a specific user
   */
  const repairRoles = async (userId: string): Promise<RoleDiagnosticResult> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('check_and_repair_user_role_consistency', {
        p_user_id: userId,
        p_auto_repair: true
      });
      
      if (error) {
        throw error;
      }
      
      // Convert data to object safely
      const resultData = safeJsonToObject<any>(data) || {};
      
      toast({
        title: safeJsonAccess<boolean>(resultData, 'is_consistent', false) ? 'Roles repaired successfully' : 'Unable to repair roles',
        description: safeJsonAccess<string>(resultData, 'message', 'Changes have been applied.'),
        variant: safeJsonAccess<boolean>(resultData, 'is_consistent', false) ? 'default' : 'destructive'
      });
      
      // Format the response into the expected RoleDiagnosticResult type
      const result: RoleDiagnosticResult = {
        id: `diagnostic-${Date.now()}`,
        user_id: userId,
        userId,
        user_email: safeJsonAccess<string>(resultData, 'user_email', ''),
        expected_roles: [],
        actual_roles: [],
        missing_roles: [],
        extra_roles: [],
        permissions_count: 0,
        last_checked: new Date().toISOString(),
        status: 'warning',
        issues: [],
        userExists: true,
        databaseRoles: Array.isArray(safeJsonAccess<any[]>(resultData, 'db_roles', [])) 
          ? safeJsonAccess<any[]>(resultData, 'db_roles', []) 
          : [],
        dbRoles: Array.isArray(safeJsonAccess<any[]>(resultData, 'db_roles', [])) 
          ? safeJsonAccess<any[]>(resultData, 'db_roles', []) 
          : [],
        isConsistent: Boolean(safeJsonAccess<boolean>(resultData, 'is_consistent', false)),
        issue: safeJsonAccess<string>(resultData, 'issue', 'Unknown issue'),
        errors: Array.isArray(safeJsonAccess<any[]>(resultData, 'remaining_errors', [])) 
          ? safeJsonAccess<any[]>(resultData, 'remaining_errors', []) 
          : Array.isArray(safeJsonAccess<any[]>(resultData, 'errors', [])) 
            ? safeJsonAccess<any[]>(resultData, 'errors', []) 
            : [String(safeJsonAccess<any>(resultData, 'errors', 'Unknown error'))],
        severity: safeJsonAccess<any>(resultData, 'severity', 'low'),
        suggestedFixes: Array.isArray(safeJsonAccess<any[]>(resultData, 'suggested_fixes', [])) 
          ? safeJsonAccess<any[]>(resultData, 'suggested_fixes', []) 
          : [],
        repaired: true
      };
      
      return result;
    } catch (error: any) {
      console.error('Error repairing roles:', error);
      
      toast({
        title: 'Error repairing roles',
        description: error.message || 'An unknown error occurred',
        variant: 'destructive'
      });
      
      // Return error result with required properties
      const errorResult: RoleDiagnosticResult = {
        id: `diagnostic-error-${Date.now()}`,
        user_id: userId,
        userId,
        user_email: '',
        expected_roles: [],
        actual_roles: [],
        missing_roles: [],
        extra_roles: [],
        permissions_count: 0,
        last_checked: new Date().toISOString(),
        status: 'error',
        issues: [],
        userExists: false,
        databaseRoles: [],
        dbRoles: [],
        isConsistent: false,
        issue: 'Error repairing roles',
        errors: [error.message || 'Unknown error occurred'],
        severity: 'high',
        suggestedFixes: ['Please contact support if this error persists'],
        repaired: false
      };
      
      return errorResult;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Check all users for inconsistencies
   */
  const checkAllUsers = async (): Promise<RoleDiagnosticResult[]> => {
    try {
      setLoading(true);
      
      // Get all users with possible inconsistencies
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, account_type')
        .limit(100);
      
      if (error) {
        throw error;
      }
      
      // Check each user
      const results: RoleDiagnosticResult[] = [];
      for (const profile of data) {
        const result = await checkIntegrity(profile.id);
        if (!result.isConsistent) {
          results.push({
            ...result,
            userName: profile.full_name || profile.id
          });
        }
      }
      
      setInconsistentUsers(results);
      
      toast({
        title: 'User scan complete',
        description: `Found ${results.length} users with role inconsistencies`,
        variant: results.length > 0 ? 'warning' : 'default'
      });
      
      return results;
    } catch (error: any) {
      console.error('Error scanning users:', error);
      
      toast({
        title: 'Error scanning users',
        description: error.message || 'An unknown error occurred',
        variant: 'destructive'
      });
      
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Fix inconsistency for a specific user
   */
  const fixUserInconsistency = async (userId: string): Promise<RoleDiagnosticResult> => {
    const result = await repairRoles(userId);
    
    // Update the inconsistent users list
    setInconsistentUsers(prev => 
      prev.map(user => user.userId === userId ? result : user)
    );
    
    return result;
  };
  
  /**
   * Check system-wide role consistency
   */
  const checkSystemConsistency = async () => {
    try {
      setLoading(true);
      
      // First scan for inconsistent users
      const inconsistentResults = await checkAllUsers();
      
      const stats: SystemStats = {
        totalUsers: 0, // Will be updated below
        inconsistentUsers: inconsistentResults.length,
        lastCheckDate: new Date().toISOString(),
        healthStatus: inconsistentResults.length > 0 
          ? inconsistentResults.length > 10 ? 'critical' : 'warning' 
          : 'healthy',
        healthMessage: inconsistentResults.length > 0
          ? `Found ${inconsistentResults.length} users with role inconsistencies`
          : 'All user roles are consistent'
      };
      
      // Get total user count
      const { count, error } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });
      
      if (error) {
        console.error('Error counting users:', error);
      } else {
        stats.totalUsers = count || 0;
      }
      
      setSystemStats(stats);
      
      toast({
        title: 'System check complete',
        description: stats.healthMessage,
        variant: stats.healthStatus === 'healthy' ? 'default' : 'destructive'
      });
      
      return stats;
    } catch (error: any) {
      console.error('Error checking system consistency:', error);
      
      toast({
        title: 'Error checking system',
        description: error.message || 'An unknown error occurred',
        variant: 'destructive'
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Fix all inconsistencies across the system
   */
  const fixAllInconsistencies = async () => {
    try {
      setLoading(true);
      
      // Get inconsistent users if not already fetched
      if (inconsistentUsers.length === 0) {
        await checkAllUsers();
      }
      
      // Fix each user
      let fixedCount = 0;
      for (const user of inconsistentUsers) {
        const result = await repairRoles(user.userId);
        if (result.isConsistent) {
          fixedCount++;
        }
      }
      
      toast({
        title: 'Bulk repair complete',
        description: `Fixed ${fixedCount} of ${inconsistentUsers.length} user role inconsistencies`,
        variant: 'default'
      });
      
      // Refresh the list of inconsistent users
      await checkAllUsers();
      
    } catch (error: any) {
      console.error('Error performing bulk repair:', error);
      
      toast({
        title: 'Error repairing roles',
        description: error.message || 'An unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Perform bulk repair for all role inconsistencies
   */
  const performBulkRepair = async () => {
    await fixAllInconsistencies();
  };

  return {
    loading,
    isAdmin,
    inconsistentUsers,
    checkIntegrity,
    repairRoles: checkIntegrity, // Simplified for now
    checkSystemConsistency: async () => null,
    performBulkRepair: async () => {},
    checkAllUsers: async () => [],
    fixUserInconsistency: checkIntegrity,
    fixAllInconsistencies: async () => {},
    systemStats
  };
}
