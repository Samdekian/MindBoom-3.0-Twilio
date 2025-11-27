
import React from "react";
import { Link, LinkProps, useLocation } from "react-router-dom";
import { UserRole } from "@/types/core/rbac";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { ComponentPermission } from "@/utils/rbac/component-types";
import { adaptComponentPermissions } from "@/utils/rbac/permission-adapter";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface RoleBasedNavLinkProps extends LinkProps {
  allowedRoles?: UserRole[];
  permissions?: ComponentPermission[];
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  requireAll?: boolean;
  requireAllPermissions?: boolean;
  showIfDisallowed?: boolean;
  disabledClassName?: string;
  showTooltip?: boolean;
  tooltipText?: string;
}

/**
 * RoleBasedNavLink Component
 * 
 * A navigation link component that renders based on user roles and permissions.
 * This component is used throughout the application to create role-specific navigation.
 * 
 * Features:
 * - Shows/hides links based on user roles
 * - Supports permission-based access control
 * - Can show disabled links with tooltips for unauthorized users
 * - Handles active state styling
 */
const RoleBasedNavLink: React.FC<RoleBasedNavLinkProps> = ({
  allowedRoles = [],
  permissions = [],
  children,
  className,
  activeClassName,
  requireAll = false,
  requireAllPermissions = false,
  showIfDisallowed = false,
  disabledClassName = "opacity-50 pointer-events-none",
  showTooltip = true,
  tooltipText = "Insufficient permissions",
  ...props
}) => {
  const { hasAnyRole, hasAllRoles, checkPermissions } = useAuthRBAC();
  const location = useLocation();
  
  // Check if this link matches the current path
  const isActive = location.pathname === props.to;
  
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
  const hasPermission = hasRoleAccess && hasPermissionAccess;

  // Hide completely if no permission and not configured to show when disallowed
  if (!hasPermission && !showIfDisallowed) {
    return null;
  }

  // Compute final className based on permissions and active state
  const finalClassName = cn(
    className,
    isActive && activeClassName,
    !hasPermission && showIfDisallowed && disabledClassName
  );

  // If configured to show even when disallowed, render with disabled styling and optional tooltip
  if (!hasPermission && showIfDisallowed) {
    const disabledLink = (
      <span className={finalClassName} title={!showTooltip ? tooltipText : undefined}>
        {children}
      </span>
    );
    
    if (showTooltip) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {disabledLink}
            </TooltipTrigger>
            <TooltipContent>
              <p>{tooltipText}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    return disabledLink;
  }

  return (
    <Link className={finalClassName} {...props}>
      {children}
    </Link>
  );
};

export default RoleBasedNavLink;
