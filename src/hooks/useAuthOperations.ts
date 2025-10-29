
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { signInWithRoleSync, signUpWithRole, signOutUser } from "@/services/auth/auth-core";
import { checkTherapistApprovalStatus } from "@/services/auth/therapist-approval";

export const useAuthOperations = () => {
  const { toast } = useToast();
  const [isCheckingApproval, setIsCheckingApproval] = useState(false);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithRoleSync(email, password);
      if (!result.success) throw result.error;
      
      // OPTIMIZATION: Check therapist approval status with cache
      if (result.user && result.roles?.includes('therapist')) {
        // Check if we verified approval recently (within last 24 hours)
        const cacheKey = `approval_check_${result.user.id}`;
        const cachedCheck = localStorage.getItem(cacheKey);
        const now = Date.now();
        const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
        
        let shouldCheck = true;
        if (cachedCheck) {
          try {
            const cachedData = JSON.parse(cachedCheck);
            const timeSinceCheck = now - cachedData.timestamp;
            
            // If checked recently and was approved, skip check
            if (timeSinceCheck < CACHE_DURATION && cachedData.approved === true) {
              shouldCheck = false;
              console.log('[Auth] Using cached approval status (approved)');
            }
          } catch (e) {
            // Invalid cache, will check again
            localStorage.removeItem(cacheKey);
          }
        }
        
        if (shouldCheck) {
          setIsCheckingApproval(true);
          try {
            const { approved, status } = await checkTherapistApprovalStatus(result.user.id);
            
            if (!approved && status === 'pending') {
              toast({
                title: "Access Restricted",
                description: "Your therapist account is pending approval by an administrator.",
                variant: "destructive",
              });
              await signOutUser();
              throw new Error("Therapist account pending approval");
            } else if (!approved && status === 'rejected') {
              toast({
                title: "Access Denied",
                description: "Your therapist application has been rejected. Please contact support for more information.",
                variant: "destructive",
              });
              await signOutUser();
              throw new Error("Therapist account rejected");
            } else if (approved) {
              // Cache the approval status
              localStorage.setItem(cacheKey, JSON.stringify({
                approved: true,
                timestamp: now
              }));
              console.log('[Auth] Therapist approval verified and cached');
            }
          } finally {
            setIsCheckingApproval(false);
          }
        }
      }
      
      return result;
    } catch (error: any) {
      console.error("[useAuthOperations] Sign in error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Failed to sign in. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string, accountType: string) => {
    try {
      console.log("[useAuthOperations] Starting sign up:", { email, accountType });
      
      // Ensure we're using the core signUpWithRole function that handles role setup
      const result = await signUpWithRole(email, password, name, accountType);
      
      if (!result.success) throw result.error;
      
      toast({
        title: "Registration Successful",
        description: accountType === 'therapist' 
          ? "Your registration has been submitted for approval by an administrator."
          : "Please check your email to confirm your account.",
      });
      
      // Return the same structure expected by the existing code
      return {
        data: {
          user: result.userId ? { id: result.userId } : null,
          session: null
        },
        error: null
      };
    } catch (error: any) {
      console.error("[useAuthOperations] Sign up error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log("[useAuthOperations] Starting sign out");
      const { error } = await signOutUser();
      if (error) throw error;
      console.log("[useAuthOperations] Sign out successful");
    } catch (error: any) {
      console.error("[useAuthOperations] Sign out error:", error);
      toast({
        title: "Sign out failed",
        description: error.message || "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const checkTherapistApproval = async (userId: string) => {
    setIsCheckingApproval(true);
    try {
      return await checkTherapistApprovalStatus(userId);
    } finally {
      setIsCheckingApproval(false);
    }
  };

  return {
    signIn,
    signUp,
    signOut,
    checkTherapistApproval,
    isCheckingApproval
  };
};
