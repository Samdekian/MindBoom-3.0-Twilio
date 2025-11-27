import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { useOptimizedUpcomingAppointments } from "@/hooks/useOptimizedUpcomingAppointments";
import EditAppointmentModal from "./EditAppointmentModal";
import SessionStatusCard from "../session/SessionStatusCard";

const UpcomingAppointments = () => {
  const navigate = useNavigate();
  const { primaryRole } = useAuthRBAC();
  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  
  // Use consistent role determination
  const userRole = 'patient' as const; // Patient component always shows patient view
  const { data: optimizedAppointments, isLoading, error } = useOptimizedUpcomingAppointments(userRole);

  // Use optimized appointments directly - no conversion needed
  const appointments = optimizedAppointments || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Upcoming Sessions
          </CardTitle>
          <CardDescription>Your scheduled therapy sessions with quick access</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading appointments...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error('[Patient UpcomingAppointments] Error loading appointments:', error);
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Upcoming Sessions
          </CardTitle>
          <CardDescription>Your scheduled therapy sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-3">Unable to load sessions</p>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Upcoming Sessions
          </CardTitle>
          <CardDescription>Your scheduled therapy sessions with one-click access</CardDescription>
        </CardHeader>
        <CardContent>
          {appointments && appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.slice(0, 3).map((appointment) => (
                <SessionStatusCard
                  key={appointment.id}
                  appointment={appointment}
                  userRole={userRole}
                  variant="full"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No upcoming sessions</p>
              <Button onClick={() => navigate("/book-therapist")}>
                Schedule Your First Session
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {editingAppointment && (
        <EditAppointmentModal
          isOpen={!!editingAppointment}
          onClose={() => setEditingAppointment(null)}
          appointment={editingAppointment}
        />
      )}
    </>
  );
};

export default UpcomingAppointments;
