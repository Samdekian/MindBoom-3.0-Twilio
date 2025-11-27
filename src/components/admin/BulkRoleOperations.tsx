import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { Loader2, RefreshCcw, CheckCircle } from 'lucide-react';

// Function to safely call RPC functions that might not be typed
const safeRpcCall = async (functionName: string, params?: any) => {
  return await supabase.rpc(functionName as any, params);
};

const BulkRoleOperations = () => {
  const { user } = useAuthRBAC();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);
  const [syncResult, setSyncResult] = useState<number | null>(null);
  const [repairResult, setRepairResult] = useState<number | null>(null);

  const syncAllProfiles = async () => {
    if (!user) return;
    
    setIsSyncing(true);
    setSyncResult(null);
    
    try {
      // Use safe RPC call function
      const { data, error } = await safeRpcCall('sync_all_profiles');
      
      if (error) {
        throw error;
      }
      
      const processed = data && typeof data === 'object' && 'processed' in data 
        ? Number(data.processed) 
        : 0;
        
      setSyncResult(processed);
      toast({
        title: "Profiles Synchronized",
        description: `Successfully synchronized ${processed} profiles.`,
      });
    } catch (err: any) {
      console.error("Error syncing profiles:", err);
      toast({
        title: "Sync Failed",
        description: err.message || "Failed to sync profiles",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const repairAllInconsistencies = async () => {
    if (!user) return;
    
    setIsRepairing(true);
    setRepairResult(null);
    
    try {
      // Use safe RPC call function
      const { data, error } = await safeRpcCall('repair_all_role_inconsistencies');
      
      if (error) {
        throw error;
      }
      
      const fixed = data && typeof data === 'object' && 'fixed' in data 
        ? Number(data.fixed) 
        : 0;
        
      setRepairResult(fixed);
      toast({
        title: "Inconsistencies Repaired",
        description: `Successfully repaired ${fixed} user roles.`,
      });
    } catch (err: any) {
      console.error("Error repairing inconsistencies:", err);
      toast({
        title: "Repair Failed",
        description: err.message || "Failed to repair role inconsistencies",
        variant: "destructive",
      });
    } finally {
      setIsRepairing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Role Operations</CardTitle>
        <CardDescription>Perform operations on all users to ensure data consistency</CardDescription>
      </CardHeader>
      
      <CardContent className="grid gap-4">
        <div className="flex items-center justify-between px-4 py-2 rounded-lg border">
          <div className="space-y-0.5">
            <h3 className="text-sm font-medium tracking-tight">Synchronize All Profiles</h3>
            <p className="text-muted-foreground text-sm">Update all user accounts to match their database roles</p>
          </div>
          <div className="flex items-center">
            {syncResult !== null && (
              <span className="text-sm text-muted-foreground mr-4 flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" /> {syncResult} profiles updated
              </span>
            )}
            <Button 
              size="sm" 
              onClick={syncAllProfiles} 
              disabled={isSyncing}
            >
              {isSyncing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Sync All
                </>
              )}
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between px-4 py-2 rounded-lg border">
          <div className="space-y-0.5">
            <h3 className="text-sm font-medium tracking-tight">Fix Role Inconsistencies</h3>
            <p className="text-muted-foreground text-sm">Repair any role data inconsistencies across the system</p>
          </div>
          <div className="flex items-center">
            {repairResult !== null && (
              <span className="text-sm text-muted-foreground mr-4 flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" /> {repairResult} issues fixed
              </span>
            )}
            <Button 
              size="sm" 
              onClick={repairAllInconsistencies} 
              disabled={isRepairing}
              variant="secondary"
            >
              {isRepairing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Repairing...
                </>
              ) : (
                <>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Fix All
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t px-6 py-3">
        <p className="text-xs text-muted-foreground">
          These operations may take a while to complete for large user bases. Keep this page open until complete.
        </p>
      </CardFooter>
    </Card>
  );
};

export default BulkRoleOperations;
