
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserWithRoles } from "@/types/roles";
import { safeTableFetch } from "@/utils/rbac/safe-supabase-calls";

const handleError = (error: any) => {
  console.error("Failed to fetch users:", error);
  throw {
    message: error.message || "Failed to fetch users",
    details: error.toString(),
    hint: error.hint || "",
    code: error.code || ""
  };
};

export const useRoleListing = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listUsers = async (): Promise<UserWithRoles[]> => {
    setIsLoading(true);
    setError(null);

    try {
      // Use safeTableFetch to avoid ambiguous column references
      const { data: users, error: usersError } = await safeTableFetch<any>(
        'user_roles_view',
        (query) => query.select(`
          user_id,
          email,
          full_name,
          account_type,
          role_count,
          first_role_assigned_at,
          last_role_updated_at,
          roles
        `)
      );

      if (usersError) {
        throw usersError;
      }

      // Transform to UserWithRoles format
      const userWithRoles: UserWithRoles[] = (users || []).map(user => ({
        id: user.user_id,
        email: user.email || '',
        full_name: user.full_name || '',
        account_type: user.account_type || 'patient',
        user_roles: (user.roles || []).map(role => ({
          roles: {
            name: role
          }
        }))
      }));

      return userWithRoles;
    } catch (error: any) {
      handleError(error);
      setError(error.message || "Failed to fetch users");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const listRoles = async (): Promise<string[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: roles, error: rolesError } = await safeTableFetch<any>(
        'roles',
        (query) => query.select('name')
      );

      if (rolesError) {
        throw rolesError;
      }

      return (roles || []).map((role) => role.name);
    } catch (error: any) {
      handleError(error);
      setError(error.message || "Failed to fetch roles");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    listUsers,
    listRoles,
    isLoading,
    error,
  };
};
