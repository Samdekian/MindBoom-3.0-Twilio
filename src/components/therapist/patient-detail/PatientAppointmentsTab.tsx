import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Video, Phone, AlertTriangle } from 'lucide-react';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { usePatientAppointments } from '@/hooks/use-patient-appointments';
import { format } from 'date-fns';

interface PatientAppointmentsTabProps {
  patientId: string;
}

const PatientAppointmentsTab: React.FC<PatientAppointmentsTabProps> = ({ patientId }) => {
  const { user } = useAuthRBAC();
  const { appointments, isLoading } = usePatientAppointments(patientId);

  const formatAppointmentDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const formatAppointmentTime = (dateString: string) => {
    return format(new Date(dateString), 'h:mm a');
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'default';
      case 'scheduled':
        return 'secondary';
      case 'completed':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Patient Appointments</CardTitle>
          <CardDescription>Loading appointments...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Appointments</CardTitle>
        <CardDescription>Manage and view upcoming appointments for this patient.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {appointments.length > 0 ? (
          appointments.map((appointment) => (
            <div key={appointment.id} className="border rounded-md p-4">
              <div className="flex justify-between items-center">
                <div className="font-semibold">{appointment.title}</div>
                <Badge variant={getStatusVariant(appointment.status)}>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                <Calendar className="inline-block h-4 w-4 mr-1" />
                {formatAppointmentDate(appointment.startTime)}
              </div>
              <div className="text-sm text-muted-foreground">
                <Clock className="inline-block h-4 w-4 mr-1" />
                {formatAppointmentTime(appointment.startTime)} - {formatAppointmentTime(appointment.endTime)}
              </div>
              <div className="text-sm text-muted-foreground">
                {appointment.videoUrl ? (
                  <>
                    <Video className="inline-block h-4 w-4 mr-1" />
                    Video Call
                  </>
                ) : (
                  <>
                    <Phone className="inline-block h-4 w-4 mr-1" />
                    In-Person/Phone
                  </>
                )}
              </div>
              <div className="mt-2 flex justify-end space-x-2">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
                {appointment.status === 'scheduled' && (
                  <Button size="sm">Join Session</Button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No appointments found for this patient</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientAppointmentsTab;
