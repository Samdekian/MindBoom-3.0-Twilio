import { supabase } from '@/integrations/supabase/client';
import { RoleDiagnosticResult, UserRole } from '@/types/core/rbac';
import { safeJsonAccess, safeJsonToObject } from '@/utils/json-utils';

/**
 * Checks if a value is truthy (not null, undefined, or false)
 */
function isTruthy(value: any): boolean {
  return !!value;
}

/**
 * Checks if a role exists in the database
 */
async function roleExists(role: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('id')
      .eq('name', role)
      .single();

    if (error) {
      console.error('Error checking role existence:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking role existence:', error);
    return false;
  }
}

/**
 * Checks if a user has a specific role
 */
async function userHasRole(userId: string, role: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('role', role)
      .single();

    if (error) {
      console.error('Error checking user role:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
}

/**
 * Retrieves roles assigned to a user
 */
async function getUserRoles(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }

    return data.map(item => item.role);
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return [];
  }
}

/**
 * Checks if a user profile exists
 */
async function profileExists(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error checking profile existence:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking profile existence:', error);
    return false;
  }
}

/**
 * Retrieves user profile data
 */
async function getUserProfile(userId: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Checks if user metadata is consistent
 */
async function isMetadataConsistent(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, user_metadata')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user metadata:', error);
      return false;
    }

    const metadata = safeJsonToObject(data?.user_metadata);
    const email = data?.email;

    if (!metadata || !email) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking metadata consistency:', error);
    return false;
  }
}

/**
 * Performs a comprehensive role integrity check for a user
 */
export async function checkRoleIntegrity(userId: string): Promise<RoleDiagnosticResult> {
  try {
    const dbRoles = await getUserRoles(userId);
    const profile = await getUserProfile(userId);
    const profileRole = profile?.account_type;
    const metadataConsistent = await isMetadataConsistent(userId);
    const userExists = await profileExists(userId);

    let isConsistent = true;
    const errors: string[] = [];

    if (!userExists) {
      isConsistent = false;
      errors.push('User profile does not exist');
    }

    if (!metadataConsistent) {
      isConsistent = false;
      errors.push('User metadata is inconsistent');
    }

    if (profileRole && !dbRoles.includes(profileRole)) {
      isConsistent = false;
      errors.push('Profile role does not match database roles');
    }

    if (dbRoles.length === 0 && profileRole) {
      isConsistent = false;
      errors.push('User has a profile role but no database roles');
    }

    return {
      userId,
      userExists,
      isConsistent,
      databaseRoles: dbRoles,
      profileRole,
      errors,
      severity: isConsistent ? 'low' : 'medium',
      issue: isConsistent ? 'Role data is consistent' : 'Role inconsistency detected',
      suggestedFixes: isConsistent ? [] : ['Update profile to match database roles', 'Synchronize role metadata']
    };
  } catch (error: any) {
    console.error('Error checking role integrity:', error);

    return {
      userId,
      userExists: false,
      isConsistent: false,
      databaseRoles: [],
      errors: [error.message || 'Unknown error occurred'],
      severity: 'high',
      issue: 'Error checking roles',
      suggestedFixes: ['Please contact support if this error persists']
    };
  }
}
