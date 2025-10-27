
import React from "react";
import { UserRole } from "@/types/core/rbac";
import { ComponentPermission } from "@/utils/rbac/component-types";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { adaptComponentPermissions } from "@/utils/rbac/permission-adapter";
import { cn } from "@/lib/utils";

interface RoleBasedNavItemProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  permissions?: ComponentPermission[];
  fallback?: React.ReactNode;
  requireAll?: boolean;
  requireAllPermissions?: boolean;
  showIfDisallowed?: boolean;
  disabledClassName?: string;
  className?: string;
  tooltipText?: string;
}

/**
 * Renders a navigation item based on user roles and permissions
 */
const RoleBasedNavItem: React.FC<RoleBasedNavItemProps> = ({
  children,
  allowedRoles = [],
  permissions = [],
  fallback = null,
  requireAll = false,
  requireAllPermissions = false,
  showIfDisallowed = false,
  disabledClassName = "opacity-50 pointer-events-none",
  className,
  tooltipText,
}) => {
  const { hasAnyRole, hasAllRoles, checkPermissions } = useAuthRBAC();
  
  // Check roles if specified
  let hasRoleAccess = true;
  if (allowedRoles.length > 0) {
    hasRoleAccess = requireAll
      ? hasAllRoles(allowedRoles.map(r => r.toString()))
      : hasAnyRole(allowedRoles.map(r => r.toString()));
  }
  
  // Check permissions if specified
  let hasPermissionAccess = true;
  if (permissions.length > 0) {
    hasPermissionAccess = checkPermissions(adaptComponentPermissions(permissions), {
      requireAll: requireAllPermissions
    });
  }
  
  // Both checks must pass
  const hasAccess = hasRoleAccess && hasPermissionAccess;

  // Hide completely if no permission and not configured to show when disallowed
  if (!hasAccess && !showIfDisallowed) {
    return null;
  }

  // Compute final className based on permissions
  const finalClassName = cn(
    className,
    !hasAccess && showIfDisallowed && disabledClassName
  );

  // If configured to show even when disallowed, render with disabled styling
  if (!hasAccess && showIfDisallowed) {
    return (
      <span 
        className={finalClassName} 
        title={tooltipText || "Insufficient permissions"}
      >
        {children}
      </span>
    );
  }

  return (
    <div className={finalClassName}>
      {children}
    </div>
  );
};

export default RoleBasedNavItem;
