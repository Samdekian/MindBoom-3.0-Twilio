
import { UserRole } from "@/types/core/rbac";

export interface RoleAssignmentResult {
  isLoading: boolean;
  error: string | null;
  assignRole: (userId: string, role: string) => Promise<boolean>;
  removeRole: (userId: string, role: string) => Promise<boolean>;
}

export interface RoleListingResult {
  isLoading: boolean;
  error: string | null;
  listUsers: () => Promise<UserWithRoles[]>;
  listRoles: () => Promise<string[]>;
}

export interface UserWithRoles {
  id: string;
  full_name: string | null;
  account_type: string | null;
  user_roles: {
    roles: {
      id: string;
      name: string;
    };
  }[];
}

export type { UserRole };
