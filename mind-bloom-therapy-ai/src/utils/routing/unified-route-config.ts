
import { UserRole } from '@/types/core/rbac';

/**
 * Unified Route Configuration
 * Single source of truth for all routing logic
 */

// Route path constants
export const ROUTE_PATHS = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  
  // Smart dashboard route
  DASHBOARD: '/dashboard',
  
  // Role-specific routes
  ADMIN_DASHBOARD: '/admin',
  THERAPIST_DASHBOARD: '/therapist', 
  PATIENT_DASHBOARD: '/patient',
  
  // Other protected routes
  PROFILE: '/profile',
  CALENDAR: '/calendar',
  SESSION: (id: string) => `/session/${id}`,
} as const;

/**
 * Get the appropriate dashboard redirect based on user's primary role
 */
export function getRoleBasedDashboard(primaryRole: UserRole): string {
  console.log('[UnifiedRouteConfig] Getting dashboard for role:', primaryRole);
  
  switch (primaryRole) {
    case 'admin':
      return ROUTE_PATHS.ADMIN_DASHBOARD;
    case 'therapist':
      return ROUTE_PATHS.THERAPIST_DASHBOARD;
    case 'patient':
    case 'support':
    default:
      return ROUTE_PATHS.PATIENT_DASHBOARD;
  }
}

/**
 * Check if current path matches user's expected dashboard
 */
export function isOnCorrectDashboard(currentPath: string, primaryRole: UserRole): boolean {
  const expectedDashboard = getRoleBasedDashboard(primaryRole);
  console.log('[UnifiedRouteConfig] Checking dashboard correctness:', {
    currentPath,
    primaryRole,
    expectedDashboard,
    isCorrect: currentPath.startsWith(expectedDashboard)
  });
  return currentPath.startsWith(expectedDashboard);
}

/**
 * Determine where to redirect after login
 */
export function getPostLoginRedirect(roles: UserRole[], returnTo?: string): string {
  console.log('[UnifiedRouteConfig] Getting post-login redirect:', { roles, returnTo });
  
  // If there's a specific return URL, use it (but validate it's safe)
  if (returnTo && returnTo.startsWith('/') && !returnTo.includes('//')) {
    return returnTo;
  }
  
  // Otherwise use role-based dashboard
  const primaryRole = roles[0] || 'patient';
  const redirectPath = getRoleBasedDashboard(primaryRole);
  console.log('[UnifiedRouteConfig] Post-login redirect determined:', redirectPath);
  return redirectPath;
}

/**
 * Get default redirect for unauthenticated users
 */
export function getGuestRedirect(): string {
  return ROUTE_PATHS.LOGIN;
}
