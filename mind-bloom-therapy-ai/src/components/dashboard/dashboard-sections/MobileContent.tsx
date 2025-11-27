
import React from "react";
import UpcomingAppointments from "@/components/dashboard/UpcomingAppointments";
import AppointmentBooking from "@/components/dashboard/AppointmentBooking";
import ProgressMetrics from "@/components/dashboard/ProgressMetrics";
import MoodTracker from "@/components/dashboard/MoodTracker";
import QuickActions from "@/components/dashboard/QuickActions";
import ResourcesWidget from "@/components/dashboard/ResourcesWidget";
import TherapistAvailability from "@/components/dashboard/TherapistAvailability";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LoadingState } from "@/components/ui/loading-state";

interface MobileContentProps {
  isTherapist?: boolean;
  isAdmin?: boolean;
  className?: string;
  showWelcomeCard?: boolean;
}

const MobileContent: React.FC<MobileContentProps> = ({ 
  isTherapist: externalIsTherapist, 
  isAdmin: externalIsAdmin,
  className,
  showWelcomeCard = false
}) => {
  const { hasRole, loading, user } = useAuthRBAC();
  
  // Use provided role props if defined, otherwise detect from RBAC context
  const isAdmin = externalIsAdmin !== undefined ? externalIsAdmin : hasRole('admin');
  const isTherapist = externalIsTherapist !== undefined ? externalIsTherapist : hasRole('therapist');
  
  const name = user?.user_metadata?.name || "User";

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <LoadingState variant="skeleton" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {showWelcomeCard && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">
              {isAdmin 
                ? `Welcome Administrator, ${name}!` 
                : isTherapist 
                  ? `Welcome Therapist, ${name}!` 
                  : `Welcome, ${name}!`}
            </CardTitle>
            <CardDescription>
              {isAdmin 
                ? "Manage users, therapist approvals, and system settings" 
                : isTherapist 
                  ? "Manage your appointments and patient sessions" 
                  : "Schedule sessions and track your therapy progress"}
            </CardDescription>
          </CardHeader>
        </Card>
      )}
      
      <UpcomingAppointments />
      
      {!isTherapist && !isAdmin && (
        <>
          <AppointmentBooking />
          <ProgressMetrics />
          <MoodTracker />
        </>
      )}
      
      {isTherapist && (
        <TherapistAvailability />
      )}
      
      <QuickActions />
      <ResourcesWidget />
    </div>
  );
};

export default MobileContent;
