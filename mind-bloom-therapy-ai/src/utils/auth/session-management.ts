
import { nanoid } from 'nanoid';
import { supabase } from "@/integrations/supabase/client";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { rbacRateLimiter } from "@/utils/rbac/rate-limiter";

/**
 * Session management utilities for enhanced security
 */
export const sessionManager = {
  /**
   * Generate a secure session identifier
   */
  generateSessionId: (): string => {
    return nanoid(32); // Generate a cryptographically secure ID
  },

  /**
   * Extend the current session if activity is detected
   */
  extendSession: async (): Promise<boolean> => {
    try {
      const { data } = await supabase.auth.refreshSession();
      return !!data.session;
    } catch (error) {
      console.error('Failed to extend session:', error);
      return false;
    }
  },

  /**
   * End the current session
   */
  endSession: async (): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signOut();
      return !error;
    } catch (error) {
      console.error('Failed to end session:', error);
      return false;
    }
  },

  /**
   * Record authentication attempt for rate limiting
   * @returns true if the attempt is allowed, false if rate limited
   */
  recordAuthAttempt: (identifier: string): boolean => {
    const key = `auth_attempt:${identifier}`;
    return rbacRateLimiter.isAllowed(key);
  },

  /**
   * Initialize rate limiting settings
   */
  configureRateLimits: (): void => {
    // Implement stricter rate limits for authentication endpoints
    rbacRateLimiter.setLimits(5, 60 * 1000); // 5 attempts per minute
  }
};

/**
 * Hook for session management in components
 */
export function useSessionManagement() {
  const { user } = useAuthRBAC();
  
  // Simplified session management hook interface without timeouts
  return {
    extendSession: sessionManager.extendSession,
    endSession: sessionManager.endSession,
    isAuthenticated: !!user,
    userId: user?.id
  };
}
