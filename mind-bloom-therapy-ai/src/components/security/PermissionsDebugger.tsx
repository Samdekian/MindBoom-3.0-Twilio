
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { useRBAC } from "@/hooks/useRBAC";
import { Badge } from "@/components/ui/badge";
import { Lock, User, Shield } from "lucide-react";

interface PermissionsDebuggerProps {
  targetPage?: string;
  requiredRoles?: string[];
  className?: string;
}

const PermissionsDebugger: React.FC<PermissionsDebuggerProps> = ({
  targetPage,
  requiredRoles = [],
  className
}) => {
  const { user } = useAuthRBAC();
  const { roles, hasRole } = useRBAC();
  
  // Determine if the user has the required roles
  const hasRequiredRoles = requiredRoles.length === 0 || 
    requiredRoles.some(role => hasRole(role as any));
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Permissions Debugger
        </CardTitle>
        {targetPage && (
          <CardDescription>
            Debugging permissions for: <span className="font-mono">{targetPage}</span>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User Authentication Status */}
        <div>
          <div className="text-sm font-medium mb-1">Authentication Status:</div>
          <div className="flex items-center gap-2">
            {user ? (
              <Badge variant="outline" className="flex items-center gap-1 border-green-500 text-green-500">
                <User className="h-3 w-3" /> Authenticated
              </Badge>
            ) : (
              <Badge variant="outline" className="flex items-center gap-1 border-destructive text-destructive">
                <Lock className="h-3 w-3" /> Unauthenticated
              </Badge>
            )}
          </div>
        </div>
        
        {/* Current User Roles */}
        <div>
          <div className="text-sm font-medium mb-1">Current User Roles:</div>
          <div className="flex flex-wrap gap-1">
            {roles.length > 0 ? (
              roles.map(role => (
                <Badge key={role} className="capitalize">
                  {role}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground text-sm">No roles assigned</span>
            )}
          </div>
        </div>
        
        {/* Required Roles */}
        {requiredRoles && requiredRoles.length > 0 && (
          <div>
            <div className="text-sm font-medium mb-1">Required Roles (at least one):</div>
            <div className="flex flex-wrap gap-1">
              {requiredRoles.map(role => (
                <Badge key={role} variant={hasRole(role as any) ? "default" : "outline"} className="capitalize">
                  {role}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Access Status */}
        <div>
          <div className="text-sm font-medium mb-1">Access Status:</div>
          <div>
            {hasRequiredRoles ? (
              <Badge className="bg-green-600">Access Granted</Badge>
            ) : (
              <Badge variant="destructive">Access Denied</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PermissionsDebugger;
