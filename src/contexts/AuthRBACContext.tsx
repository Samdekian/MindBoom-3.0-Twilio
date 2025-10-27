import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/core/rbac';
import { useToast } from '@/hooks/use-toast';


export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
}

export interface AuthRBACContextType {
  // Auth state
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  loading: boolean;
  rolesLoaded: boolean;
  
  // Role state
  userRoles: UserRole[];
  roles: UserRole[];
  primaryRole: UserRole | undefined;
  permissions: Permission[];
  
  // Role checking methods
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAllRoles: (roles: string[]) => boolean;
  isAdmin: boolean;
  isTherapist: boolean;
  isPatient: boolean;
  isSupport: boolean;
  
  // Permission methods
  hasPermission: (permission: string) => boolean;
  checkPermissions: (permissions: Permission[], options?: { requireAll?: boolean }) => boolean;
  getFieldAccess: (fieldName: string) => { readOnly: boolean; hidden: boolean; mask: boolean };
  
  // Auth methods
  signOut: () => Promise<void>;
  
  // Management methods
  refreshRoles: () => Promise<void>;
  performConsistencyCheck: () => Promise<boolean>;
}

const AuthRBACContext = createContext<AuthRBACContextType | undefined>(undefined);

interface AuthRBACProviderProps {
  children: ReactNode;
}

export const AuthRBACProvider: React.FC<AuthRBACProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolesLoaded, setRolesLoaded] = useState(false);
  const { toast } = useToast();

  // Helper function to extract roles from user metadata
  const getUserRolesFromMetadata = (user: any): UserRole[] => {
    if (!user) {
      console.log('[AuthRBAC] No user provided to getUserRolesFromMetadata');
      return [];
    }

    const accountType = user?.raw_user_meta_data?.accountType;
    console.log('[AuthRBAC] User ID:', user.id);
    console.log('[AuthRBAC] Full metadata:', user.raw_user_meta_data);
    console.log('[AuthRBAC] Extracting role from metadata accountType:', accountType);
    
    if (accountType && ['admin', 'therapist', 'patient', 'support'].includes(accountType)) {
      console.log('[AuthRBAC] Valid role found in metadata:', accountType);
      return [accountType as UserRole];
    }
    
    console.log('[AuthRBAC] No valid role in metadata, will attempt database fallback');
    return [];
  };

  // Helper function to fetch roles from database as fallback
  const fetchUserRolesFromDatabase = async (userId: string): Promise<UserRole[]> => {
    try {
      console.log('[AuthRBAC] Fetching roles from database for user:', userId);
      const { data, error } = await supabase.rpc('get_user_roles', { p_user_id: userId });

      if (error) {
        console.error('[AuthRBAC] Database role fetch error:', error);
        return ['patient']; // Fallback to patient on error
      }

      if (data && Array.isArray(data) && data.length > 0) {
        const roles = data.map(item => item.role_name).filter(Boolean) as UserRole[];
        console.log('[AuthRBAC] Database roles found:', roles);
        return roles.length > 0 ? roles : ['patient'];
      }

      console.log('[AuthRBAC] No roles found in database, defaulting to patient');
      return ['patient'];
    } catch (error) {
      console.error('[AuthRBAC] Error fetching roles from database:', error);
      return ['patient'];
    }
  };

  // Initialize auth state and set up listeners
  useEffect(() => {
    let mounted = true;

    console.log('[AuthRBAC] Initializing auth...');

    // Set up auth state change listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('[AuthRBAC] Auth state changed:', event, !!session);
        
        // Update state synchronously
        setSession(session);
        setUser(session?.user ?? null);
        
        // Extract roles from session user metadata with database fallback
        if (session?.user) {
          const rolesFromMetadata = getUserRolesFromMetadata(session.user);
          
          if (rolesFromMetadata.length > 0) {
            setUserRoles(rolesFromMetadata);
            setRolesLoaded(true);
            console.log('[AuthRBAC] Set roles from metadata:', rolesFromMetadata);
          } else {
            // Fallback to database if metadata is empty
            console.log('[AuthRBAC] Metadata roles empty, attempting database fallback');
            setRolesLoaded(false); // Mark as not loaded while fetching from DB
            
            fetchUserRolesFromDatabase(session.user.id).then(dbRoles => {
              if (mounted) {
                setUserRoles(dbRoles);
                setRolesLoaded(true);
                console.log('[AuthRBAC] Set roles from database fallback:', dbRoles);
              }
            }).catch(error => {
              console.error('[AuthRBAC] Database fallback failed:', error);
              if (mounted) {
                setUserRoles(['patient']); // Final fallback
                setRolesLoaded(true);
              }
            });
          }
        } else {
          console.log('[AuthRBAC] No session, clearing roles');
          setUserRoles([]);
          setPermissions([]);
          setRolesLoaded(false);
        }
      }
    );

    // Get initial session
    const initializeSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[AuthRBAC] Session error:', error);
          return;
        }
        
        console.log('[AuthRBAC] Initial session:', !!session);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const rolesFromMetadata = getUserRolesFromMetadata(session.user);
          
          if (rolesFromMetadata.length > 0) {
            setUserRoles(rolesFromMetadata);
            setRolesLoaded(true);
            console.log('[AuthRBAC] Set initial roles from metadata:', rolesFromMetadata);
          } else {
            // Try database fallback for initial session
            console.log('[AuthRBAC] Initial metadata roles empty, attempting database fallback');
            fetchUserRolesFromDatabase(session.user.id).then(dbRoles => {
              if (mounted) {
                setUserRoles(dbRoles);
                setRolesLoaded(true);
                console.log('[AuthRBAC] Set initial roles from database:', dbRoles);
              }
            }).catch(error => {
              console.error('[AuthRBAC] Initial database fallback failed:', error);
              if (mounted) {
                setUserRoles(['patient']); // Final fallback
                setRolesLoaded(true);
              }
            });
          }
        } else {
          setRolesLoaded(true); // Mark as loaded even if no user
        }
        
      } catch (error) {
        console.error('[AuthRBAC] Failed to get session:', error);
      } finally {
        setLoading(false);
        setIsInitialized(true);
        console.log('[AuthRBAC] Auth initialization completed');
      }
    };

    initializeSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const refreshRoles = async () => {
    if (user?.id) {
      try {
        setRolesLoaded(false);
        console.log('[AuthRBAC] Refreshing roles for user:', user.id);
        
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        const rolesFromMetadata = getUserRolesFromMetadata(currentUser);
        
        if (rolesFromMetadata.length > 0) {
          setUserRoles(rolesFromMetadata);
          setRolesLoaded(true);
          console.log('[AuthRBAC] Refreshed roles from metadata:', rolesFromMetadata);
        } else {
          // Fallback to database
          const dbRoles = await fetchUserRolesFromDatabase(user.id);
          setUserRoles(dbRoles);
          setRolesLoaded(true);
          console.log('[AuthRBAC] Refreshed roles from database:', dbRoles);
        }
      } catch (error) {
        console.error('[AuthRBAC] Error refreshing roles:', error);
        setUserRoles(['patient']); // Fallback
        setRolesLoaded(true);
      }
    }
  };

  const performConsistencyCheck = async (): Promise<boolean> => {
    try {
      if (!user?.id) return false;
      
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      const accountType = (currentUser as any)?.raw_user_meta_data?.accountType;
      
      return accountType && ['admin', 'therapist', 'patient', 'support'].includes(accountType);
    } catch (error) {
      console.error('[AuthRBAC] Consistency check failed:', error);
      return false;
    }
  };

  const signOut = async () => {
    try {
      console.log('[AuthRBAC] Signing out...');
      await supabase.auth.signOut();
      
      // Clear state immediately
      setUser(null);
      setSession(null);
      setUserRoles([]);
      setPermissions([]);
      setRolesLoaded(false);
      
      console.log('[AuthRBAC] Sign out completed');
    } catch (error) {
      console.error('[AuthRBAC] Sign out error:', error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Role checking methods
  const hasRole = (role: string): boolean => {
    return userRoles.includes(role as UserRole);
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => hasRole(role));
  };

  const hasAllRoles = (roles: string[]): boolean => {
    return roles.every(role => hasRole(role));
  };

  const isAuthenticated = !!user;
  const isAdmin = hasRole('admin');
  const isTherapist = hasRole('therapist');
  const isPatient = hasRole('patient');
  const isSupport = hasRole('support');
  const primaryRole = userRoles[0];

  // Permission methods
  const hasPermission = (permission: string): boolean => {
    return permissions.some(p => p.name === permission);
  };

  const checkPermissions = (requiredPermissions: Permission[], options?: { requireAll?: boolean }): boolean => {
    if (options?.requireAll) {
      return requiredPermissions.every(req => 
        permissions.some(p => p.name === req.name)
      );
    }
    return requiredPermissions.some(req => 
      permissions.some(p => p.name === req.name)
    );
  };

  const getFieldAccess = (fieldName: string) => {
    const readOnly = !isAdmin && !isTherapist;
    const hidden = false;
    const mask = false;
    
    return { readOnly, hidden, mask };
  };

  const contextValue: AuthRBACContextType = {
    // Auth state
    user,
    session,
    isAuthenticated,
    isInitialized,
    loading,
    rolesLoaded,
    
    // Role state
    userRoles,
    roles: userRoles,
    primaryRole,
    permissions,
    
    // Role checking methods
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isAdmin,
    isTherapist,
    isPatient,
    isSupport,
    
    // Permission methods
    hasPermission,
    checkPermissions,
    getFieldAccess,
    
    // Auth methods
    signOut,
    
    // Management methods
    refreshRoles,
    performConsistencyCheck,
  };

  return (
    <AuthRBACContext.Provider value={contextValue}>
      {children}
    </AuthRBACContext.Provider>
  );
};

export const useAuthRBAC = (): AuthRBACContextType => {
  const context = useContext(AuthRBACContext);
  if (context === undefined) {
    throw new Error('useAuthRBAC must be used within an AuthRBACProvider');
  }
  return context;
};
