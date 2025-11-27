
import { UserRole } from '@/types/core/rbac';
import { getRoleBasedDashboard, getPostLoginRedirect as getUnifiedPostLoginRedirect } from '@/utils/routing/unified-route-config';

/**
 * @deprecated Use getRoleBasedDashboard from @/utils/routing/unified-route-config instead
 */
export function getRoleBasedRedirect(primaryRole: UserRole): string {
  console.warn('DEPRECATION: getRoleBasedRedirect is deprecated. Use getRoleBasedDashboard from unified-route-config');
  return getRoleBasedDashboard(primaryRole);
}

/**
 * @deprecated Use getPostLoginRedirect from @/utils/routing/unified-route-config instead
 */
export function getPostLoginRedirectLegacy(roles: UserRole[], defaultPath?: string): string {
  console.warn('DEPRECATION: getPostLoginRedirectLegacy is deprecated. Use unified-route-config');
  return getUnifiedPostLoginRedirect(roles, defaultPath);
}

/**
 * @deprecated Use unified-route-config for all routing logic
 */
export function shouldRedirectBasedOnRole(
  currentPath: string, 
  userRoles: UserRole[], 
  isAuthenticated: boolean
): { shouldRedirect: boolean; redirectTo?: string } {
  console.warn('DEPRECATION: shouldRedirectBasedOnRole is deprecated. Use unified-route-config');
  
  if (!isAuthenticated) {
    return { shouldRedirect: false };
  }

  const primaryRole = userRoles[0];
  if (!primaryRole) {
    return { shouldRedirect: false };
  }

  // If user is on root path or generic dashboard, redirect to appropriate dashboard
  if (currentPath === '/' || currentPath === '/dashboard') {
    return {
      shouldRedirect: true,
      redirectTo: getRoleBasedDashboard(primaryRole)
    };
  }

  return { shouldRedirect: false };
}
