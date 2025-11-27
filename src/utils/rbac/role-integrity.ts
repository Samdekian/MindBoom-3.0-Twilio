
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types/core/rbac";
import { asUserRoles } from "./type-adapters";

/**
 * Valid roles in the system
 */
export const VALID_ROLES: UserRole[] = ['admin', 'therapist', 'patient', 'support'];

/**
 * Default role to use when none is specified
 */
export const DEFAULT_ROLE: UserRole = 'patient';

/**
 * Check if a role is valid according to our system's defined roles
 */
export function isValidRole(role: string): role is UserRole {
  return VALID_ROLES.includes(role as UserRole);
}

/**
 * Find and correct invalid roles in the database
 * @returns Statistics about corrected roles
 */
export async function migrateInvalidRoles(): Promise<{
  scanned: number;
  fixed: number;
  errors: string[];
}> {
  const result = {
    scanned: 0,
    fixed: 0,
    errors: [] as string[]
  };
  
  try {
    // Get role information from the roles table
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id, name');
    
    if (roleError) {
      result.errors.push(`Error fetching roles: ${roleError.message}`);
      return result;
    }
    
    // Check that all required roles exist
    const existingRoles = roleData?.map(r => r.name) || [];
    const missingRoles = VALID_ROLES.filter(role => !existingRoles.includes(role));
    
    if (missingRoles.length > 0) {
      result.errors.push(`Missing required roles in database: ${missingRoles.join(', ')}`);
    }
    
    // Get user role assignments
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .select(`
        id,
        user_id,
        role_id,
        roles (
          id,
          name
        )
      `);
    
    if (userRolesError) {
      result.errors.push(`Error fetching user roles: ${userRolesError.message}`);
      return result;
    }
    
    result.scanned = userRoles?.length || 0;
    
    // Find role mappings with invalid or outdated roles
    const roleMap: Record<string, string> = {};
    if (roleData) {
      for (const role of roleData) {
        roleMap[role.name] = role.id;
      }
    }
    
    // Track users that need to be updated
    const usersToUpdate: Record<string, string> = {};
    
    // Identify invalid roles
    for (const userRole of userRoles || []) {
      // Fix the access to role name from the roles object
      const roleObj = userRole.roles as unknown as { id: string; name: string };
      const roleName = roleObj ? roleObj.name : null;
      
      if (!roleName || !isValidRole(roleName)) {
        const userId = userRole.user_id;
        
        // Delete the invalid role assignment
        const { error: deleteError } = await supabase
          .from('user_roles')
          .delete()
          .eq('id', userRole.id);
        
        if (deleteError) {
          result.errors.push(`Failed to delete invalid role for user ${userId}: ${deleteError.message}`);
          continue;
        }
        
        // Add user to the list needing a default role
        usersToUpdate[userId] = DEFAULT_ROLE;
        result.fixed++;
      }
    }
    
    // Assign default roles to users who had invalid roles
    for (const [userId, roleName] of Object.entries(usersToUpdate)) {
      if (!roleMap[roleName]) {
        result.errors.push(`Cannot assign default role ${roleName} to user ${userId} - role does not exist`);
        continue;
      }
      
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role_id: roleMap[roleName]
        });
      
      if (insertError) {
        result.errors.push(`Failed to assign default role to user ${userId}: ${insertError.message}`);
      }
    }
    
    // Automatically repair all users with role inconsistencies
    const { data: syncData, error: syncError } = await supabase
      .rpc('sync_user_roles');  // This function will be called without parameters to sync all users
      
    if (syncError) {
      result.errors.push(`Failed to sync roles: ${syncError.message}`);
    }
    
  } catch (error: any) {
    result.errors.push(`Unexpected error during role migration: ${error.message}`);
  }
  
  return result;
}

/**
 * Get role ID by role name
 */
export async function getRoleIdByName(roleName: UserRole): Promise<string | null> {
  if (!isValidRole(roleName)) {
    return null;
  }
  
  const { data, error } = await supabase
    .from('roles')
    .select('id')
    .eq('name', roleName)
    .single();
  
  if (error || !data) {
    return null;
  }
  
  return data.id;
}

/**
 * Make sure a user has at least one valid role
 */
export async function ensureUserHasValidRole(userId: string): Promise<boolean> {
  try {
    // Check if user has any valid roles
    // Use p_user_id parameter to match the function parameter
    const { data, error } = await supabase.rpc('get_user_roles', { p_user_id: userId });
    
    if (error) throw error;
    
    // Use proper type handling for the returned role objects
    const roleObjects = data || [];
    const validRoles = roleObjects.filter(roleObj => isValidRole(roleObj.role_name));
    
    if (validRoles.length > 0) {
      return true; // User already has valid roles
    }
    
    // User has no valid roles, assign the default role
    const defaultRoleId = await getRoleIdByName(DEFAULT_ROLE);
    
    if (!defaultRoleId) {
      throw new Error(`Default role ${DEFAULT_ROLE} not found in database`);
    }
    
    // Assign default role
    const { error: insertError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role_id: defaultRoleId
      });
    
    if (insertError) throw insertError;
    
    // Sync the user's roles to ensure consistency
    await supabase.rpc('sync_user_roles', { p_user_id: userId });
    
    return true;
  } catch (error) {
    console.error('Error ensuring user has valid role:', error);
    return false;
  }
}

/**
 * Check database for integrity of roles table
 */
export async function checkRolesTableIntegrity(): Promise<{
  valid: boolean;
  missingRoles: UserRole[];
  message: string;
}> {
  try {
    // Get all roles from the database
    const { data, error } = await supabase
      .from('roles')
      .select('name');
    
    if (error) throw error;
    
    const existingRoles = (data || []).map(r => r.name);
    const missingRoles = VALID_ROLES.filter(role => !existingRoles.includes(role));
    
    return {
      valid: missingRoles.length === 0,
      missingRoles: missingRoles as UserRole[],
      message: missingRoles.length === 0 
        ? 'All required roles exist in the database' 
        : `Missing roles: ${missingRoles.join(', ')}`
    };
  } catch (error: any) {
    return {
      valid: false,
      missingRoles: [],
      message: `Error checking roles table: ${error.message}`
    };
  }
}

/**
 * Checks role consistency for a single user
 * @param userId User ID to check
 * @returns Object with check results
 */
export async function checkRoleConsistency(userId: string): Promise<{
  isConsistent: boolean;
  issues: string[];
  databaseRoles: UserRole[];
}> {
  try {
    const issues: string[] = [];
    
    // Get roles from database using RPC function with proper parameter naming
    const { data: dbRolesData, error: dbError } = await supabase.rpc('get_user_roles', {
      p_user_id: userId
    });
    
    if (dbError) {
      issues.push(`Error fetching database roles: ${dbError.message}`);
      return { isConsistent: false, issues, databaseRoles: [] };
    }
    
    // Convert from returned format to UserRole[]
    const databaseRoles = asUserRoles((dbRolesData || []).map(r => r.role_name));
    
    return {
      isConsistent: true,
      issues,
      databaseRoles
    };
  } catch (error) {
    console.error('Error checking role consistency:', error);
    return { isConsistent: false, issues: [], databaseRoles: [] };
  }
}
