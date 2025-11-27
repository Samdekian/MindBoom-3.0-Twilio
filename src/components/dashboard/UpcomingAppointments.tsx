import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { CalendarPlus, Calendar } from "lucide-react";
import SimplifiedBookingFlow from "../booking/SimplifiedBookingFlow";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useOptimizedUpcomingAppointments } from "@/hooks/useOptimizedUpcomingAppointments";
import SessionStatusCard from "../session/SessionStatusCard";

const UpcomingAppointments = () => {
  const { t } = useLanguage();
  const { primaryRole } = useAuthRBAC();
  const [isSchedulingOpen, setIsSchedulingOpen] = React.useState(false);
  
  // Determine user role and use the optimized hook
  const userRole = primaryRole === 'therapist' ? 'therapist' : 'patient';
  const { data: optimizedAppointments, isLoading, error } = useOptimizedUpcomingAppointments(userRole);

  // Use optimized appointments directly (no conversion needed)
  const appointments = optimizedAppointments || [];

  if (error) {
    console.error('[UpcomingAppointments] Error loading appointments:', error);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div>
          <CardTitle>{t("upcomingAppointments") || "Upcoming Sessions"}</CardTitle>
          <CardDescription>Your scheduled therapy sessions with quick access</CardDescription>
        </div>
        <Dialog open={isSchedulingOpen} onOpenChange={setIsSchedulingOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <CalendarPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Book Session</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Schedule an Appointment</DialogTitle>
              <DialogDescription>
                Choose a convenient time for your therapy session
              </DialogDescription>
            </DialogHeader>
            <SimplifiedBookingFlow />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading appointments...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-red-400" />
            <h3 className="text-lg font-medium mb-2 text-red-600">Failed to Load Sessions</h3>
            <p className="text-sm text-red-500 mb-4">
              There was an error loading your appointments. Please try refreshing the page.
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Refresh Page
            </Button>
          </div>
        ) : appointments && appointments.length > 0 ? (
          <div className="space-y-3">
            {appointments.slice(0, 3).map((appointment) => (
              <SessionStatusCard
                key={appointment.id}
                appointment={appointment}
                userRole={userRole}
                variant="compact"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Sessions Scheduled</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Book your first therapy session to get started.
            </p>
            <Button onClick={() => setIsSchedulingOpen(true)}>
              <CalendarPlus className="h-4 w-4 mr-2" />
              Schedule Session
            </Button>
          </div>
        )}
      </CardContent>
      {appointments && appointments.length > 3 && (
        <CardFooter>
          <Button variant="ghost" size="sm" className="w-full">
            View All Sessions ({appointments.length})
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default UpcomingAppointments;
