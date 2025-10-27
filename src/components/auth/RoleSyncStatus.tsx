
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRoleSync } from '@/hooks/useRoleSync';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { RefreshCw, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const RoleSyncStatus: React.FC = () => {
  const { userRoles, loading, isAdmin } = useAuthRBAC();
  const { syncRoles, checkConsistency, syncing } = useRoleSync();

  const handleSync = async () => {
    const result = await syncRoles();
    console.log('Role sync result:', result);
  };

  if (!isAdmin) {
    return null; // Only show to admins
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Role Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Roles */}
        <div>
          <h4 className="text-sm font-medium mb-2">Current Roles</h4>
          <div className="flex flex-wrap gap-1">
            {userRoles.map((role) => (
              <Badge key={role} variant="outline">
                {role}
              </Badge>
            ))}
            {userRoles.length === 0 && (
              <span className="text-sm text-muted-foreground">No roles assigned</span>
            )}
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : userRoles.length > 0 ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          )}
          <span className="text-sm">
            {loading ? 'Loading...' : userRoles.length > 0 ? 'Active' : 'No roles'}
          </span>
        </div>

        {/* Sync Button */}
        <Button
          onClick={handleSync}
          disabled={syncing || loading}
          className="w-full"
          variant="outline"
        >
          {syncing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync Roles
            </>
          )}
        </Button>

        {/* Warning for users with no roles */}
        {!loading && userRoles.length === 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No roles detected. Click "Sync Roles" to fix this issue.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default RoleSyncStatus;
