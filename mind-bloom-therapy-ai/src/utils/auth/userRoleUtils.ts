
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { UserRole } from '@/types/core/rbac';
import { asUserRoles } from '@/utils/rbac/type-adapters';

/**
 * Extracts roles from user metadata
 * Fixed to read from raw_user_meta_data.accountType
 */
export function getRolesFromUserMetadata(user: any): UserRole[] {
  // Fix: Read from raw_user_meta_data.accountType instead of user_metadata.roles
  const accountType = (user as any)?.raw_user_meta_data?.accountType;
  
  if (!accountType) {
    return [];
  }
  
  // Validate the accountType is a valid role
  if (['admin', 'therapist', 'patient', 'support'].includes(accountType)) {
    return [accountType as UserRole];
  }
  
  return [];
}

/**
 * Hook to get current user roles
 */
export function useUserRoles(): {
  roles: UserRole[];
  isAdmin: boolean;
  isTherapist: boolean;
  isPatient: boolean;
  isSupport: boolean;
  hasRole: (role: string) => boolean;
} {
  const { userRoles, isAdmin, isTherapist, isPatient, isSupport, hasRole } = useAuthRBAC();
  
  return {
    roles: userRoles,
    isAdmin,
    isTherapist,
    isPatient,
    isSupport,
    hasRole
  };
}
