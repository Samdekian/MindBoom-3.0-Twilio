
/**
 * Re-export all auth services from their respective modules
 * for backward compatibility
 */

export { signUpWithRole, signInWithRoleSync, signOutUser } from './auth/auth-core';
export { checkTherapistApprovalStatus } from './auth/therapist-approval';
export { getPermissionsFromRoles } from './auth/permissions';
