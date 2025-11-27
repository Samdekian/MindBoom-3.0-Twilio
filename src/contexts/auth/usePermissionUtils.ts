
import { useMemo } from 'react';
import { UserRole } from '@/types/core/rbac';
import { Permission } from './types';

export const usePermissionUtils = (userRoles: UserRole[], permissions: Permission[]) => {
  return useMemo(() => {
    // Role checking methods
    const hasRole = (role: string): boolean => {
      return userRoles.includes(role as UserRole);
    };

    const hasAnyRole = (roles: string[]): boolean => {
      return roles.some(role => userRoles.includes(role as UserRole));
    };

    const hasAllRoles = (roles: string[]): boolean => {
      return roles.every(role => userRoles.includes(role as UserRole));
    };

    // Convenience role flags
    const isAdmin = hasRole('admin');
    const isTherapist = hasRole('therapist');
    const isPatient = hasRole('patient');
    const isSupport = hasRole('support');

    // Primary role (first role or most privileged)
    const primaryRole = (): UserRole | undefined => {
      if (isAdmin) return 'admin';
      if (isTherapist) return 'therapist';
      if (isSupport) return 'support';
      if (isPatient) return 'patient';
      return userRoles[0];
    };

    // Permission checking methods
    const hasPermission = (permission: string): boolean => {
      return permissions.some(p => p.name === permission);
    };

    const hasAnyPermission = (perms: string[]): boolean => {
      return perms.some(perm => hasPermission(perm));
    };

    const hasAllPermissions = (perms: string[]): boolean => {
      return perms.every(perm => hasPermission(perm));
    };

    // Enhanced permission checker with role hierarchy
    const checkPermissions = (perms: any[], options: { requireAll?: boolean } = {}): boolean => {
      if (!perms || perms.length === 0) return true;
      
      const { requireAll = false } = options;
      
      // Admin has all permissions
      if (isAdmin) return true;
      
      const checkMethod = requireAll ? hasAllPermissions : hasAnyPermission;
      return checkMethod(perms);
    };

    return {
      hasRole,
      hasAnyRole,
      hasAllRoles,
      isAdmin,
      isTherapist,
      isPatient,
      isSupport,
      primaryRole,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      checkPermissions,
    };
  }, [userRoles, permissions]);
};
