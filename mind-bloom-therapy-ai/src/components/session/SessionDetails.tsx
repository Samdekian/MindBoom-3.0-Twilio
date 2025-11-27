
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Calendar, Clock, User, ArrowLeft } from "lucide-react";
import { useAppointments } from "@/hooks/use-appointments";
import { useAppointmentVideoBridge } from "@/hooks/use-appointment-video-bridge";
import VideoConference from "@/components/video-conference/VideoConference";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface SessionDetailsProps {
  sessionId: string;
}

const SessionDetails: React.FC<SessionDetailsProps> = ({ sessionId }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { appointments, fetchAppointment } = useAppointments();
  const { getVideoSessionUrl, createVideoSession, isCreatingSession } = useAppointmentVideoBridge();
  
  const [appointment, setAppointment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showVideoConference, setShowVideoConference] = useState(false);

  useEffect(() => {
    const loadAppointment = async () => {
      try {
        // First try to find appointment by video_meeting_id
        const foundAppointment = appointments?.find(apt => 
          apt.video_meeting_id === sessionId || apt.id === sessionId
        );

        if (foundAppointment) {
          setAppointment(foundAppointment);
        } else {
          // Try to fetch appointment directly
          const fetchedAppointment = await fetchAppointment(sessionId);
          setAppointment(fetchedAppointment);
        }
      } catch (error) {
        console.error('Error loading appointment:', error);
        toast({
          title: "Session Not Found",
          description: "Could not load session details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAppointment();
  }, [sessionId, appointments, fetchAppointment, toast]);

  const handleJoinVideo = async () => {
    if (!appointment) return;

    const videoUrl = getVideoSessionUrl(appointment);
    if (videoUrl) {
      setShowVideoConference(true);
    } else {
      // Create video session if it doesn't exist
      const videoSession = await createVideoSession(appointment.id);
      if (videoSession) {
        setShowVideoConference(true);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Session Not Found</CardTitle>
            <CardDescription>The requested session could not be found.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate(-1)} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showVideoConference) {
    return (
      <VideoConference
        appointmentId={appointment.id}
        appointmentDetails={{
          title: appointment.title,
          patient_id: appointment.patient_id,
          therapist_id: appointment.therapist_id,
          recording_consent: appointment.recording_consent || false,
        }}
      />
    );
  }

  const appointmentDate = new Date(appointment.start_time);
  const appointmentEndDate = new Date(appointment.end_time);
  const hasVideoSession = appointment.video_enabled && getVideoSessionUrl(appointment);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {appointment.title}
                <Badge variant={
                  appointment.status === 'confirmed' ? 'default' :
                  appointment.status === 'scheduled' ? 'secondary' :
                  appointment.status === 'completed' ? 'outline' :
                  'destructive'
                }>
                  {appointment.status}
                </Badge>
              </CardTitle>
              <CardDescription>Session ID: {sessionId}</CardDescription>
            </div>
            <Button onClick={() => navigate(-1)} variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Session Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Date</p>
                <p className="text-sm text-muted-foreground">
                  {format(appointmentDate, 'PPP')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Time</p>
                <p className="text-sm text-muted-foreground">
                  {format(appointmentDate, 'p')} - {format(appointmentEndDate, 'p')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Type</p>
                <p className="text-sm text-muted-foreground">
                  {appointment.appointment_type || 'Video Session'}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          {appointment.description && (
            <div>
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-sm text-muted-foreground">{appointment.description}</p>
            </div>
          )}

          {/* Video Session Actions */}
          {appointment.video_enabled && (
            <div className="border-t pt-6">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <Video className="h-5 w-5" />
                Video Session
              </h3>
              
              <div className="flex items-center gap-4">
                <Button 
                  onClick={handleJoinVideo}
                  disabled={isCreatingSession}
                  size="lg"
                >
                  {isCreatingSession ? (
                    <>Loading...</>
                  ) : hasVideoSession ? (
                    <>
                      <Video className="h-4 w-4 mr-2" />
                      Join Video Session
                    </>
                  ) : (
                    <>
                      <Video className="h-4 w-4 mr-2" />
                      Start Video Session
                    </>
                  )}
                </Button>
                
                {hasVideoSession && (
                  <p className="text-sm text-muted-foreground">
                    Video session is ready to join
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionDetails;
