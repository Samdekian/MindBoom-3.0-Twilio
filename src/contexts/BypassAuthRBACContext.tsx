
import React, { createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { UserRole } from '@/types/core/rbac';
import { Permission } from '@/contexts/auth/types';

interface BypassAuthRBACContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: UserRole[];
  permissions: Permission[];
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAllRoles: (roles: string[]) => boolean;
  refreshRoles: () => Promise<void>;
  performConsistencyCheck: () => Promise<boolean>;
}

const BypassAuthRBACContext = createContext<BypassAuthRBACContextType | undefined>(undefined);

export const useBypassAuthRBAC = () => {
  const context = useContext(BypassAuthRBACContext);
  if (context === undefined) {
    throw new Error('useBypassAuthRBAC must be used within a BypassAuthRBACProvider');
  }
  return context;
};

export const BypassAuthRBACProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Mock implementation that bypasses all checks
  const value: BypassAuthRBACContextType = {
    user: null,
    session: null,
    loading: false,
    roles: ['admin'], // Always return admin role
    permissions: [],
    hasRole: () => true, // Always return true
    hasAnyRole: () => true,
    hasAllRoles: () => true,
    refreshRoles: async () => {},
    performConsistencyCheck: async () => true,
  };

  return (
    <BypassAuthRBACContext.Provider value={value}>
      {children}
    </BypassAuthRBACContext.Provider>
  );
};
