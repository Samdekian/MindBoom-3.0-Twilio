
import { useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { UserRole } from '@/types/core/rbac';
import { Permission } from './types';

export const useSimplifiedAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Stable log function with error safety
  const log = useCallback((message: string, data?: any) => {
    try {
      console.log(`[AuthRBAC] ${message}`, data || '');
    } catch (error) {
      console.error('[AuthRBAC] Logging error:', error);
    }
  }, []);

  // Stable reset function
  const resetAuthState = useCallback(() => {
    try {
      log('Resetting auth state');
      setUser(null);
      setSession(null);
      setUserRoles([]);
      setPermissions([]);
      setIsInitialized(false);
    } catch (error) {
      console.error('[AuthRBAC] Error resetting auth state:', error);
    }
  }, [log]);

  // Stable update functions with error handling
  const updateAuthState = useCallback((newUser: User | null, newSession: Session | null) => {
    try {
      log('Updating auth state', { hasUser: !!newUser, hasSession: !!newSession });
      setUser(newUser);
      setSession(newSession);
      
      // Reset roles if user changed
      if (!newUser) {
        setUserRoles([]);
        setPermissions([]);
      }
    } catch (error) {
      console.error('[AuthRBAC] Error updating auth state:', error);
    }
  }, [log]);

  const updateRolesState = useCallback((roles: UserRole[], perms: Permission[]) => {
    try {
      log('Updating roles state', { rolesCount: roles?.length || 0, permsCount: perms?.length || 0 });
      setUserRoles(roles || []);
      setPermissions(perms || []);
    } catch (error) {
      console.error('[AuthRBAC] Error updating roles state:', error);
    }
  }, [log]);

  // Safe setters with error handling
  const setLoadingSafe = useCallback((loading: boolean) => {
    try {
      setLoading(loading);
    } catch (error) {
      console.error('[AuthRBAC] Error setting loading:', error);
    }
  }, []);

  const setIsInitializedSafe = useCallback((initialized: boolean) => {
    try {
      setIsInitialized(initialized);
    } catch (error) {
      console.error('[AuthRBAC] Error setting initialized:', error);
    }
  }, []);

  return {
    user,
    session,
    userRoles,
    permissions,
    loading,
    isInitialized,
    setLoading: setLoadingSafe,
    setIsInitialized: setIsInitializedSafe,
    resetAuthState,
    updateAuthState,
    updateRolesState,
    log,
  };
};
