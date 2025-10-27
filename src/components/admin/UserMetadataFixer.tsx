
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Loader2, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { ADMIN_PATHS } from "@/routes/routePaths";
import { useAuditLogging } from "@/hooks/security/use-audit-logging";
import { useUserManagement } from "@/hooks/use-user-management";

// Updated to the correct admin user ID based on auth logs
const ADMIN_USER_ID = "d13d56c7-41b4-4ecf-a10e-686cb2f7394e";

export const UserMetadataFixer = () => {
  const [isFixing, setIsFixing] = useState(false);
  const [isFixed, setIsFixed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [steps, setSteps] = useState<{[key: string]: 'pending' | 'complete' | 'error'}>({
    'approvalStatus': 'pending',
    'adminRole': 'pending',
    'roleAssignment': 'pending',
    'profileUpdate': 'pending'
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const { logActivity } = useAuditLogging();
  const { fixUserMetadata, logAuditEvent: logManagementEvent } = useUserManagement();

  const handleFixMetadata = async () => {
    setIsFixing(true);
    setError(null);
    
    try {
      // Use our hook to fix the user metadata
      const result = await fixUserMetadata(ADMIN_USER_ID);
      setSteps(result.steps);
      
      if (!result.success) {
        throw new Error("Failed to fix user profile");
      }
      
      // Log the approval status change
      await logActivity.mutateAsync({
        activity_type: 'approval_status_change',
        resource_type: 'profiles',
        resource_id: ADMIN_USER_ID,
        metadata: {
          previous_status: 'pending',
          new_status: 'approved',
          admin_notes: null,
          method: 'manual_metadata_fixer'
        }
      });
      
      // Log the role assignment
      await logManagementEvent(
        'role_assigned',
        'user_roles',
        ADMIN_USER_ID,
        {
          role: 'admin',
          method: 'metadata_fixer'
        }
      );
      
      setIsFixed(true);
      toast({
        title: "User profile fixed",
        description: "The admin user's approval status and role have been set correctly.",
        variant: "default",
      });
      
      // Add a slight delay before redirect to allow the toast to be seen
      setTimeout(() => {
        // Redirect to admin dashboard after successful fix
        navigate(ADMIN_PATHS.DASHBOARD, { replace: true });
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Unknown error occurred");
      toast({
        title: "Error fixing user profile",
        description: err.message || "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="bg-muted/50">
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-amber-500" />
          Fix Admin User Profile
        </CardTitle>
        <CardDescription>
          Set approval status to 'approved' and assign admin role for admin user ID: {ADMIN_USER_ID}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isFixed ? (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            <span>User profile and admin role successfully set! Redirecting to admin dashboard...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <p>
              This utility will set the approval status to 'approved' for this admin user
              and ensure the admin role is properly assigned, ensuring proper system access and functionality.
            </p>
            
            {isFixing && (
              <div className="space-y-2 mt-4">
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-2 ${steps.approvalStatus === 'complete' ? 'bg-green-500' : steps.approvalStatus === 'error' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                  <span>Setting approval status to 'approved'</span>
                </div>
                
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-2 ${steps.adminRole === 'complete' ? 'bg-green-500' : steps.adminRole === 'error' ? 'bg-red-500' : steps.adminRole === 'pending' && steps.approvalStatus === 'complete' ? 'bg-amber-500' : 'bg-gray-300'}`}></div>
                  <span>Getting admin role ID</span>
                </div>
                
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-2 ${steps.roleAssignment === 'complete' ? 'bg-green-500' : steps.roleAssignment === 'error' ? 'bg-red-500' : steps.roleAssignment === 'pending' && steps.adminRole === 'complete' ? 'bg-amber-500' : 'bg-gray-300'}`}></div>
                  <span>Assigning admin role to user</span>
                </div>
                
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-2 ${steps.profileUpdate === 'complete' ? 'bg-green-500' : steps.profileUpdate === 'error' ? 'bg-red-500' : steps.profileUpdate === 'pending' && steps.roleAssignment === 'complete' ? 'bg-amber-500' : 'bg-gray-300'}`}></div>
                  <span>Updating user profile and metadata</span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-muted/20 flex justify-end">
        <Button 
          onClick={handleFixMetadata} 
          disabled={isFixing || isFixed}
          variant={isFixed ? "outline" : "default"}
        >
          {isFixing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          {isFixed ? "Profile Fixed" : "Fix User Profile"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UserMetadataFixer;
