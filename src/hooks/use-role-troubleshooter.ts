import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { RoleDiagnosticResult } from "@/types/core/rbac";
import { createDiagnosticResult } from "@/utils/rbac/diagnostic-helpers";

// Define the hook return type explicitly
interface RoleTroubleshooterResult {
  userIdOrEmail: string;
  searchBy: "userId" | "email";
  isLoading: boolean;
  result: RoleDiagnosticResult | null;
  repairInProgress: boolean;
  setUserIdOrEmail: (value: string) => void;
  setSearchBy: (value: "userId" | "email") => void;
  checkUser: () => Promise<void>;
  repairUser: () => Promise<void>;
  resetResult: () => void;
}

export const useRoleTroubleshooter = (): RoleTroubleshooterResult => {
  const [userIdOrEmail, setUserIdOrEmail] = useState<string>("");
  const [searchBy, setSearchBy] = useState<"userId" | "email">("userId");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<RoleDiagnosticResult | null>(null);
  const [repairInProgress, setRepairInProgress] = useState<boolean>(false);
  const { toast } = useToast();

  // Function to check user role consistency
  const checkUser = useCallback(async () => {
    if (!userIdOrEmail) {
      toast({
        title: "Validation Error",
        description: "Please enter a user ID or email",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      // Simulate checking process
      await new Promise(resolve => setTimeout(resolve, 1000));

      const diagnosticResult = createDiagnosticResult({
        userId: userIdOrEmail,
        userName: "User Name",
        userEmail: searchBy === 'email' ? userIdOrEmail : `${userIdOrEmail}@example.com`,
        userExists: true,
        isConsistent: false,
        databaseRoles: ["patient"],
        profileRole: "patient",
        metadataRole: null,
        primaryRole: "patient",
        errors: [],
        severity: 'medium',
        issue: 'Role inconsistency detected',
        suggestedFixes: ['Update profile to match database roles']
      });

      setResult(diagnosticResult);
    } catch (error) {
      console.error("Error checking user:", error);
      toast({
        title: "Error",
        description: "Failed to check user role consistency",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [userIdOrEmail, searchBy, toast]);

  // Function to repair user role inconsistency
  const repairUser = useCallback(async () => {
    if (!result?.userId) {
      toast({
        title: "Error",
        description: "No user selected for repair",
        variant: "destructive",
      });
      return;
    }

    setRepairInProgress(true);

    try {
      // Simulate repair process
      await new Promise(resolve => setTimeout(resolve, 1500));

      setResult((prev) =>
        prev
          ? createDiagnosticResult({
              ...prev,
              userExists: true,
              isConsistent: true,
              repaired: true,
              errors: [],
              issue: 'All role data is consistent',
              severity: 'low',
              // Ensure primaryRole is of type UserRole
              primaryRole: "patient" as import('@/types/core/rbac').UserRole
            })
          : null
      );

      toast({
        title: "Success",
        description: "User roles have been repaired",
        variant: "default",
      });
    } catch (error) {
      console.error("Error repairing user:", error);
      toast({
        title: "Error",
        description: "Failed to repair user role inconsistency",
        variant: "destructive",
      });
    } finally {
      setRepairInProgress(false);
    }
  }, [result, toast]);

  // Reset the result
  const resetResult = useCallback(() => {
    setResult(null);
  }, []);

  return {
    userIdOrEmail,
    searchBy,
    isLoading,
    result,
    repairInProgress,
    setUserIdOrEmail,
    setSearchBy,
    checkUser,
    repairUser,
    resetResult,
  };
};
