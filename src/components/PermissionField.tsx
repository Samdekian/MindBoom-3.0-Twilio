
import React from "react";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { ComponentPermission } from "@/utils/rbac/component-types";
import { adaptComponentPermissions } from "@/utils/rbac/permission-adapter";
import { cn } from "@/lib/utils";

interface PermissionFieldProps {
  children: React.ReactNode;
  fieldName: string;
  permissions?: ComponentPermission[];
  className?: string;
  fallback?: React.ReactNode;
  showMasked?: boolean;
}

/**
 * A field component that handles permission-based field access control
 * including read-only, hidden, and masked states
 */
const PermissionField: React.FC<PermissionFieldProps> = ({
  children,
  fieldName,
  permissions = [],
  className,
  fallback = null,
  showMasked = true,
}) => {
  const { getFieldAccess, checkPermissions, isAdmin } = useAuthRBAC();
  
  // Get field-level access settings
  const fieldAccess = getFieldAccess(fieldName);
  
  // Check if user has permission to access this field
  let hasPermission = true;
  if (permissions.length > 0) {
    hasPermission = checkPermissions(adaptComponentPermissions(permissions));
  }
  
  // Admin users bypass most restrictions except explicit masking
  const shouldBypassRestrictions = isAdmin && !fieldAccess.mask;
  
  // If field is hidden and user doesn't have permission, don't render
  if ((fieldAccess.hidden || !hasPermission) && !shouldBypassRestrictions) {
    return fallback ? <>{fallback}</> : null;
  }
  
  // If field should be masked, show masked content
  if (fieldAccess.mask && !isAdmin && showMasked) {
    return (
      <div className={cn("relative", className)}>
        <div className="bg-muted/20 p-2 rounded border border-dashed">
          <span className="text-muted-foreground text-sm">*** Protected Content ***</span>
        </div>
      </div>
    );
  }
  
  // If field is read-only, clone children with disabled/readOnly props
  if ((fieldAccess.readOnly || !hasPermission) && !shouldBypassRestrictions) {
    const readOnlyChildren = React.Children.map(children, child => {
      if (React.isValidElement(child)) {
        // Check if element supports readOnly or disabled props
        const elementType = typeof child.type === 'string' ? child.type : '';
        const isFormElement = ['input', 'textarea', 'select'].includes(elementType.toLowerCase());
        
        if (isFormElement || 'disabled' in child.props || 'readOnly' in child.props) {
          return React.cloneElement(child as React.ReactElement<any>, {
            readOnly: true,
            disabled: true,
            className: cn(child.props.className, "bg-muted/50 cursor-not-allowed"),
          });
        }
      }
      return child;
    });
    
    return (
      <div className={cn("relative", className)}>
        {readOnlyChildren}
        <div className="absolute top-0 right-0 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-bl text-center">
          Read-only
        </div>
      </div>
    );
  }
  
  // Normal field rendering
  return (
    <div className={className}>
      {children}
    </div>
  );
};

export default PermissionField;
