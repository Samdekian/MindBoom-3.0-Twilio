
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useRBACIntegrity } from '@/hooks/use-rbac-integrity';
import { Shield, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import RBACConsistencyCheck from './RBACConsistencyCheck';

const RoleConsistencyDashboard: React.FC = () => {
  const { isAdmin } = useRBACIntegrity();
  
  if (!isAdmin) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You need administrator permissions to access the role consistency dashboard.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-5 w-5 text-primary" />
          Role Consistency Dashboard
        </CardTitle>
        <CardDescription>
          Monitor and fix inconsistencies in your RBAC system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RBACConsistencyCheck />
      </CardContent>
    </Card>
  );
};

export default RoleConsistencyDashboard;
