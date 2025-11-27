
import React from "react";

/**
 * A passthrough component that renders its children without any role checks
 * To be used in place of RoleProtectedRoute
 */
const RolePassthroughRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: any[];
  permissions?: any[];
  redirectPath?: string;
  requireAll?: boolean;
  requireAllPermissions?: boolean;
  silent?: boolean;
} & React.HTMLAttributes<HTMLDivElement>> = ({ children, ...rest }) => {
  return <div {...rest}>{children}</div>;
};

export default RolePassthroughRoute;
