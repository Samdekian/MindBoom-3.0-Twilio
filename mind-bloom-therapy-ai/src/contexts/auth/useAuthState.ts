
import { useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { UserRole } from '@/types/core/rbac';

interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
}

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [rolesFetchError, setRolesFetchError] = useState<string | null>(null);

  console.log('[useAuthState] Current state:', {
    hasUser: !!user,
    userRolesCount: userRoles.length,
    permissionsCount: permissions.length,
    loading,
    isInitialized
  });

  const resetAuthState = () => {
    console.log('[useAuthState] Resetting auth state');
    setUser(null);
    setSession(null);
    setUserRoles([]);
    setPermissions([]);
    setRolesFetchError(null);
  };

  const updateAuthState = (newUser: User | null, newSession: Session | null) => {
    console.log('[useAuthState] Updating auth state:', { hasUser: !!newUser, hasSession: !!newSession });
    setUser(newUser);
    setSession(newSession);
  };

  const updateRolesState = (roles: UserRole[], perms: Permission[]) => {
    console.log('[useAuthState] Updating roles state:', { rolesCount: roles.length, permsCount: perms.length });
    setUserRoles(roles);
    setPermissions(perms);
  };

  const setAuthError = (error: string) => {
    console.error('[useAuthState] Auth error:', error);
    setRolesFetchError(error);
  };

  return {
    user,
    session,
    userRoles,
    permissions,
    loading,
    isInitialized,
    rolesFetchError,
    setLoading,
    setIsInitialized,
    resetAuthState,
    updateAuthState,
    updateRolesState,
    setAuthError,
  };
};
