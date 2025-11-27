
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield } from "lucide-react";
import { ComponentPermission } from "@/utils/rbac/component-types";

interface PermissionGuardProps {
  children: React.ReactNode;
  permissions?: ComponentPermission[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  description?: string;
}

const PermissionGuard: React.FC<PermissionGuardProps & React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  permissions = [],
  requireAll = false,
  fallback,
  description = "You don't have permission to view this content.",
  ...rest
}) => {
  // Bypass permission check - always render the children
  return <div {...rest}>{children}</div>;
};

export default PermissionGuard;
