
import { supabase } from "@/integrations/supabase/client";
import { initializeUserRole, syncUserRoles, retrySyncUserRoles, getUserRolesFromDB } from "../role-synchronization";
import { UserRole } from "@/utils/rbac/types";
import { AuthSignUpResult, AuthSignInResult, AuthSignOutResult } from "./auth-types";

/**
 * Core authentication functions for signup, signin, and signout
 */

/**
 * Sign up a new user with role initialization
 */
export const signUpWithRole = async (
  email: string,
  password: string,
  name: string,
  accountType: string
): Promise<AuthSignUpResult> => {
  try {
    // Register the user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
          full_name: name,
          accountType,
        }
      }
    });

    if (error) throw error;
    if (!data.user) throw new Error("User creation failed");

    // Map the account type to a role
    const roleMap: Record<string, UserRole> = {
      'admin': 'admin',
      'therapist': 'therapist',
      'patient': 'patient',
      'support': 'support'
    };

    const userRole = roleMap[accountType] || 'patient';
    
    // Initialize the user's role in the RBAC system
    const roleInitialized = await initializeUserRole(data.user.id, userRole);
    
    if (!roleInitialized) {
      console.warn(`User created but role initialization failed. Will retry in background: ${data.user.id}`);
      // Start background retry without waiting
      setTimeout(() => retrySyncUserRoles(data.user.id), 0);
    }

    return {
      success: true,
      userId: data.user.id
    };
  } catch (error) {
    console.error("Sign up error:", error);
    return {
      success: false,
      error
    };
  }
};

/**
 * Sign in a user and ensure their roles are properly synchronized
 */
export const signInWithRoleSync = async (
  email: string,
  password: string
): Promise<AuthSignInResult> => {
  try {
    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    if (!data.user) throw new Error("Sign in failed");

    // Get the user's roles from the RBAC system
    const roles = await getUserRolesFromDB(data.user.id);
    
    // Ensure the user's roles are properly synchronized
    setTimeout(() => syncUserRoles(data.user.id), 0);

    return {
      success: true,
      user: data.user,
      roles
    };
  } catch (error) {
    console.error("Sign in error:", error);
    return {
      success: false,
      error
    };
  }
};

/**
 * Sign out a user
 */
export const signOutUser = async (): Promise<AuthSignOutResult> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Sign out error:", error);
    return {
      success: false,
      error
    };
  }
};
