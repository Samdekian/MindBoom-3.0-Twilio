
import React from "react";
import { UserRole } from "@/types/core/rbac";
import { ComponentPermission } from "@/utils/rbac/component-types";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { adaptComponentPermissions } from "@/utils/rbac/permission-adapter";
import { cn } from "@/lib/utils";

interface RoleBasedContainerProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  permissions?: ComponentPermission[];
  config?: {
    requireAllRoles?: boolean;
    requireAllPermissions?: boolean;
    showComponent?: boolean;
  };
  fallback?: React.ReactNode;
  showLoading?: boolean;
  className?: string;
  id?: string;
}

/**
 * A container component that renders its children based on user roles and permissions
 */
const RoleBasedContainer: React.FC<RoleBasedContainerProps> = ({
  children,
  allowedRoles = [],
  permissions = [],
  config = {},
  fallback = null,
  showLoading = false,
  className,
  id,
}) => {
  const { loading, hasAnyRole, hasAllRoles, checkPermissions } = useAuthRBAC();
  
  const isLoading = loading;
  const {
    requireAllRoles = false,
    requireAllPermissions = false,
  } = config;
  
  // Show loading state if configured
  if (isLoading && showLoading) {
    return (
      <div className={cn("p-2 animate-pulse bg-muted/50 rounded", className)} id={id} role="status">
        <div className="w-full h-8 bg-muted rounded" />
      </div>
    );
  }
  
  // Check roles first if specified
  let hasRoleAccess = true;
  if (allowedRoles.length > 0) {
    hasRoleAccess = requireAllRoles
      ? hasAllRoles(allowedRoles.map(r => r.toString()))
      : hasAnyRole(allowedRoles.map(r => r.toString()));
  }
  
  // Then check permissions if specified
  let hasPermissionAccess = true;
  if (permissions.length > 0) {
    hasPermissionAccess = checkPermissions(adaptComponentPermissions(permissions), {
      requireAll: requireAllPermissions
    });
  }
  
  // Render children only if both role and permission checks pass
  if (hasRoleAccess && hasPermissionAccess) {
    return (
      <div className={className} id={id}>
        {children}
      </div>
    );
  }
  
  // Otherwise render fallback
  return fallback ? <>{fallback}</> : null;
};

export default RoleBasedContainer;
