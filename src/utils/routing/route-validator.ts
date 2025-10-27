import { UserRole } from '@/types/core/rbac';
import { ROUTE_PATHS, getRoleBasedDashboard } from './unified-route-config';

export interface RouteValidationResult {
  isValid: boolean;
  expectedPath?: string;
  redirectNeeded: boolean;
  errors: string[];
}

/**
 * Validates if a user should have access to a specific route
 */
export function validateRouteAccess(
  currentPath: string,
  userRoles: UserRole[],
  isAuthenticated: boolean
): RouteValidationResult {
  const errors: string[] = [];
  const primaryRole = userRoles[0];

  console.log('[RouteValidator] Validating:', {
    currentPath,
    userRoles,
    isAuthenticated,
    primaryRole
  });

  // Public routes - always accessible
  const publicRoutes = [ROUTE_PATHS.HOME, ROUTE_PATHS.LOGIN, ROUTE_PATHS.REGISTER];
  if (publicRoutes.includes(currentPath as any)) {
    return {
      isValid: true,
      redirectNeeded: false,
      errors: []
    };
  }

  // Check authentication for protected routes
  if (!isAuthenticated) {
    errors.push('User not authenticated for protected route');
    return {
      isValid: false,
      expectedPath: ROUTE_PATHS.LOGIN,
      redirectNeeded: true,
      errors
    };
  }

  // Smart dashboard routing - always redirect to role-specific dashboard
  if (currentPath === ROUTE_PATHS.DASHBOARD) {
    const correctDashboard = primaryRole ? getRoleBasedDashboard(primaryRole) : ROUTE_PATHS.PATIENT_DASHBOARD;
    return {
      isValid: false,
      expectedPath: correctDashboard,
      redirectNeeded: true,
      errors: ['Generic dashboard should redirect to role-specific dashboard']
    };
  }

  // Role-specific dashboard validation
  if (currentPath.startsWith('/admin')) {
    if (!userRoles.includes('admin')) {
      errors.push('Admin access required for admin routes');
      return {
        isValid: false,
        expectedPath: primaryRole ? getRoleBasedDashboard(primaryRole) : ROUTE_PATHS.PATIENT_DASHBOARD,
        redirectNeeded: true,
        errors
      };
    }
  }

  if (currentPath.startsWith('/therapist')) {
    if (!userRoles.includes('therapist') && !userRoles.includes('admin')) {
      errors.push('Therapist access required for therapist routes');
      return {
        isValid: false,
        expectedPath: primaryRole ? getRoleBasedDashboard(primaryRole) : ROUTE_PATHS.PATIENT_DASHBOARD,
        redirectNeeded: true,
        errors
      };
    }
  }

  if (currentPath.startsWith('/patient')) {
    // Patient routes are accessible to all authenticated users
    return {
      isValid: true,
      redirectNeeded: false,
      errors: []
    };
  }

  // Other protected routes - accessible to authenticated users
  return {
    isValid: true,
    redirectNeeded: false,
    errors: []
  };
}

/**
 * Gets the appropriate redirect path for a user based on their roles
 */
export function getRedirectPath(userRoles: UserRole[], currentPath: string): string {
  const primaryRole = userRoles[0];
  
  console.log('[RouteValidator] Getting redirect path for:', {
    userRoles,
    primaryRole,
    currentPath
  });
  
  if (!primaryRole) {
    return ROUTE_PATHS.PATIENT_DASHBOARD;
  }

  // If on generic dashboard, redirect to role-specific dashboard
  if (currentPath === ROUTE_PATHS.DASHBOARD) {
    return getRoleBasedDashboard(primaryRole);
  }

  // If trying to access wrong dashboard, redirect to correct one
  const correctDashboard = getRoleBasedDashboard(primaryRole);
  if (currentPath.startsWith('/admin') && primaryRole !== 'admin') {
    return correctDashboard;
  }
  
  if (currentPath.startsWith('/therapist') && primaryRole !== 'therapist' && primaryRole !== 'admin') {
    return correctDashboard;
  }

  return correctDashboard;
}
