
import React from "react";

/**
 * BYPASSED: Always renders its children without any role checks
 */
const RoleBasedGuard: React.FC<{
  children: React.ReactNode;
  allowedRoles?: any[];
  permissions?: any[];
  fallback?: React.ReactNode;
  requireAll?: boolean;
  requireAllPermissions?: boolean;
  showLoading?: boolean;
  className?: string;
  description?: string;
}> = ({
  children,
  className,
}) => {
  return <div className={className}>{children}</div>;
};

export default RoleBasedGuard;
