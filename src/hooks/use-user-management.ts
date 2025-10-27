
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { UserManagementService } from "@/services/rbac/user-management-service";
import { UserRole } from "@/types/core/rbac";

interface UserManagementHookReturn {
  isLoading: boolean;
  error: string | null;
  fixUserMetadata: (userId: string) => Promise<{
    success: boolean;
    steps: Record<string, 'pending' | 'complete' | 'error'>;
  }>;
  assignRole: (userId: string, role: string) => Promise<boolean>;
  getOrCreateRole: (roleName: string) => Promise<string>;
  logAuditEvent: (
    eventType: string,
    resourceType: string,
    resourceId: string,
    metadata: Record<string, any>
  ) => Promise<void>;
}

/**
 * Hook to manage users, roles, and related operations
 */
export function useUserManagement(): UserManagementHookReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  /**
   * Fix user metadata by ensuring approval status and roles are correct
   */
  const fixUserMetadata = async (userId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await UserManagementService.fixUserMetadata(userId);
      
      if (!result.success && result.error) {
        setError(result.error);
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
      
      return result;
    } catch (err: any) {
      const errorMsg = err.message || "An unknown error occurred";
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      return {
        success: false,
        steps: {},
        error: errorMsg
      };
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Assign a role to a user
   */
  const assignRole = async (userId: string, role: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await UserManagementService.assignRole(userId, role);
      
      if (!result.success) {
        setError(result.message);
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    } catch (err: any) {
      const errorMsg = err.message || "An unknown error occurred";
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Get or create a role
   */
  const getOrCreateRole = async (roleName: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      return await UserManagementService.getOrCreateRole(roleName);
    } catch (err: any) {
      const errorMsg = err.message || "An unknown error occurred";
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Log an audit event
   */
  const logAuditEvent = async (
    eventType: string,
    resourceType: string,
    resourceId: string,
    metadata: Record<string, any>
  ) => {
    try {
      await UserManagementService.logAuditEvent(eventType, resourceType, resourceId, metadata);
    } catch (err: any) {
      console.error('Error logging audit event:', err);
      // Don't block the UI flow for audit logging errors
    }
  };
  
  return {
    isLoading,
    error,
    fixUserMetadata,
    assignRole,
    getOrCreateRole,
    logAuditEvent
  };
}
