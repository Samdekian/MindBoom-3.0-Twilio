
import { Json } from '@/integrations/supabase/types';
import { User } from '@supabase/supabase-js';
import { UserRole } from '@/types/core/rbac';

/**
 * Adapter functions for auth-related data
 */

export interface AuthUserWithRoles extends User {
  roles: UserRole[];
  primaryRole?: UserRole;
}

export function normalizeUserWithRoles(user: User, roles: string[]): AuthUserWithRoles {
  return {
    ...user,
    roles: roles as UserRole[],
    primaryRole: roles[0] as UserRole
  };
}
