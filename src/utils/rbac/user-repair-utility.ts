import { supabase } from '@/integrations/supabase/client';
import { safeBoolean } from './type-adapters';

/**
 * Check and repair user role inconsistencies
 */
export async function repairUserRoles(userId: string): Promise<{
  success: boolean;
  actions: string[];
}> {
  try {
    const actions: string[] = [];
    
    // Get current roles from database with proper parameter naming
    const { data: dbRolesData, error: dbError } = await supabase.rpc('get_user_roles', {
      p_user_id: userId // Use p_user_id parameter name
    });
    
    if (dbError) {
      actions.push(`Error fetching database roles: ${dbError.message}`);
      return { success: false, actions };
    }
    
    // Convert from returned format to string roles
    const databaseRoles = (dbRolesData || []).map(r => r.role_name);
    
    // Get user metadata with explicit profile table alias in SQL
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('account_type')
      .eq('id', userId)
      .single();
      
    if (profileError) {
      actions.push(`Error fetching profile data: ${profileError.message}`);
      return { success: false, actions };
    }
    
    const accountType = profileData?.account_type;
    
    // Determine expected role based on account type
    let expectedRole: string | null = null;
    if (accountType === 'admin') expectedRole = 'admin';
    if (accountType === 'therapist') expectedRole = 'therapist';
    if (accountType === 'patient') expectedRole = 'patient';
    if (accountType === 'support') expectedRole = 'support';
    
    // Check if roles are consistent
    if (expectedRole && !databaseRoles.includes(expectedRole)) {
      // Add missing role
      const { error: addError } = await supabase.rpc('manage_user_role', {
        p_user_id: userId,
        p_role_name: expectedRole,
        p_operation: 'assign'
      });
      
      if (addError) {
        actions.push(`Error adding role ${expectedRole}: ${addError.message}`);
      } else {
        actions.push(`Added missing role ${expectedRole}`);
      }
    } else if (!expectedRole && databaseRoles.length > 0) {
      // Remove unexpected roles
      for (const role of databaseRoles) {
        const { error: removeError } = await supabase.rpc('manage_user_role', {
          p_user_id: userId,
          p_role_name: role,
          p_operation: 'remove'
        });
        
        if (removeError) {
          actions.push(`Error removing role ${role}: ${removeError.message}`);
        } else {
          actions.push(`Removed unexpected role ${role}`);
        }
      }
    } else {
      actions.push('Roles are consistent');
    }
    
    return { success: true, actions };
  } catch (error: any) {
    console.error('Error repairing user roles:', error);
    return { success: false, actions: [error.message] };
  }
}

/**
 * Repair roles for a specific user
 * @param userId User ID to repair
 */
export async function repairSpecificUser(userId: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const result = await repairUserRoles(userId);
    
    if (result.success) {
      return {
        success: true,
        message: `Successfully repaired user roles: ${result.actions.join(', ')}`
      };
    } else {
      return {
        success: false,
        message: `Failed to repair user roles: ${result.actions.join(', ')}`
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: `Error repairing user: ${error.message || 'Unknown error'}`
    };
  }
}

/**
 * Find and repair all users with inconsistent roles
 */
export async function repairInconsistentUsers(): Promise<{
  success: boolean;
  error?: string;
  results: {
    processed: number;
    repaired: number;
    failed: number;
    details: Array<{
      userId: string;
      name: string;
      status: string;
      message: string;
    }>;
  };
}> {
  try {
    const results = {
      processed: 0,
      repaired: 0,
      failed: 0,
      details: [] as Array<{
        userId: string;
        name: string;
        status: string;
        message: string;
      }>
    };
    
    // Get all profiles - SQL uses explicit table aliases
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, account_type");
      
    if (profilesError) {
      return {
        success: false,
        error: `Failed to fetch profiles: ${profilesError.message}`,
        results
      };
    }
    
    // Check each profile
    for (const profile of profiles || []) {
      results.processed++;
      
      try {
        // Check consistency before trying to repair with proper parameter naming
        const { data: checkData, error: checkError } = await supabase.rpc('check_and_repair_user_role_consistency', {
          p_user_id: profile.id,
          p_auto_repair: false
        });
        
        if (checkError) {
          results.failed++;
          results.details.push({
            userId: profile.id,
            name: profile.full_name || profile.id,
            status: 'failed',
            message: `Error checking consistency: ${checkError.message}`
          });
          continue;
        }
        
        // Use the safeBoolean helper to safely access the is_consistent property
        // Old: const isConsistent = safeBoolean(checkData, 'is_consistent');
        // Let's just use simple boolean coercion, or update safeBoolean if needed.
        const isConsistent = !!(checkData && typeof checkData === 'object' && 'is_consistent' in checkData && checkData.is_consistent);
        
        if (isConsistent) {
          // Already consistent
          results.details.push({
            userId: profile.id,
            name: profile.full_name || profile.id,
            status: 'already_consistent',
            message: 'No repair needed, roles are consistent'
          });
          continue;
        }
        
        // Repair inconsistent user
        const repairResult = await repairUserRoles(profile.id);
        
        if (repairResult.success) {
          results.repaired++;
          results.details.push({
            userId: profile.id,
            name: profile.full_name || profile.id,
            status: 'repaired',
            message: repairResult.actions.join(', ')
          });
        } else {
          results.failed++;
          results.details.push({
            userId: profile.id,
            name: profile.full_name || profile.id,
            status: 'failed',
            message: repairResult.actions.join(', ')
          });
        }
      } catch (error: any) {
        results.failed++;
        results.details.push({
          userId: profile.id,
          name: profile.full_name || profile.id,
          status: 'failed',
          message: error.message || 'Unknown error'
        });
      }
    }
    
    return { success: true, results };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Unknown error',
      results: {
        processed: 0,
        repaired: 0,
        failed: 0,
        details: []
      }
    };
  }
}
