
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoleDiagnosticResult } from '@/types/rbac-monitoring';
import { AlertCircle, ShieldCheck } from "lucide-react";

interface SuggestedFixesProps {
  result: RoleDiagnosticResult;
  onRepair: () => void;
  repairInProgress: boolean;
}

export const SuggestedFixes: React.FC<SuggestedFixesProps> = ({
  result,
  onRepair,
  repairInProgress
}) => {
  // Determine what fixes to suggest based on the diagnostic result
  const suggestFixes = () => {
    const fixes = [];
    
    if (result.dbRoles && result.dbRoles.length > 0 && result.profileRole !== result.dbRoles[0]) {
      fixes.push(`Update profile account_type from "${result.profileRole || 'none'}" to "${result.dbRoles[0]}"`);
    }
    
    if (result.dbRoles && result.dbRoles.length > 0 && result.metadataRole !== result.dbRoles[0]) {
      fixes.push(`Update user metadata accountType from "${result.metadataRole || 'none'}" to "${result.dbRoles[0]}"`);
    }
    
    return fixes;
  };
  
  const fixes = result.suggestedFixes || suggestFixes();
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center">
          <ShieldCheck className="h-4 w-4 mr-2" />
          Suggested Fixes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {fixes.length > 0 ? (
          <div className="space-y-4">
            <ul className="space-y-2 text-sm">
              {fixes.map((fix, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 text-amber-500" />
                  <span>{fix}</span>
                </li>
              ))}
            </ul>
            
            <Button 
              size="sm" 
              onClick={onRepair}
              disabled={repairInProgress}
              className="w-full"
            >
              {repairInProgress ? 'Fixing...' : 'Apply All Fixes'}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No fixes needed. Database roles are the source of truth.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default SuggestedFixes;
