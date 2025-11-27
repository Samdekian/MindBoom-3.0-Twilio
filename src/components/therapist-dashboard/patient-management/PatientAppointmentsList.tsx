
import React from "react";
import { Button } from "@/components/ui/button";
import { usePatientAppointments } from "@/hooks/use-patient-appointments";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Calendar, Video, FileCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PatientAppointmentsListProps {
  patientId: string;
  isLoading: boolean;
}

const PatientAppointmentsList: React.FC<PatientAppointmentsListProps> = ({
  patientId,
  isLoading
}) => {
  const { appointments } = usePatientAppointments(patientId);
  const navigate = useNavigate();
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "scheduled":
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Scheduled</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const handleJoinSession = (appointmentId: string) => {
    navigate(`/video-session/${appointmentId}`);
  };
  
  const handleViewNotes = (appointmentId: string) => {
    navigate(`/session/${appointmentId}/notes`);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-6">
        <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">No Sessions</h3>
        <p className="text-sm text-muted-foreground mb-4">
          There are no sessions scheduled with this patient.
        </p>
        <Button>Schedule Session</Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {appointments.map((appointment) => {
        const isUpcoming = new Date(appointment.startTime) > new Date();
        const isPast = !isUpcoming;
        
        return (
          <div
            key={appointment.id}
            className="border rounded-md p-3 flex justify-between items-center"
          >
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {format(new Date(appointment.startTime), "EEEE, MMMM d, yyyy")}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">
                  {format(new Date(appointment.startTime), "h:mm a")} - {format(new Date(appointment.endTime), "h:mm a")}
                </span>
                <span className="mx-1">•</span>
                {getStatusBadge(appointment.status)}
              </div>
            </div>
            
            <div className="flex gap-2">
              {isPast && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewNotes(appointment.id)}
                >
                  <FileCheck className="h-4 w-4 mr-2" /> Notes
                </Button>
              )}
              {isUpcoming && appointment.status === "scheduled" && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleJoinSession(appointment.id)}
                >
                  <Video className="h-4 w-4 mr-2" /> Join
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PatientAppointmentsList;
