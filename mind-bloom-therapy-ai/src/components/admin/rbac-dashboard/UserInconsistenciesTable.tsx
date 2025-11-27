
import React from "react";
import { ConsistencyCheckResult } from "@/types/utils/rbac/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, XCircle } from "lucide-react";

interface UserInconsistenciesTableProps {
  inconsistentUsers: ConsistencyCheckResult[];
  isLoading: boolean;
  fixUserConsistency: (userId: string, role: string) => Promise<boolean>;
}

const UserInconsistenciesTable: React.FC<UserInconsistenciesTableProps> = ({
  inconsistentUsers,
  isLoading,
  fixUserConsistency,
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableCaption>User accounts with role inconsistencies</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Database Roles</TableHead>
            <TableHead>Metadata</TableHead>
            <TableHead>Profile</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inconsistentUsers.map((user) => (
            <TableRow key={user.userId}>
              <TableCell className="font-medium">
                <div>
                  Unknown User
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {user.userId}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {user.dbRoles && user.dbRoles.length > 0 ? (
                    user.dbRoles.map((role: string) => (
                      <Badge 
                        key={role} 
                        variant="outline" 
                        className={user.dbRoles && user.dbRoles[0] === role ? "border-primary" : ""}
                      >
                        {role}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-sm">No roles</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <span className="text-sm">{user.metadataRole || "not set"}</span>
                  {user.metadataRole !== (user.dbRoles?.[0] || null) ? (
                    <XCircle className="h-4 w-4 text-red-500" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <span className="text-sm">{user.profileRole || "not set"}</span>
                  {user.profileRole !== (user.dbRoles?.[0] || null) ? (
                    <XCircle className="h-4 w-4 text-red-500" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                {user.dbRoles && user.dbRoles.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => fixUserConsistency(user.userId, user.dbRoles[0])}
                    disabled={isLoading}
                  >
                    Fix
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserInconsistenciesTable;
