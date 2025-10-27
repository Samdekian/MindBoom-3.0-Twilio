import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

export interface UserRoleData {
  id: string;
  user_id: string;
  email?: string;
  full_name?: string;
  account_type?: string;
  approval_status?: string;
  roles: string[];
  created_at: string;
  last_activity?: string;
}

export interface RolePermissionData {
  role_id: string;
  role_name: string;
  permissions: Array<{
    id: string;
    name: string;
    resource: string;
    action: string;
  }>;
  user_count: number;
}

export function useAdminData() {
  const { user, isAdmin } = useAuthRBAC();
  const [users, setUsers] = useState<UserRoleData[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermissionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    if (!isAdmin) {
      setError('Admin access required');
      return;
    }

    try {
      // Get all profiles with their roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          account_type,
          approval_status,
          full_name,
          created_at,
          updated_at
        `);

      if (profilesError) throw profilesError;

      // Get user roles for each profile
      const usersWithRoles = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: userRoles } = await supabase
            .from('user_roles')
            .select(`
              roles!inner(name)
            `)
            .eq('user_id', profile.id);

          // Get user email from auth (admin only)
          const { data: emailData } = await supabase
            .rpc('get_user_email_for_admin', { target_user_id: profile.id });

          // Get last activity from audit logs
          const { data: lastActivity } = await supabase
            .from('audit_logs')
            .select('activity_timestamp')
            .eq('user_id', profile.id)
            .order('activity_timestamp', { ascending: false })
            .limit(1)
            .single();

          return {
            id: profile.id,
            user_id: profile.id,
            email: emailData || undefined,
            full_name: profile.full_name || undefined,
            account_type: profile.account_type || undefined,
            approval_status: profile.approval_status || undefined,
            roles: userRoles?.map(ur => (ur.roles as any)?.name).filter(Boolean) || [],
            created_at: profile.created_at,
            last_activity: lastActivity?.activity_timestamp || undefined
          };
        })
      );

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load user data');
    }
  };

  const fetchRolePermissions = async () => {
    if (!isAdmin) return;

    try {
      // Get all roles with their permissions
      const { data: roles, error: rolesError } = await supabase
        .from('roles')
        .select('id, name');

      if (rolesError) throw rolesError;

      const rolePermissionsData = await Promise.all(
        (roles || []).map(async (role) => {
          // Get permissions for this role
          const { data: permissions } = await supabase
            .from('role_permissions')
            .select(`
              permissions!inner(
                id,
                name,
                resource,
                action
              )
            `)
            .eq('role_id', role.id);

          // Get user count for this role
          const { count: userCount } = await supabase
            .from('user_roles')
            .select('*', { count: 'exact', head: true })
            .eq('role_id', role.id);

          return {
            role_id: role.id,
            role_name: role.name,
            permissions: permissions?.map(rp => (rp.permissions as any)) || [],
            user_count: userCount || 0
          };
        })
      );

      setRolePermissions(rolePermissionsData);
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      setError('Failed to load role permissions');
    }
  };

  const updateUserStatus = async (userId: string, status: string, adminNotes?: string) => {
    if (!isAdmin) throw new Error('Admin access required');

    try {
      const { data, error } = await supabase
        .rpc('update_user_status', {
          p_user_id: userId,
          p_status: status,
          p_admin_notes: adminNotes
        });

      if (error) throw error;

      // Refresh users data
      await fetchUsers();
      return data;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  };

  const updateUserApproval = async (userId: string, approvalStatus: string, adminNotes?: string) => {
    if (!isAdmin) throw new Error('Admin access required');

    try {
      const { error } = await supabase
        .rpc('update_therapist_approval_simple', {
          therapist_id: userId,
          new_status: approvalStatus,
          admin_user_id: user?.id,
          admin_notes: adminNotes
        });

      if (error) throw error;

      // Refresh users data
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user approval:', error);
      throw error;
    }
  };

  const assignRole = async (userId: string, roleName: string) => {
    if (!isAdmin) throw new Error('Admin access required');

    try {
      const { data, error } = await supabase
        .rpc('manage_user_role', {
          p_user_id: userId,
          p_role_name: roleName,
          p_operation: 'assign'
        });

      if (error) throw error;

      // Refresh users data
      await fetchUsers();
      return data;
    } catch (error) {
      console.error('Error assigning role:', error);
      throw error;
    }
  };

  const removeRole = async (userId: string, roleName: string) => {
    if (!isAdmin) throw new Error('Admin access required');

    try {
      const { data, error } = await supabase
        .rpc('manage_user_role', {
          p_user_id: userId,
          p_role_name: roleName,
          p_operation: 'remove'
        });

      if (error) throw error;

      // Refresh users data
      await fetchUsers();
      return data;
    } catch (error) {
      console.error('Error removing role:', error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!isAdmin) {
        setError('Admin access required');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      await Promise.all([
        fetchUsers(),
        fetchRolePermissions()
      ]);

      setIsLoading(false);
    };

    fetchData();
  }, [isAdmin, user?.id]);

  return {
    users,
    rolePermissions,
    isLoading,
    error,
    updateUserStatus,
    updateUserApproval,
    assignRole,
    removeRole,
    refreshUsers: fetchUsers,
    refreshRolePermissions: fetchRolePermissions
  };
}