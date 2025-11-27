
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/core/rbac';
import { Permission } from './types';

export const useRoleManagement = (user: any) => {
  const fetchUserRoles = useCallback(async (userId: string): Promise<UserRole[]> => {
    if (!userId) return [];
    
    try {
      console.log('[RoleManagement] Fetching roles for user:', userId);
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role:roles(name)')
        .eq('user_id', userId);
      
      if (error) {
        console.error('[RoleManagement] Error fetching roles:', error);
        return ['patient']; // Fallback role
      }
      
      // Fix the data structure access - properly handle the nested role object
      const roles = data?.map(item => {
        // item.role is the nested role object from the join
        if (item.role && typeof item.role === 'object' && 'name' in item.role) {
          return (item.role as { name: string }).name;
        }
        return null;
      }).filter(Boolean) as UserRole[] || ['patient'];
      
      console.log('[RoleManagement] Fetched roles:', roles);
      
      return roles;
    } catch (error) {
      console.error('[RoleManagement] Error in fetchUserRoles:', error);
      return ['patient'];
    }
  }, []);

  const fetchUserPermissions = useCallback(async (userId: string): Promise<Permission[]> => {
    if (!userId) return [];
    
    try {
      console.log('[RoleManagement] Fetching permissions for user:', userId);
      
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          role:roles(
            role_permissions(
              permission:permissions(name, resource, action)
            )
          )
        `)
        .eq('user_id', userId);
      
      if (error) {
        console.error('[RoleManagement] Error fetching permissions:', error);
        return [];
      }
      
      const permissions: Permission[] = [];
      data?.forEach(userRole => {
        // userRole.role is the nested role object from the join
        if (userRole.role && typeof userRole.role === 'object' && 'role_permissions' in userRole.role) {
          const roleObj = userRole.role as { role_permissions: any[] };
          const rolePermissions = roleObj.role_permissions || [];
          rolePermissions.forEach((rp: any) => {
            if (rp.permission) {
              permissions.push({
                name: rp.permission.name,
                resource: rp.permission.resource,
                action: rp.permission.action
              });
            }
          });
        }
      });
      
      console.log('[RoleManagement] Fetched permissions:', permissions);
      return permissions;
    } catch (error) {
      console.error('[RoleManagement] Error in fetchUserPermissions:', error);
      return [];
    }
  }, []);

  const performConsistencyCheck = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      console.log('[RoleManagement] Performing consistency check for user:', user.id);
      
      // Fix: Use the correct RPC function name that exists in the database
      const { data, error } = await supabase.rpc('check_and_repair_user_role_consistency', {
        p_user_id: user.id,
        p_auto_repair: false
      });
      
      if (error) {
        console.error('[RoleManagement] Consistency check error:', error);
        return false;
      }
      
      return data?.is_consistent || false;
    } catch (error) {
      console.error('[RoleManagement] Error in consistency check:', error);
      return false;
    }
  }, [user?.id]);

  return {
    fetchUserRoles,
    fetchUserPermissions,
    performConsistencyCheck
  };
};
