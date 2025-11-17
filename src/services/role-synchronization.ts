
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { UserRole } from '@/types/core/rbac';
import { mapLegacyRoleToUserRole, isValidUserRole } from '@/utils/auth/auth-compatibility';

// Type for extended roles (includes legacy roles)
export type ExtendedUserRole = UserRole | 'guest' | 'user';

/**
 * Initializes user role for a new user
 * @param userId User ID to initialize roles for
 * @param role Default role to assign
 * @returns Promise with success status
 */
export async function initializeUserRole(userId: string, role: UserRole): Promise<boolean> {
  try {
    console.log(`Initializing role '${role}' for user: ${userId}`);
    
    // Add primary role to the user
    const { data, error } = await supabase.rpc('manage_user_role', {
      p_user_id: userId,
      p_role_name: role,
      p_operation: 'assign'
    });
    
    if (error) {
      console.error('Error initializing user role:', error);
      
      // Log the error to audit logs for investigation
      try {
        await supabase.from('audit_logs').insert({
          user_id: userId,
          activity_type: 'role_init_failed',
          resource_type: 'user_roles',
          resource_id: userId,
          metadata: {
            role,
            error: error.message
          }
        });
      } catch (logError) {
        console.error('Failed to log role initialization error:', logError);
      }
      
      throw error;
    }
    
    // Log successful role initialization
    try {
      await supabase.from('audit_logs').insert({
        user_id: userId,
        activity_type: 'role_initialized',
        resource_type: 'user_roles',
        resource_id: userId,
        metadata: {
          role,
          success: true
        }
      });
    } catch (logErr) {
      console.error('Failed to log role initialization:', logErr);
    }
    
    console.log(`Successfully initialized role '${role}' for user: ${userId}`);
    return true;
  } catch (error) {
    console.error('Error initializing user role:', error);
    return false;
  }
}

/**
 * Fetches all roles for a user from DB
 * @param userId User ID to fetch roles for
 * @returns Array of user roles
 */
export async function getUserRolesFromDB(userId: string): Promise<UserRole[]> {
  try {
    const { data, error } = await supabase.rpc('get_user_roles', { 
      p_user_id: userId 
    });
    
    if (error) throw error;
    
    // Map and validate roles
    return (data || [])
      .map(roleObj => {
        const roleName = roleObj.role_name;
        if (isValidUserRole(roleName)) {
          return roleName;
        } else {
          // Map legacy roles to valid ones
          return mapLegacyRoleToUserRole(roleName);
        }
      });
  } catch (error) {
    console.error('Error fetching user roles from DB:', error);
    return [];
  }
}

/**
 * Synchronizes user roles between auth.users metadata and the roles table
 * @param userId User ID to synchronize roles for
 * @returns Object with success status and details
 */
export async function syncUserRoles(userId: string): Promise<boolean> {
  try {
    // Call the database function to sync user metadata with roles
    const { data, error } = await supabase.rpc('sync_user_roles', { 
      p_user_id: userId  // Use p_user_id - this is what the sync_user_roles function expects
    });
    
    if (error) throw error;
    
    return !!data;
  } catch (error) {
    console.error('Error synchronizing user roles:', error);
    return false;
  }
}

/**
 * Extract roles from user metadata
 * @param user User object
 * @returns Array of roles
 */
function extractRolesFromMetadata(user: User): ExtendedUserRole[] {
  // Check both user_metadata for roles (supabase-js v2 naming)
  const metaRoles = user.user_metadata?.roles || [];
  
  // Handle single role (string) or array of roles
  if (typeof metaRoles === 'string') {
    return [metaRoles as ExtendedUserRole];
  }
  
  if (Array.isArray(metaRoles)) {
    return metaRoles.filter((role): role is ExtendedUserRole => 
      typeof role === 'string' && 
      (isValidUserRole(role) || role === 'guest' || role === 'user')
    );
  }
  
  // Default role based on accountType if present
  const accountType = user.user_metadata?.accountType;
  if (accountType) {
    if (accountType === 'admin') return ['admin'];
    if (accountType === 'therapist') return ['therapist'];
    if (accountType === 'patient') return ['patient'];
    if (accountType === 'support') return ['support'];
  }
  
  // Legacy fallback - map guest and user to patient
  if (user.user_metadata?.legacy_role === 'guest' || user.user_metadata?.legacy_role === 'user') {
    return ['patient'];
  }
  
  return ['patient']; // Default fallback
}

/**
 * Add a role to a user
 * @param userId User ID
 * @param role Role to add
 * @returns Object with success status
 */
async function addRoleToUser(userId: string, role: UserRole) {
  try {
    const { error } = await supabase.rpc('manage_user_role', {
      p_user_id: userId,
      p_role_name: role,
      p_operation: 'assign'
    });
    
    if (error) throw error;
    
    return {
      success: true,
      action: 'add',
      role
    };
  } catch (error) {
    console.error(`Error adding role ${role} to user ${userId}:`, error);
    return {
      success: false,
      action: 'add',
      role,
      error
    };
  }
}

/**
 * Remove a role from a user
 * @param userId User ID
 * @param role Role to remove
 * @returns Object with success status
 */
async function removeRoleFromUser(userId: string, role: UserRole) {
  try {
    const { error } = await supabase.rpc('manage_user_role', {
      p_user_id: userId,
      p_role_name: role,
      p_operation: 'remove'
    });
    
    if (error) throw error;
    
    return {
      success: true,
      action: 'remove',
      role
    };
  } catch (error) {
    console.error(`Error removing role ${role} from user ${userId}:`, error);
    return {
      success: false,
      action: 'remove',
      role,
      error
    };
  }
}

/**
 * Verify if user roles are consistent between DB and metadata
 * @param userId User ID to check
 * @returns Object with consistency check results
 */
export async function verifyUserRoleConsistency(userId: string): Promise<{
  isConsistent: boolean;
  primaryRole?: string | null;
  profileRole?: string | null;
  metadataRole?: string | null;
}> {
  try {
    const { data, error } = await supabase.rpc('verify_user_role_consistency', {
      p_user_id: userId  // Use p_user_id as that's what this function expects
    });
    
    if (error) throw error;
    
    // Safely handle JSON data - need to type cast and check properties
    const result = data as Record<string, unknown> || {};
    
    return {
      isConsistent: typeof result.isConsistent === 'boolean' ? result.isConsistent : false,
      primaryRole: typeof result.primaryRole === 'string' ? result.primaryRole : null,
      profileRole: typeof result.profileRole === 'string' ? result.profileRole : null,
      metadataRole: typeof result.metadataRole === 'string' ? result.metadataRole : null
    };
  } catch (error) {
    console.error('Error verifying user role consistency:', error);
    return { isConsistent: false };
  }
}

/**
 * Retry synchronizing user roles with exponential backoff
 * @param userId User ID to retry sync for
 * @param attempts Maximum number of retry attempts
 * @param delay Initial delay in milliseconds
 */
export async function retrySyncUserRoles(
  userId: string,
  attempts: number = 3,
  delay: number = 1000
): Promise<boolean> {
  let currentAttempt = 0;
  
  const attemptSync = async (): Promise<boolean> => {
    try {
      const success = await syncUserRoles(userId);
      
      if (success) {
        console.log(`Successfully synchronized roles for user ${userId} on attempt ${currentAttempt + 1}`);
        return true;
      }
      
      if (currentAttempt < attempts - 1) {
        currentAttempt++;
        const nextDelay = delay * Math.pow(2, currentAttempt); // Exponential backoff
        console.log(`Retrying role sync in ${nextDelay}ms (attempt ${currentAttempt + 1}/${attempts})`);
        
        return new Promise(resolve => {
          setTimeout(async () => {
            resolve(await attemptSync());
          }, nextDelay);
        });
      }
      
      console.error(`Failed to sync roles for user ${userId} after ${attempts} attempts`);
      return false;
    } catch (error) {
      console.error(`Error in retry attempt ${currentAttempt + 1}:`, error);
      
      if (currentAttempt < attempts - 1) {
        currentAttempt++;
        const nextDelay = delay * Math.pow(2, currentAttempt);
        
        return new Promise(resolve => {
          setTimeout(async () => {
            resolve(await attemptSync());
          }, nextDelay);
        });
      }
      
      return false;
    }
  };
  
  return attemptSync();
}
