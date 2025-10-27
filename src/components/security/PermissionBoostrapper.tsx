
import React from "react";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PermissionBootstrapper: React.FC = () => {
  const { user, userRoles, permissions, loading } = useAuthRBAC();

  if (!user || loading) {
    return null;
  }

  const permissionEntries = Object.entries(permissions || {});

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Role-Based Permissions</CardTitle>
        <CardDescription>
          User permissions bootstrapped from RBAC roles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-1">User Roles:</h4>
          <div className="flex flex-wrap gap-2">
            {userRoles.length > 0 ? (
              userRoles.map((role) => (
                <Badge key={role} variant="outline" className="bg-primary/10">
                  {role}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">No roles assigned</span>
            )}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Permissions:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {permissionEntries.map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-2 border rounded">
                <span className="text-xs">{formatPermissionName(key)}</span>
                <Badge variant={value ? "default" : "secondary"}>
                  {value ? "Allowed" : "Denied"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to format permission names
const formatPermissionName = (permission: string): string => {
  return permission
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase());
};

export default PermissionBootstrapper;
