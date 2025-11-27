
import { useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { UserRole } from '@/types/core/rbac';
import { Permission } from './types';

const ROLE_CACHE_KEY = 'auth_rbac_roles_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_RETRIES = 3;

interface CachedRoles {
  roles: UserRole[];
  permissions: Permission[];
  timestamp: number;
  userId: string;
}

export const useEnhancedAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Stable log function with error safety
  const log = useCallback((message: string, data?: any) => {
    try {
      console.log(`[AuthRBAC] ${message}`, data || '');
    } catch (error) {
      console.error('[AuthRBAC] Logging error:', error);
    }
  }, []);

  const resetAuthState = useCallback(() => {
    log('Resetting auth state');
    setUser(null);
    setSession(null);
    setUserRoles([]);
    setPermissions([]);
    setRetryCount(0);
    // Clear cache on logout
    try {
      localStorage.removeItem(ROLE_CACHE_KEY);
    } catch (error) {
      log('Error clearing cache', error);
    }
  }, [log]);

  const updateAuthState = useCallback((newUser: User | null, newSession: Session | null) => {
    log('Updating auth state', { hasUser: !!newUser, hasSession: !!newSession });
    setUser(newUser);
    setSession(newSession);
    
    // Reset roles if user changed
    if (!newUser) {
      setUserRoles([]);
      setPermissions([]);
    }
  }, [log]);

  const updateRolesState = useCallback((roles: UserRole[], perms: Permission[]) => {
    log('Updating roles state', { rolesCount: roles.length, permsCount: perms.length });
    setUserRoles(roles);
    setPermissions(perms);
    
    // Cache the roles if we have a user
    if (user?.id) {
      try {
        const cached: CachedRoles = {
          roles,
          permissions: perms,
          timestamp: Date.now(),
          userId: user.id
        };
        localStorage.setItem(ROLE_CACHE_KEY, JSON.stringify(cached));
      } catch (error) {
        log('Error caching roles', error);
      }
    }
  }, [user?.id, log]);

  const getCachedRoles = useCallback((userId: string): CachedRoles | null => {
    try {
      const cached = localStorage.getItem(ROLE_CACHE_KEY);
      if (!cached) return null;
      
      const parsedCache: CachedRoles = JSON.parse(cached);
      
      // Check if cache is valid
      const isExpired = Date.now() - parsedCache.timestamp > CACHE_TTL;
      const isWrongUser = parsedCache.userId !== userId;
      
      if (isExpired || isWrongUser) {
        localStorage.removeItem(ROLE_CACHE_KEY);
        return null;
      }
      
      return parsedCache;
    } catch (error) {
      log('Error reading role cache', error);
      try {
        localStorage.removeItem(ROLE_CACHE_KEY);
      } catch (clearError) {
        log('Error clearing invalid cache', clearError);
      }
      return null;
    }
  }, [log]);

  const incrementRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  const shouldRetry = useCallback(() => {
    return retryCount < MAX_RETRIES;
  }, [retryCount]);

  return {
    user,
    session,
    userRoles,
    permissions,
    loading,
    isInitialized,
    retryCount,
    setLoading,
    setIsInitialized,
    resetAuthState,
    updateAuthState,
    updateRolesState,
    getCachedRoles,
    incrementRetry,
    shouldRetry,
    log,
  };
};
