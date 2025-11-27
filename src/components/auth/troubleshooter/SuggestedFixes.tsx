
import React from "react";
import { Button } from "@/components/ui/button";
import { RoleDiagnosticResult } from "@/types/core/rbac";
import { useRoleRepair } from "@/hooks/use-role-repair";
import { useToast } from "@/hooks/use-toast";
import { asUserRoles } from "@/utils/rbac/type-adapters";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, Shield, AlertCircle } from "lucide-react";

export interface SuggestedFixesProps {
  results: RoleDiagnosticResult;
  onUpdate?: () => void;
}

const SuggestedFixes: React.FC<SuggestedFixesProps> = ({ results, onUpdate }) => {
  const { repairRoles, isLoading } = useRoleRepair(); // Updated to use repairRoles instead of repairRole
  const { toast } = useToast();
  
  if (!results) return null;
  
  // If already consistent, no fixes needed
  if (results.isConsistent) {
    return (
      <Alert className="bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>No fixes needed</AlertTitle>
        <AlertDescription>
          User roles are consistent across all systems
        </AlertDescription>
      </Alert>
    );
  }
  
  // If already repaired
  if (results.repaired) {
    return (
      <Alert className="bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400">
        <Shield className="h-4 w-4" />
        <AlertTitle>Roles Synchronized</AlertTitle>
        <AlertDescription>
          User roles have been automatically repaired
        </AlertDescription>
      </Alert>
    );
  }
  
  // Handle case where user doesn't exist
  if (!results.userExists) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>User not found</AlertTitle>
        <AlertDescription>
          The requested user ID doesn't exist in the database
        </AlertDescription>
      </Alert>
    );
  }

  const handleApplyFix = async () => {
    if (!results.userId) {
      toast({
        title: "Error",
        description: "Cannot repair: missing user ID",
        variant: "destructive",
      });
      return;
    }
    
    await repairRoles(results.userId); // Updated method name
    
    if (onUpdate) {
      onUpdate();
    }
  };

  return (
    <div className="space-y-4">
      <Alert variant="warning">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Role Inconsistency Detected</AlertTitle>
        <AlertDescription>
          <div className="mt-2">
            <p className="mb-2">
              The user's roles are not consistent across all systems:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Primary Role from database: <strong>{results.primaryRole || "none"}</strong></li>
              <li>Profile account_type: <strong>{results.profileRole || "none"}</strong></li>
              <li>User metadata accountType: <strong>{results.metadataRole || "none"}</strong></li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>

      <div className="flex justify-end">
        <Button onClick={handleApplyFix} disabled={isLoading} className="ml-auto">
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          Apply Fix
        </Button>
      </div>
    </div>
  );
};

export default SuggestedFixes;
