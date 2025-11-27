import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Phone, Mail, MessageSquare, User, AlertTriangle, Video, FileText } from "lucide-react";
import { OptimizedAppointmentData } from "@/utils/optimized-appointment-utils";
import { formatInUserTimeZone } from "@/utils/timezone";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { useNavigate } from "react-router-dom";
import { getSessionUrl, getSessionStatus } from "@/utils/session-navigation";

interface AppointmentDetailsModalProps {
  appointment: OptimizedAppointmentData | null;
  isOpen: boolean;
  onClose: () => void;
  timeZone?: string;
  userRole?: 'patient' | 'therapist';
}

const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  appointment,
  isOpen,
  onClose,
  timeZone,
  userRole
}) => {
  const { user } = useAuthRBAC();
  const navigate = useNavigate();

  if (!appointment) {
    return null;
  }

  const isTherapist = userRole === 'therapist';
  const isPatient = userRole === 'patient';

  // Use the correct properties from OptimizedAppointmentData
  const otherParticipantName = isTherapist ? appointment.patient_name : appointment.therapist_name;
  const otherParticipantPhone = isTherapist ? appointment.patient_phone : appointment.therapist_phone;
  const otherParticipantEmail = isTherapist ? appointment.patient_email : appointment.therapist_email;

  const formattedStartTime = timeZone ? formatInUserTimeZone(appointment.start_time, timeZone, 'EEEE, MMMM d, yyyy h:mm a zzz') : new Date(appointment.start_time).toLocaleString();
  const formattedEndTime = timeZone ? formatInUserTimeZone(appointment.end_time, timeZone, 'h:mm a zzz') : new Date(appointment.end_time).toLocaleString();

  // Session status (but always allow joining)
  const sessionStatus = getSessionStatus(appointment.start_time, appointment.end_time);

  const handleJoinSession = () => {
    const sessionUrl = getSessionUrl(appointment.id);
    navigate(sessionUrl);
    onClose();
  };

  const handleSendMessage = () => {
    // TODO: Implement messaging functionality
    console.log('Send message to:', otherParticipantName);
  };

  const getJoinButtonText = () => {
    switch (sessionStatus) {
      case 'ready':
        return 'Join Session';
      case 'active':
        return 'Join Session';
      case 'soon':
        return 'Join Session';
      case 'ended':
        return 'Join Session';
      default:
        return 'Join Session';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {appointment.title || 'Session Details'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appointment Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formattedStartTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{formattedEndTime}</span>
              </div>
              {appointment.description && (
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 mt-0.5" />
                  <span>{appointment.description}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Participant Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{otherParticipantName || 'Participant'}</span>
              </div>
              {otherParticipantPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${otherParticipantPhone}`}>{otherParticipantPhone}</a>
                </div>
              )}
              {otherParticipantEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${otherParticipantEmail}`}>{otherParticipantEmail}</a>
                </div>
              )}
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <Button variant="link" size="sm" onClick={handleSendMessage}>Send Message</Button>
              </div>
            </CardContent>
          </Card>

          {appointment.video_enabled && appointment.video_url && (
            <Card>
              <CardHeader>
                <CardTitle>Video Session Details</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  <span>Video Session Enabled</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-yellow-500">
                    Please ensure your camera and microphone are working before joining.
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Session Actions Footer - Always show join button */}
          {appointment.video_enabled && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {sessionStatus === 'ready' && "Ready to join"}
                {sessionStatus === 'soon' && "Session starts soon"}
                {sessionStatus === 'active' && "Session in progress"}
                {sessionStatus === 'ended' && "Session has ended"}
                {sessionStatus === 'scheduled' && "Session scheduled"}
              </div>
              
              <Button variant="therapy" onClick={handleJoinSession} className="ml-4">
                <Video className="h-4 w-4 mr-2" />
                {getJoinButtonText()}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDetailsModal;
