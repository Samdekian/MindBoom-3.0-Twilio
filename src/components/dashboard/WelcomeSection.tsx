
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { useMigrationTracking } from "@/utils/migration/migration-helpers";

/**
 * WelcomeSection Component
 * 
 * Provides a personalized welcome message and dashboard introduction
 * based on the user's role (admin, therapist, or patient).
 * 
 * This component adapts its content to provide role-specific guidance
 * and sets the tone for the dashboard experience.
 */
const WelcomeSection = () => {
  const { user, hasRole } = useAuthRBAC();
  
  // Track migration
  useMigrationTracking('WelcomeSection', 'useAuthRBAC');
  
  const name = user?.user_metadata?.name || "User";
  
  // Prioritize RBAC roles over metadata
  const getAccountTypeFromRoles = () => {
    if (hasRole('admin')) return "admin";
    if (hasRole('therapist')) return "therapist";
    if (hasRole('support')) return "support";
    return "patient"; // Default
  };
  
  const accountType = getAccountTypeFromRoles();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">
          {accountType === "admin" ? `Welcome Administrator, ${name}!` :
           accountType === "therapist" ? `Welcome Therapist, ${name}!` : 
           `Welcome, ${name}!`}
        </CardTitle>
        <CardDescription>
          {accountType === "admin" 
            ? "Manage users, therapist approvals, and system settings" 
            : accountType === "therapist" 
              ? "Manage your appointments and patient sessions" 
              : "Schedule sessions and track your therapy progress"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="prose dark:prose-invert">
          {accountType === "admin" ? (
            <p>
              You have administrative access to the system. You can manage users, approve therapists, and configure system settings.
              Navigate to the Admin Dashboard for full administrative controls.
            </p>
          ) : accountType === "therapist" ? (
            <p>
              Welcome to your therapist dashboard. Here you can manage your patients, set your availability,
              and keep track of your upcoming sessions. For detailed availability management, visit the 
              Availability tab or go to the dedicated Therapist Dashboard for comprehensive practice management tools.
            </p>
          ) : (
            <p>
              This is your patient dashboard where you can book new therapy sessions, track your progress, and manage your
              appointments. Use the tabs above to navigate between different sections of your dashboard.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WelcomeSection;
