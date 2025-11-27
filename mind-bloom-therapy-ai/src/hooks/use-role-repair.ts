
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { RoleDiagnosticResult } from "@/types/core/rbac";
import { createDiagnosticResult } from "@/utils/rbac/diagnostic-helpers";

export const useRoleRepair = () => {
  const [isRepairing, setIsRepairing] = useState(false);
  const [lastRepairResult, setLastRepairResult] = useState<RoleDiagnosticResult | null>(null);
  const { toast } = useToast();

  const repairUserRoles = useCallback(async (userId: string): Promise<RoleDiagnosticResult> => {
    if (!userId) {
      throw new Error("User ID is required for role repair");
    }

    setIsRepairing(true);

    try {
      // Simulate role repair process
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create successful repair result
      const result = createDiagnosticResult({
        userId,
        userName: `User ${userId}`,
        userExists: true,
        isConsistent: true,
        databaseRoles: ['patient'],
        profileRole: 'patient',
        metadataRole: 'patient',
        primaryRole: 'patient',
        errors: [],
        severity: 'low',
        issue: 'Role inconsistency repaired successfully',
        suggestedFixes: [],
        repaired: true
      });

      setLastRepairResult(result);

      toast({
        title: "Role Repair Successful",
        description: "User roles have been repaired and synchronized.",
        variant: "default",
      });

      return result;

    } catch (error: any) {
      console.error("Error repairing user roles:", error);

      const errorResult = createDiagnosticResult({
        userId,
        userExists: false,
        isConsistent: false,
        databaseRoles: [],
        errors: [error.message || 'Unknown error occurred'],
        severity: 'high',
        issue: 'Error repairing roles',
        suggestedFixes: ['Please contact support if this error persists']
      });

      toast({
        title: "Role Repair Failed",
        description: error.message || "An unknown error occurred during repair",
        variant: "destructive",
      });

      return errorResult;
    } finally {
      setIsRepairing(false);
    }
  }, [toast]);

  const checkUserRoles = useCallback(async (userId: string): Promise<RoleDiagnosticResult> => {
    if (!userId) {
      throw new Error("User ID is required for role check");
    }

    try {
      // Simulate role checking process
      await new Promise(resolve => setTimeout(resolve, 800));

      // Create check result
      const result = createDiagnosticResult({
        userId,
        userName: `User ${userId}`,
        userExists: true,
        isConsistent: false,
        databaseRoles: ['patient'],
        profileRole: 'therapist',
        metadataRole: 'patient',
        primaryRole: 'patient',
        errors: ['Profile role does not match database roles'],
        severity: 'medium',
        issue: 'Role inconsistency detected',
        suggestedFixes: ['Update profile to match database roles', 'Synchronize role metadata']
      });

      return result;

    } catch (error: any) {
      console.error("Error checking user roles:", error);

      return createDiagnosticResult({
        userId,
        userExists: false,
        isConsistent: false,
        databaseRoles: [],
        errors: [error.message || 'Unknown error occurred'],
        severity: 'high',
        issue: 'Error checking roles',
        suggestedFixes: ['Please contact support if this error persists']
      });
    }
  }, []);

  const repairAllInconsistentRoles = useCallback(async (userIds: string[]): Promise<RoleDiagnosticResult[]> => {
    const results: RoleDiagnosticResult[] = [];

    for (const userId of userIds) {
      try {
        const result = await repairUserRoles(userId);
        results.push(result);
      } catch (error) {
        console.error(`Error repairing roles for user ${userId}:`, error);
        results.push(createDiagnosticResult({
          userId,
          userExists: false,
          isConsistent: false,
          databaseRoles: [],
          errors: ['Failed to repair user roles'],
          severity: 'high',
          issue: 'Bulk repair failed for this user'
        }));
      }
    }

    return results;
  }, [repairUserRoles]);

  // Add compatibility aliases
  const repairRoles = repairUserRoles;
  const checkRoleConsistency = checkUserRoles;
  const isLoading = isRepairing;

  return {
    isRepairing,
    isLoading, // Add alias
    lastRepairResult,
    repairUserRoles,
    repairRoles, // Add alias
    checkUserRoles,
    checkRoleConsistency, // Add alias
    repairAllInconsistentRoles
  };
};

export default useRoleRepair;
