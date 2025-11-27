
import { useState, useCallback, useEffect } from "react";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";

export type ComponentPermission = {
  resource: string;
  action: string;
  level?: 'none' | 'read' | 'write' | 'admin';
};

interface PermissionOptions {
  requireAll?: boolean;
}

interface FieldAccessResult {
  readOnly: boolean;
  hidden: boolean;
  mask: boolean;
}

interface PermissionResult {
  isLoading: boolean;
  checkPermissions: (permissions: ComponentPermission[], options?: PermissionOptions) => boolean;
  hasPermission: (resource: string, action: string) => boolean;
  getFieldAccess: (fieldName: string) => FieldAccessResult;
  fieldPermissions: Record<string, FieldAccessResult>;
}

export function usePermission(): PermissionResult {
  const { loading, permissions, hasPermission, getFieldAccess } = useAuthRBAC();
  const [fieldPermissions, setFieldPermissions] = useState<Record<string, FieldAccessResult>>({});

  // Cache field permissions for better performance
  useEffect(() => {
    // This would ideally fetch field permissions from the server
    // For now we'll use a simple implementation
    const fields: Record<string, FieldAccessResult> = {
      // Examples of field-level access control
      'patientNotes': {
        readOnly: !hasPermission('medical_records:write'),
        hidden: !hasPermission('medical_records:read'),
        mask: false
      },
      'billingInfo': {
        readOnly: !hasPermission('billing:write'),
        hidden: !hasPermission('billing:read'),
        mask: !hasPermission('billing:admin')
      },
    };
    
    setFieldPermissions(fields);
  }, [permissions, hasPermission]);

  const checkPermissions = useCallback(
    (permissions: ComponentPermission[], options?: PermissionOptions): boolean => {
      const requireAll = options?.requireAll || false;

      if (!permissions.length) {
        return true; // No permissions required
      }

      if (requireAll) {
        return permissions.every(permission => 
          hasPermission(`${permission.resource}:${permission.action}`)
        );
      } else {
        return permissions.some(permission => 
          hasPermission(`${permission.resource}:${permission.action}`)
        );
      }
    },
    [hasPermission]
  );

  // Wrap getFieldAccess to ensure proper return type
  const wrappedGetFieldAccess = useCallback(
    (fieldName: string): FieldAccessResult => {
      const fieldAccess = getFieldAccess(fieldName);
      return {
        readOnly: fieldAccess.readOnly,
        hidden: fieldAccess.hidden,
        mask: fieldAccess.mask
      };
    },
    [getFieldAccess]
  );

  return {
    isLoading: loading,
    checkPermissions,
    hasPermission: (resource: string, action: string) => hasPermission(`${resource}:${action}`),
    getFieldAccess: wrappedGetFieldAccess,
    fieldPermissions
  };
}
