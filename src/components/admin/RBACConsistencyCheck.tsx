
import React, { useState } from "react";
import { useRBACIntegrity } from "@/hooks/use-rbac-integrity";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, ShieldAlert, AlertTriangle, CheckCircle2, UserCheck, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";

const RBACConsistencyCheck: React.FC = () => {
  const {
    loading,
    inconsistentUsers,
    checkAllUsers,
    fixUserInconsistency,
    fixAllInconsistencies
  } = useRBACIntegrity();
  const { isAdmin } = useAuthRBAC();
  const [checkPerformed, setCheckPerformed] = useState(false);

  const handleCheckConsistency = async () => {
    await checkAllUsers();
    setCheckPerformed(true);
  };

  if (!isAdmin) {
    return (
      <Alert variant="destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You need administrator permissions to access the RBAC consistency check.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <ShieldCheck className="mr-2 h-5 w-5 text-primary" />
          RBAC Data Consistency Check
        </CardTitle>
        <CardDescription>
          Check and fix inconsistencies between user metadata, profiles and database roles
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex justify-center my-8">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Checking role consistency...</p>
            </div>
          </div>
        ) : (
          <>
            <Alert variant={
              !checkPerformed ? "default" : 
              inconsistentUsers.length > 0 ? "warning" : "default"
            }>
              {!checkPerformed ? (
                <>
                  <RefreshCw className="h-4 w-4" />
                  <AlertTitle>Ready to Check</AlertTitle>
                  <AlertDescription>
                    Click "Check Consistency" to scan for role inconsistencies between user metadata, 
                    profiles and database roles.
                  </AlertDescription>
                </>
              ) : inconsistentUsers.length > 0 ? (
                <>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Inconsistencies Found</AlertTitle>
                  <AlertDescription>
                    Found {inconsistentUsers.length} users with inconsistent role data. 
                    These can lead to permission errors and unexpected behavior.
                  </AlertDescription>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>All Consistent</AlertTitle>
                  <AlertDescription>
                    Great! All user roles are consistent across database, profiles and metadata.
                  </AlertDescription>
                </>
              )}
            </Alert>
            
            {checkPerformed && inconsistentUsers.length > 0 && (
              <div className="mt-4 rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40%]">User ID</TableHead>
                      <TableHead>Consistency Issue</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inconsistentUsers.map((user) => (
                      <TableRow key={user.userId}>
                        <TableCell className="font-mono text-xs">
                          {user.userId}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">
                              <span className="font-medium">Database roles:</span>{" "}
                              {user.databaseRoles && user.databaseRoles.length > 0 ? (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {user.databaseRoles.map((role, index) => (
                                    <Badge key={`${role}-${index}`} variant="outline">{role}</Badge>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">No roles</span>
                              )}
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Profile account type:</span>{" "}
                              <Badge>{user.profileRole || "none"}</Badge>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Metadata account type:</span>{" "}
                              <Badge>{user.metadataRole || "none"}</Badge>
                            </div>
                            {user.errors && user.errors.length > 0 && (
                              <div className="text-sm text-red-500">
                                Error: {user.errors.join(', ')}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-24"
                                  disabled={loading}
                                  onClick={() => fixUserInconsistency(user.userId)}
                                >
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Fix
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Fix inconsistencies by making database roles the single source of truth</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}
      </CardContent>
      
      <CardFooter className={cn(
        "flex flex-col sm:flex-row sm:justify-between gap-2",
        inconsistentUsers.length === 0 && "justify-end"
      )}>
        {inconsistentUsers.length > 0 && (
          <Button 
            variant="secondary"
            onClick={fixAllInconsistencies}
            disabled={loading}
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            Fix All Inconsistencies
          </Button>
        )}
        
        <Button 
          variant={checkPerformed ? "outline" : "default"}
          onClick={handleCheckConsistency}
          disabled={loading}
        >
          <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
          {checkPerformed ? "Re-Check Consistency" : "Check Consistency"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RBACConsistencyCheck;
