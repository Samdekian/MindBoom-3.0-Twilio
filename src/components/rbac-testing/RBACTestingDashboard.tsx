
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { RoleDiagnosticResult } from "@/types/core/rbac";

const RBACTestingDashboard: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RoleDiagnosticResult | null>(null);
  const [repairInProgress, setRepairInProgress] = useState(false);

  const checkUser = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      // Mocked response while we connect to the real API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Replace this with actual API call - include all required properties
      const mockResult: RoleDiagnosticResult = {
        id: `diagnostic-${Date.now()}`,
        user_id: userId,
        userId,
        user_email: `${userId}@example.com`,
        expected_roles: ['patient'],
        actual_roles: ['patient'],
        missing_roles: [],
        extra_roles: [],
        permissions_count: 5,
        last_checked: new Date().toISOString(),
        status: 'warning',
        issues: ['Profile account_type does not match primary role'],
        databaseRoles: ['patient'],
        dbRoles: ['patient'],
        profileRole: 'therapist',
        metadataRole: 'patient',
        errors: ['Profile account_type does not match primary role'],
        isConsistent: false,
        repaired: false,
        userExists: true,
        userName: `User ${userId}`,
        primaryRole: 'patient',
        suggestedFixes: ['Update profile account_type to match database roles'],
        severity: 'medium',
        issue: 'Role inconsistency detected'
      };
      
      setResult(mockResult);
    } catch (error) {
      console.error('Error checking user:', error);
      
      // Set error result - include all required properties
      const errorResult: RoleDiagnosticResult = {
        id: `diagnostic-error-${Date.now()}`,
        user_id: userId,
        userId,
        user_email: '',
        expected_roles: [],
        actual_roles: [],
        missing_roles: [],
        extra_roles: [],
        permissions_count: 0,
        last_checked: new Date().toISOString(),
        status: 'error',
        issues: ['Error checking user role consistency'],
        databaseRoles: [],
        dbRoles: [],
        errors: ['Error checking user role consistency'],
        isConsistent: false,
        repaired: false,
        userExists: false,
        severity: 'high',
        issue: 'Error checking role consistency'
      };
      
      setResult(errorResult);
    } finally {
      setLoading(false);
    }
  };

  const repairUserRoles = async () => {
    if (!result) return;
    
    setRepairInProgress(true);
    try {
      // Mocked repair response
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Replace this with actual API call
      const repairedResult: RoleDiagnosticResult = {
        ...result,
        isConsistent: true,
        errors: [],
        issues: [],
        profileRole: result.primaryRole,
        metadataRole: result.primaryRole,
        repaired: true,
        issue: 'All role data is consistent',
        severity: 'low',
        status: 'healthy'
      };
      
      setResult(repairedResult);
    } catch (error) {
      console.error('Error repairing roles:', error);
    } finally {
      setRepairInProgress(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>RBAC Testing Dashboard</CardTitle>
        <CardDescription>Test role-based access control functionality</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input 
              placeholder="Enter user ID to check"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="flex-grow"
            />
            <Button onClick={checkUser} disabled={!userId || loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Check User
            </Button>
          </div>

          {result && (
            <div className="mt-4">
              <Alert variant={result.isConsistent ? "default" : "warning"}>
                {result.isConsistent ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                <AlertTitle>
                  {result.isConsistent ? "User roles are consistent" : "Role inconsistency detected"}
                </AlertTitle>
                <AlertDescription>
                  {result.isConsistent ? "All role data is synchronized across systems." : result.issue}
                </AlertDescription>
              </Alert>

              {!result.userExists ? (
                <div className="mt-4 p-4 border rounded-md bg-destructive/10">
                  <p>User does not exist or could not be found.</p>
                </div>
              ) : (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">User Details</h3>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">User ID</TableCell>
                        <TableCell>{result.userId}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Database Roles</TableCell>
                        <TableCell>{result.databaseRoles?.join(', ') || 'None'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Primary Role</TableCell>
                        <TableCell>{result.primaryRole || 'None'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Profile Role</TableCell>
                        <TableCell>{result.profileRole || 'None'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Metadata Role</TableCell>
                        <TableCell>{result.metadataRole || 'None'}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  {!result.isConsistent && (
                    <>
                      <h3 className="font-medium mt-4 mb-2">Issues</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {result.errors?.map((error, i) => (
                          <li key={i} className="text-destructive">{error}</li>
                        ))}
                      </ul>

                      {result.suggestedFixes && result.suggestedFixes.length > 0 && (
                        <>
                          <h3 className="font-medium mt-4 mb-2">Suggested Fixes</h3>
                          <ul className="list-disc pl-5 space-y-1">
                            {result.suggestedFixes.map((fix, i) => (
                              <li key={i}>{fix}</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      {result && !result.isConsistent && (
        <CardFooter>
          <Button 
            onClick={repairUserRoles} 
            disabled={loading || repairInProgress}
            className="w-full"
          >
            {repairInProgress ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Repair Role Inconsistencies
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default RBACTestingDashboard;
