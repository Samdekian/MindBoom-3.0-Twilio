import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/core/rbac';
import { mapLegacyRoleToUserRole, isValidUserRole } from '@/utils/auth/auth-compatibility';

export type ExtendedUserRole = UserRole | 'guest' | 'user';

/**
 * Fetches all roles for a given user
 * @param userId User ID to fetch roles for
 * @returns Array of user roles
 */
export async function getUserRoles(userId: string): Promise<UserRole[]> {
  try {
    const { data, error } = await supabase.rpc('get_user_roles', { 
      p_user_id: userId 
    });

    if (error) throw error;

    if (!Array.isArray(data)) return [];

    // Map the role objects to string roles and validate
    return data.map(roleObj => {
      const roleName = roleObj.role_name;
      if (isValidUserRole(roleName)) {
        return roleName;
      } else {
        // Map legacy roles to valid ones
        return mapLegacyRoleToUserRole(roleName);
      }
    });
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return [];
  }
}

/**
 * Adds a role to a user
 * @param userId User ID
 * @param role Role to add
 * @returns Success status
 */
export async function addRoleToUser(userId: string, role: ExtendedUserRole): Promise<boolean> {
  try {
    // Map legacy roles to valid ones
    const validRole = isValidUserRole(role) ? role : mapLegacyRoleToUserRole(role);
    
    // Use manage_user_role instead of add_role_to_user
    const { error } = await supabase.rpc('manage_user_role', {
      p_user_id: userId,
      p_role_name: validRole,
      p_operation: 'assign'
    });
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(`Error adding role ${role} to user:`, error);
    return false;
  }
}

/**
 * Checks if a user has a specific role
 * @param userId User ID
 * @param role Role to check
 * @returns Boolean indicating if the user has the role
 */
export async function userHasRole(userId: string, role: ExtendedUserRole): Promise<boolean> {
  try {
    // For legacy roles, map them to valid roles
    let validRole: UserRole;
    
    if (role === 'guest' || role === 'user') {
      validRole = 'patient';
    } else if (isValidUserRole(role)) {
      validRole = role;
    } else {
      console.warn(`Invalid role "${role}" in userHasRole check`);
      return false;
    }
    
    // Use has_role instead of user_has_role
    const { data, error } = await supabase.rpc('has_role', {
      user_id: userId,
      role_name: validRole
    });
    
    if (error) throw error;
    
    return !!data;
  } catch (error) {
    console.error(`Error checking if user has role ${role}:`, error);
    return false;
  }
}

/**
 * Log RBAC errors to the audit log system
 */
export async function logRBACError(
  userId: string,
  errorType: string,
  errorMessage: string,
  metadata: Record<string, any> = {}
): Promise<boolean> {
  try {
    // Add an entry to the audit_logs table instead of using logRBACEvent
    await supabase.from('audit_logs').insert({
      user_id: userId,
      activity_type: `rbac_error_${errorType}`,
      resource_type: 'rbac_system',
      resource_id: userId,
      metadata: {
        error_message: errorMessage,
        ...metadata,
        timestamp: new Date().toISOString()
      }
    });
    return true;
  } catch (error) {
    console.error('Failed to log RBAC error:', error);
    return false;
  }
}

/**
 * Assign a role to a user
 */
export async function assignRoleToUser(
  userId: string,
  roleName: UserRole
): Promise<{ success: boolean; message: string }> {
  try {
    const { data, error } = await supabase.rpc(
      'manage_user_role',
      {
        p_user_id: userId,
        p_role_name: roleName,
        p_operation: 'assign'
      }
    );
    
    if (error) {
      throw error;
    }
    
    const result = data as Record<string, any>;
    
    return {
      success: result.success || false,
      message: result.message || 'Role assignment completed'
    };
  } catch (error: any) {
    console.error('Error assigning role:', error);
    return {
      success: false,
      message: error.message || 'Failed to assign role'
    };
  }
}

/**
 * Remove a role from a user
 */
export async function removeRoleFromUser(
  userId: string,
  roleName: UserRole
): Promise<{ success: boolean; message: string }> {
  try {
    const { data, error } = await supabase.rpc(
      'manage_user_role',
      {
        p_user_id: userId,
        p_role_name: roleName,
        p_operation: 'remove'
      }
    );
    
    if (error) {
      throw error;
    }
    
    const result = data as Record<string, any>;
    
    return {
      success: result.success || false,
      message: result.message || 'Role removal completed'
    };
  } catch (error: any) {
    console.error('Error removing role:', error);
    return {
      success: false,
      message: error.message || 'Failed to remove role'
    };
  }
}

/**
 * Get all available roles in the system
 */
export async function getAllRoles(): Promise<UserRole[]> {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('name')
      .order('name');
      
    if (error) {
      throw error;
    }
    
    return (data || []).map(role => role.name as UserRole);
  } catch (error) {
    console.error('Error fetching roles:', error);
    return [];
  }
}

/**
 * Check if a user has a specific role
 */
export async function checkUserHasRole(
  userId: string,
  roleName: UserRole
): Promise<boolean> {
  try {
    // For basic roles that may not be in the database yet,
    // we'll default to a basic check - using type assertion since these are legacy cases
    const legacyRole = roleName as unknown as string;
    if (legacyRole === 'guest' || legacyRole === 'user') {
      return true; // Assume all users have these basic roles
    }
    
    const { data, error } = await supabase.rpc(
      'has_role',
      {
        user_id: userId,
        role_name: roleName
      }
    );
    
    if (error) {
      throw error;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
}
