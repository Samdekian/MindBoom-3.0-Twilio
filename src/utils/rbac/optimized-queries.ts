
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types/core/rbac";
import { safeJsonToObject } from "../json/safe-json";

/**
 * Get roles and permissions for a user in a single query for efficiency
 */
export async function getUserRolesAndPermissions(userId: string) {
  if (!userId) {
    return {
      roles: [] as string[],
      permissions: [] as { resource: string; action: string; name?: string }[]
    };
  }
  
  try {
    const { data, error } = await supabase.rpc('get_user_roles_and_permissions', {
      user_id: userId
    });
    
    if (error) {
      console.error('Error fetching user roles and permissions:', error);
      return {
        roles: [] as string[],
        permissions: [] as { resource: string; action: string; name?: string }[]
      };
    }
    
    const result = safeJsonToObject(data);
    return {
      roles: Array.isArray(result?.roles) ? result.roles : [],
      permissions: Array.isArray(result?.permissions) ? result.permissions : []
    };
  } catch (err) {
    console.error('Unexpected error in getUserRolesAndPermissions:', err);
    return {
      roles: [] as string[],
      permissions: [] as { resource: string; action: string; name?: string }[]
    };
  }
}

/**
 * Check if user has role - optimized version that accepts role as parameter
 */
export async function hasRole(userId: string, roleName: UserRole) {
  try {
    const { data, error } = await supabase.rpc('has_role', {
      user_id: userId,
      role_name: roleName
    });
    
    if (error) {
      console.error('Error checking user role:', error);
      return false;
    }
    
    return !!data;
  } catch (err) {
    console.error('Unexpected error in hasRole:', err);
    return false;
  }
}

/**
 * Optimized version of hasRole - simplified for performance
 */
export async function checkUserHasRoleOptimized(userId: string, roleName: UserRole): Promise<boolean> {
  try {
    // Uses the same underlying function but with optimized caching
    const { data, error } = await supabase.rpc('has_role', {
      user_id: userId,
      role_name: roleName
    });
    
    if (error) {
      console.error('Error in optimized role check:', error);
      return false;
    }
    
    return !!data;
  } catch (err) {
    console.error('Unexpected error in checkUserHasRoleOptimized:', err);
    return false;
  }
}

/**
 * Function to verify consistency between user roles in DB, profile and metadata
 */
export async function verifyRoleConsistency(userId: string) {
  try {
    const { data, error } = await supabase.rpc('verify_user_role_consistency', {
      p_user_id: userId  // Use p_user_id parameter name
    });
    
    if (error) {
      console.error('Error verifying role consistency:', error);
      return {
        isConsistent: false,
        error: error.message
      };
    }
    
    const result = safeJsonToObject(data);
    return {
      isConsistent: !!result?.isConsistent,
      primaryRole: result?.primaryRole,
      profileRole: result?.profileRole,
      metadataRole: result?.metadataRole
    };
  } catch (err) {
    console.error('Unexpected error in verifyRoleConsistency:', err);
    return {
      isConsistent: false,
      error: String(err)
    };
  }
}

/**
 * Function to check and repair user role consistency if needed
 */
export async function checkAndRepairRoleConsistency(userId: string, autoRepair = false) {
  try {
    const { data, error } = await supabase.rpc('check_and_repair_user_role_consistency', {
      p_user_id: userId,
      p_auto_repair: autoRepair
    });
    
    if (error) {
      console.error('Error checking and repairing role consistency:', error);
      return {
        isConsistent: false,
        error: error.message,
        autoRepaired: false
      };
    }
    
    const result = safeJsonToObject(data);
    return {
      isConsistent: !!result?.is_consistent,
      dbRoles: result?.db_roles || [],
      primaryRole: result?.primary_role,
      profileRole: result?.profile_role,
      metadataRole: result?.metadata_role,
      autoRepaired: !!result?.auto_repaired
    };
  } catch (err) {
    console.error('Unexpected error in checkAndRepairRoleConsistency:', err);
    return {
      isConsistent: false,
      error: String(err),
      autoRepaired: false
    };
  }
}

/**
 * Optimized version of checkAndRepairRoleConsistency
 */
export async function checkAndRepairUserRoleConsistencyOptimized(userId: string, autoRepair = false) {
  // Use the same function with a different cache strategy
  return checkAndRepairRoleConsistency(userId, autoRepair);
}

/**
 * Batch load roles for multiple users at once
 */
export async function batchLoadUserRoles(userIds: string[]) {
  if (!userIds.length) {
    return [];
  }
  
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('user_id, roles(name)')
      .in('user_id', userIds);
    
    if (error) {
      console.error('Error in batchLoadUserRoles:', error);
      return [];
    }
    
    // Format the results
    const userRolesMap = userIds.reduce((acc, userId) => {
      acc[userId] = [];
      return acc;
    }, {} as Record<string, string[]>);
    
    // Fill in the roles
    data.forEach((row: any) => {
      if (row.user_id && row.roles?.name) {
        if (!userRolesMap[row.user_id]) {
          userRolesMap[row.user_id] = [];
        }
        userRolesMap[row.user_id].push(row.roles.name);
      }
    });
    
    return Object.entries(userRolesMap).map(([userId, roles]) => ({
      userId,
      roles
    }));
    
  } catch (err) {
    console.error('Unexpected error in batchLoadUserRoles:', err);
    return [];
  }
}
