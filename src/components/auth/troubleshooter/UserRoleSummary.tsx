
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { RoleDiagnosticResult } from '@/types';

interface UserRoleSummaryProps {
  result: RoleDiagnosticResult;
}

export const UserRoleSummary: React.FC<UserRoleSummaryProps> = ({ result }) => {
  const getBadgeVariant = (isActive: boolean) => {
    return isActive ? "default" : "outline";
  };
  
  const baseRoles = result.databaseRoles || result.dbRoles || [];
  
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h3 className="font-medium">User Role Information</h3>
      
      <div className="space-y-2">
        <div>
          <h4 className="text-sm font-medium mb-1">Database Role Assignments</h4>
          <div className="flex flex-wrap gap-1">
            {baseRoles.length > 0 ? (
              baseRoles.map((role) => (
                <Badge key={role} variant="secondary">
                  {role}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">
                No database roles assigned
              </span>
            )}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-1">Profile Role</h4>
          <Badge variant={getBadgeVariant(!!result.profileRole)}>
            {result.profileRole || "Not set"}
          </Badge>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-1">User Metadata Role</h4>
          <Badge variant={getBadgeVariant(!!result.metadataRole)}>
            {result.metadataRole || "Not set"}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default UserRoleSummary;
