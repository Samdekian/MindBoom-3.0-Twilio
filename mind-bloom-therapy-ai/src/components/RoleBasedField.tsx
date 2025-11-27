
import React from "react";
import { UserRole } from "@/types/core/rbac";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import PermissionField from "@/components/PermissionField";
import { cn } from "@/lib/utils";

interface RoleBasedFieldProps {
  children: React.ReactNode;
  fieldName: string;
  allowedRoles?: UserRole[];
  readOnlyRoles?: UserRole[];
  hiddenRoles?: UserRole[];
  requireAll?: boolean;
  className?: string;
  fallback?: React.ReactNode;
}

/**
 * A simplified wrapper that combines role-based access and field-level permissions
 * for common form field access control scenarios
 */
const RoleBasedField: React.FC<RoleBasedFieldProps> = ({
  children,
  fieldName,
  allowedRoles = [],
  readOnlyRoles = [],
  hiddenRoles = [],
  requireAll = false,
  className,
  fallback = null,
}) => {
  const { hasAnyRole, hasAllRoles, getFieldAccess } = useAuthRBAC();
  const fieldAccess = getFieldAccess(fieldName);
  
  // First check if the field is hidden due to field-level permissions
  if (fieldAccess.hidden) {
    return fallback ? <>{fallback}</> : null;
  }
  
  // Then check if it should be hidden based on roles
  if (hiddenRoles.length > 0) {
    const isHidden = requireAll 
      ? hasAllRoles(hiddenRoles.map(r => r.toString())) 
      : hasAnyRole(hiddenRoles.map(r => r.toString()));
    
    if (isHidden) {
      return fallback ? <>{fallback}</> : null;
    }
  }
  
  // Check if field should be read-only based on roles or field-level permissions
  let isReadOnly = fieldAccess.readOnly;
  if (!isReadOnly && readOnlyRoles.length > 0) {
    isReadOnly = requireAll
      ? hasAllRoles(readOnlyRoles.map(r => r.toString()))
      : hasAnyRole(readOnlyRoles.map(r => r.toString()));
  }
  
  // Check if user has access to the field based on roles
  let hasAccess = true;
  if (allowedRoles.length > 0) {
    hasAccess = requireAll
      ? hasAllRoles(allowedRoles.map(r => r.toString()))
      : hasAnyRole(allowedRoles.map(r => r.toString()));
  }
  
  if (!hasAccess) {
    return fallback ? <>{fallback}</> : null;
  }
  
  // If read-only, clone children with readOnly prop
  if (isReadOnly) {
    const readOnlyChildren = React.Children.map(children, child => {
      if (React.isValidElement(child)) {
        // Check if the element is an input-like element that supports readOnly
        const elementType = (child.type as any)?.displayName || (typeof child.type === 'string' ? child.type : '');
        const isInputLike = 
          typeof child.type === 'string' && 
          ['input', 'textarea', 'select'].includes(child.type.toLowerCase()) ||
          elementType === 'Input' || 
          elementType === 'Textarea' ||
          elementType === 'Select';

        // Only apply readOnly to elements that can accept it
        if (isInputLike) {
          return React.cloneElement(child as React.ReactElement<any>, {
            readOnly: true,
            disabled: true,
          });
        }
        
        // For other elements, just apply disabled if appropriate
        if ('disabled' in child.props) {
          return React.cloneElement(child as React.ReactElement<any>, {
            disabled: true,
          });
        }
      }
      return child;
    });
    
    return (
      <div className={cn("relative", className)}>
        {readOnlyChildren}
        <div className="absolute top-0 right-0 bg-muted/20 text-xs px-1 rounded">
          Read-only
        </div>
      </div>
    );
  }
  
  // If need to mask the field due to field-level security
  if (fieldAccess.mask) {
    return (
      <div className={className}>
        {fallback || (
          <div className="bg-muted/20 p-2 rounded">
            *** Protected Content ***
          </div>
        )}
      </div>
    );
  }
  
  // If no special treatment needed, just return the children
  return (
    <div className={className}>
      {children}
    </div>
  );
};

export default RoleBasedField;
