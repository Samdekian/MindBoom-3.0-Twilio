
import React from "react";

/**
 * A passthrough component that renders its children without any authentication checks
 * To be used in place of AuthRoute
 */
const AuthPassthroughRoute: React.FC<{
  children: React.ReactNode;
  redirectPath?: string;
} & React.HTMLAttributes<HTMLDivElement>> = ({ children, ...rest }) => {
  return <div {...rest}>{children}</div>;
};

export default AuthPassthroughRoute;
