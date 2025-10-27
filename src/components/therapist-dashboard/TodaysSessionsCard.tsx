import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { useOptimizedUpcomingAppointments } from "@/hooks/useOptimizedUpcomingAppointments";
import SessionStatusCard from "@/components/session/SessionStatusCard";

const TodaysSessionsCard = () => {
  const { primaryRole } = useAuthRBAC();
  
  // Use the optimized hook
  const { data: optimizedAppointments, isLoading, error } = useOptimizedUpcomingAppointments('therapist');

  // Use optimized appointments directly (no conversion needed)
  const appointments = optimizedAppointments || [];

  // Determine user role based on auth context
  const userRole = primaryRole === 'therapist' ? 'therapist' : 'patient';

  // Show all upcoming appointments, not just today's
  const upcomingSessionsFiltered = appointments?.filter(appointment => {
    const appointmentDate = new Date(appointment.start_time);
    const now = new Date();
    return appointmentDate >= now; // Show all future sessions
  }) || [];

  if (error) {
    console.error('[TodaysSessionsCard] Error loading appointments:', error);
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Upcoming Sessions
          </CardTitle>
          <CardDescription>Your scheduled therapy sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600 mb-2">Failed to load sessions</p>
            <p className="text-sm text-red-500">Please refresh the page to try again</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Upcoming Sessions
          </CardTitle>
          <CardDescription>Your scheduled therapy sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading sessions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          Upcoming Sessions
          {upcomingSessionsFiltered.length > 0 && (
            <Badge variant="secondary">{upcomingSessionsFiltered.length}</Badge>
          )}
        </CardTitle>
        <CardDescription>Quick access to your upcoming sessions with one-click join</CardDescription>
      </CardHeader>
      <CardContent>
        {upcomingSessionsFiltered.length > 0 ? (
          <div className="space-y-3">
            {upcomingSessionsFiltered.slice(0, 5).map((appointment) => (
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
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No upcoming sessions scheduled</p>
            <p className="text-sm text-gray-500">Your schedule is clear</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TodaysSessionsCard;
