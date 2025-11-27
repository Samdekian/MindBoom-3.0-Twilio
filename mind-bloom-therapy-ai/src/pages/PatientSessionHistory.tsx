
import React from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, AlertTriangle } from "lucide-react";
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useSessionHistory } from '@/hooks/use-session-history';
import { format } from 'date-fns';

const PatientSessionHistory = () => {
  const { user, primaryRole } = useAuthRBAC();
  const { sessions, isLoading, error } = useSessionHistory();

  const formatSessionTime = (startTime: string, endTime: string) => {
    const start = format(new Date(startTime), 'h:mm a');
    const end = format(new Date(endTime), 'h:mm a');
    return `${start} - ${end}`;
  };

  const formatSessionDate = (dateString: string) => {
    return format(new Date(dateString), 'MMMM d, yyyy');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'scheduled':
        return 'bg-blue-500';
      case 'confirmed':
        return 'bg-blue-600';
      case 'cancelled':
        return 'bg-red-500';
      case 'no-show':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Helmet>
          <title>Session History | Therapy Platform</title>
        </Helmet>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Session History</h1>
            <p className="text-muted-foreground">Loading your therapy sessions...</p>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Helmet>
          <title>Session History | Therapy Platform</title>
        </Helmet>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Session History</h1>
            <p className="text-muted-foreground">Unable to load session history</p>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
              <h3 className="text-xl font-semibold mb-2">Error Loading Sessions</h3>
              <p className="text-muted-foreground text-center">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Helmet>
        <title>Session History | Therapy Platform</title>
      </Helmet>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Session History</h1>
          <p className="text-muted-foreground">
            View your past and upcoming therapy sessions
          </p>
        </div>

        <div className="grid gap-4">
          {sessions.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{session.appointment_type || 'Therapy Session'}</CardTitle>
                  <Badge className={`${getStatusColor(session.status)} text-white`}>
                    {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatSessionDate(session.start_time)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatSessionTime(session.start_time, session.end_time)}</span>
                  </div>
                  {primaryRole === 'patient' && session.therapist_name && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{session.therapist_name}</span>
                    </div>
                  )}
                  {primaryRole === 'therapist' && session.patient_name && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{session.patient_name}</span>
                    </div>
                  )}
                  {session.session_notes && (
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">Session Notes:</p>
                      <p className="text-sm text-muted-foreground mt-1">{session.session_notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {sessions.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Sessions Yet</h3>
              <p className="text-muted-foreground text-center">
                Your therapy sessions will appear here once you book your first appointment.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PatientSessionHistory;
