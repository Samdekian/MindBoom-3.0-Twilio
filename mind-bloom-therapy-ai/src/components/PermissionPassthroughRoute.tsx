
import React from "react";

/**
 * A passthrough component that renders its children without any permission checks
 * To be used in place of PermissionProtectedRoute
 */
const PermissionPassthroughRoute: React.FC<{
  children: React.ReactNode;
  permissions?: any[];
  redirectPath?: string;
  requireAll?: boolean;
  layoutClassName?: string;
  silent?: boolean;
} & React.HTMLAttributes<HTMLDivElement>> = ({ children, ...rest }) => {
  return <div {...rest}>{children}</div>;
};

export default PermissionPassthroughRoute;
