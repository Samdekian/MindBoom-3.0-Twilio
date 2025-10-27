
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, AlertCircle, Wrench } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RoleDiagnosticResult } from "@/types/core/rbac";

interface DiagnosticResultsProps {
  result: RoleDiagnosticResult;
  onRepair: () => Promise<void>;
  repairInProgress: boolean;
  isLoading: boolean;
  onRecheck: () => Promise<void>;
}

const DiagnosticResults: React.FC<DiagnosticResultsProps> = ({
  result,
  onRepair,
  repairInProgress,
  isLoading,
  onRecheck,
}) => {
  if (!result.userExists) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>User Not Found</AlertTitle>
        <AlertDescription>
          The specified user could not be found in the system.
          {result.errors && result.errors.length > 0 && (
            <div className="mt-2 text-sm">
              {result.errors.map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">
                {result.userName || result.userId}
              </h3>
              <p className="text-sm text-muted-foreground">
                User ID: {result.userId}
              </p>
            </div>
            <Badge
              variant={result.isConsistent ? "outline" : "destructive"}
              className="ml-auto"
            >
              {result.isConsistent ? "Consistent" : "Inconsistent"}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Database Roles</h4>
              <div className="flex flex-wrap gap-1">
                {(result.databaseRoles || result.dbRoles || []).length > 0 ? (
                  (result.databaseRoles || result.dbRoles || []).map((role) => (
                    <Badge key={role} variant="secondary">
                      {role}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">
                    No roles assigned
                  </span>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-1">Profile Data</h4>
              <div className="space-y-1 text-sm">
                <div>
                  Profile role: {" "}
                  <Badge variant="outline">{result.profileRole || "Not set"}</Badge>
                </div>
                <div>
                  Metadata role: {" "}
                  <Badge variant="outline">{result.metadataRole || "Not set"}</Badge>
                </div>
              </div>
            </div>
          </div>

          {result.errors && result.errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Errors Detected</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  {result.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {result.suggestedFixes && result.suggestedFixes.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Suggested Fixes</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {result.suggestedFixes.map((fix, index) => (
                  <li key={index}>{fix}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 justify-end mt-4">
            <Button
              variant="outline"
              onClick={onRecheck}
              disabled={isLoading || repairInProgress}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Re-check
            </Button>
            
            {!result.isConsistent && !result.repaired && (
              <Button
                onClick={onRepair}
                disabled={isLoading || repairInProgress}
              >
                {repairInProgress ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Wrench className="h-4 w-4 mr-2" />
                )}
                Repair Inconsistencies
              </Button>
            )}
            
            {result.repaired && (
              <Badge variant="default">Repaired Successfully</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiagnosticResults;
