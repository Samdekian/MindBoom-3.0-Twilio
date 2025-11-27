
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { RoleDiagnosticResult } from "@/types/core/rbac";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import SuggestedFixes from "./SuggestedFixes";

interface DiagnosticResultsProps {
  results: RoleDiagnosticResult | null;
  onUpdate?: () => void;
}

const DiagnosticResults: React.FC<DiagnosticResultsProps> = ({ results, onUpdate }) => {
  if (!results) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Diagnostic Results</CardTitle>
          <Badge
            variant={results.isConsistent ? "success" : "destructive"}
            className={results.isConsistent ? "bg-green-500" : ""}
          >
            {results.isConsistent ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" /> Consistent
              </>
            ) : (
              <>
                <AlertTriangle className="h-3 w-3 mr-1" /> Inconsistent
              </>
            )}
          </Badge>
        </div>
        <CardDescription>
          Role consistency check for user ID: {results.userId}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Database roles */}
        <div>
          <h4 className="font-medium text-sm mb-1">Database Roles:</h4>
          <div className="flex flex-wrap gap-1">
            {results.databaseRoles && results.databaseRoles.length > 0 ? (
              results.databaseRoles.map((role) => (
                <Badge key={role} variant="outline">
                  {role}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">No roles assigned</span>
            )}
          </div>
        </div>
        
        {/* Primary Role */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <h4 className="font-medium text-sm mb-1">Primary Role:</h4>
            <div>
              {results.primaryRole ? (
                <Badge>{results.primaryRole}</Badge>
              ) : (
                <Badge variant="outline">None</Badge>
              )}
            </div>
          </div>
          
          {/* Profile Role */}
          <div>
            <h4 className="font-medium text-sm mb-1">Profile Role:</h4>
            <div className="flex items-center gap-1">
              {results.profileRole ? (
                <>
                  <Badge>{results.profileRole}</Badge>
                  {results.profileRole !== results.primaryRole && (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </>
              ) : (
                <Badge variant="outline">None</Badge>
              )}
            </div>
          </div>
          
          {/* Metadata Role */}
          <div>
            <h4 className="font-medium text-sm mb-1">Metadata Role:</h4>
            <div className="flex items-center gap-1">
              {results.metadataRole ? (
                <>
                  <Badge>{results.metadataRole}</Badge>
                  {results.metadataRole !== results.primaryRole && (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </>
              ) : (
                <Badge variant="outline">None</Badge>
              )}
            </div>
          </div>
        </div>
        
        {/* Errors */}
        {results.errors && results.errors.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-1 text-red-500">Errors:</h4>
            <ul className="list-disc pl-5 text-sm text-red-500">
              {results.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Suggested Fixes */}
        {!results.isConsistent && (
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Suggested Fixes:</h4>
            <SuggestedFixes results={results} onUpdate={onUpdate} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DiagnosticResults;
