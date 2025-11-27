
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useRoleRepair } from "@/hooks/use-role-repair";
import { RoleDiagnosticResult } from "@/types/core/rbac";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import DiagnosticResults from "@/components/auth/troubleshooter/DiagnosticResults";
import { Loader2, Search, Shield, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const RBACVerificationPanel: React.FC = () => {
  const [userId, setUserId] = useState("");
  const [showCurrentUser, setShowCurrentUser] = useState(false);
  const { checkRoleConsistency, repairRoles, isLoading } = useRoleRepair();
  const { toast } = useToast();
  const { user } = useAuthRBAC();
  const [diagnosticResult, setDiagnosticResult] = useState<RoleDiagnosticResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Validate user ID exists in the system
  const validateUserId = async (userIdToCheck: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('id', userIdToCheck)
        .single();

      if (error || !data) {
        setValidationError("User not found in the system");
        return false;
      }
      
      setValidationError(null);
      return true;
    } catch (error) {
      setValidationError("Error validating user ID");
      return false;
    }
  };

  const handleCheckUser = async () => {
    if (!userId && !showCurrentUser) {
      toast({
        title: "User ID required",
        description: "Please enter a user ID to check",
        variant: "destructive",
      });
      return;
    }

    const userIdToCheck = showCurrentUser ? user?.id : userId;
    
    if (!userIdToCheck) {
      toast({
        title: "No user selected",
        description: "Could not determine which user to check",
        variant: "destructive",
      });
      return;
    }

    // Validate user exists before checking consistency
    const isValidUser = await validateUserId(userIdToCheck);
    if (!isValidUser) {
      toast({
        title: "Invalid User",
        description: validationError || "User not found",
        variant: "destructive",
      });
      return;
    }
    
    const result = await checkRoleConsistency(userIdToCheck);
    setDiagnosticResult(result || null);
  };

  const handleUseCurrentUser = () => {
    setShowCurrentUser(true);
    setUserId("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserId(e.target.value);
    setShowCurrentUser(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2 text-primary" />
          RBAC Verification Tool
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="userId">User ID</Label>
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  id="userId"
                  placeholder="Enter user ID to check"
                  value={showCurrentUser ? (user?.id || "") : userId}
                  onChange={handleInputChange}
                  disabled={showCurrentUser || isLoading}
                  className={`w-full ${validationError ? 'border-destructive' : ''}`}
                />
                {validationError && (
                  <div className="flex items-center text-sm text-destructive mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {validationError}
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                onClick={handleUseCurrentUser}
                disabled={isLoading}
              >
                Use Current User
              </Button>
              <Button 
                onClick={handleCheckUser}
                disabled={(!userId && !showCurrentUser) || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Check User
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <Separator />
          
          {diagnosticResult ? (
            <DiagnosticResults 
              results={diagnosticResult} 
              onUpdate={() => handleCheckUser()}
            />
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium mb-2">RBAC Consistency Checker</p>
              <p className="text-sm">
                Enter a user ID to check role consistency across all systems
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RBACVerificationPanel;
