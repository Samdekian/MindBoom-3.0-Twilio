
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface SimpleUserWithRoles {
  id: string;
  email: string;
  full_name: string;
  account_type: string;
  roles: string[];
}

export const useSimpleRoleManagement = () => {
  const [users, setUsers] = useState<SimpleUserWithRoles[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Get profiles with their roles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          account_type,
          user_roles!inner(
            roles(name)
          )
        `);

      if (profilesError) throw profilesError;

      // Get user emails from auth.users (simplified approach)
      const userPromises = (profilesData || []).map(async (profile) => {
        const { data: userData } = await supabase.rpc('get_user_email_safe', { 
          user_id: profile.id 
        });
        
        return {
          id: profile.id,
          email: userData || 'no-email@example.com',
          full_name: profile.full_name || 'Unknown User',
          account_type: profile.account_type || 'patient',
          roles: profile.user_roles?.map((ur: any) => ur.roles.name) || []
        };
      });

      const usersWithRoles = await Promise.all(userPromises);
      setUsers(usersWithRoles);

    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('name');

      if (error) throw error;
      setRoles((data || []).map(role => role.name));
    } catch (error: any) {
      console.error('Error fetching roles:', error);
    }
  };

  const assignRole = async (userId: string, roleName: string) => {
    try {
      // Get role ID
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', roleName)
        .single();

      if (roleError) throw roleError;

      // Assign role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role_id: roleData.id
        });

      if (error && !error.message.includes('duplicate')) {
        throw error;
      }

      toast({
        title: "Role Assigned",
        description: `Successfully assigned ${roleName} role`,
      });

      await fetchUsers();
      return true;
    } catch (error: any) {
      console.error('Error assigning role:', error);
      toast({
        title: "Error",
        description: "Failed to assign role",
        variant: "destructive",
      });
      return false;
    }
  };

  const removeRole = async (userId: string, roleName: string) => {
    try {
      // Get role ID
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', roleName)
        .single();

      if (roleError) throw roleError;

      // Remove role
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role_id', roleData.id);

      if (error) throw error;

      toast({
        title: "Role Removed",
        description: `Successfully removed ${roleName} role`,
      });

      await fetchUsers();
      return true;
    } catch (error: any) {
      console.error('Error removing role:', error);
      toast({
        title: "Error",
        description: "Failed to remove role",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  return {
    users,
    roles,
    isLoading,
    fetchUsers,
    assignRole,
    removeRole,
  };
};
