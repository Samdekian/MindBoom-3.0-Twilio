
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video, User, Phone, Mail } from "lucide-react";
import { OptimizedAppointmentData, generateOptimizedAppointmentTitle, getOptimizedOtherParticipantName } from "@/utils/optimized-appointment-utils";
import { formatInUserTimeZone } from "@/utils/timezone";
import { useNavigate } from "react-router-dom";
import { getSessionUrl, getSessionStatus } from "@/utils/session-navigation";
import AppointmentDetailsModal from "./AppointmentDetailsModal";

interface SessionStatusCardProps {
  appointment: OptimizedAppointmentData;
  userRole: 'patient' | 'therapist';
  variant?: 'compact' | 'full';
  timeZone?: string;
}

const SessionStatusCard: React.FC<SessionStatusCardProps> = ({
  appointment,
  userRole,
  variant = 'full',
  timeZone
}) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  // Generate dynamic title and participant info
  const displayTitle = generateOptimizedAppointmentTitle(appointment, userRole);
  const otherParticipantName = getOptimizedOtherParticipantName(appointment, userRole);

  // Format appointment times
  const startTime = new Date(appointment.start_time);
  const endTime = new Date(appointment.end_time);
  
  const formattedDate = timeZone 
    ? formatInUserTimeZone(startTime, timeZone, 'MMM d, yyyy')
    : startTime.toLocaleDateString();
    
  const formattedTime = timeZone 
    ? formatInUserTimeZone(startTime, timeZone, 'h:mm a')
    : startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
  const formattedEndTime = timeZone 
    ? formatInUserTimeZone(endTime, timeZone, 'h:mm a')
    : endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Determine session status and actions
  const sessionStatus = getSessionStatus(appointment.start_time, appointment.end_time);
  
  const handleJoinSession = () => {
    const sessionUrl = getSessionUrl(appointment.id);
    navigate(sessionUrl);
  };

  const handleViewDetails = () => {
    setShowModal(true);
  };

  const getStatusBadge = () => {
    switch (sessionStatus) {
      case 'ready':
        return <Badge variant="success">Ready</Badge>;
      case 'active':
        return <Badge variant="therapy">Active</Badge>;
      case 'soon':
        return <Badge variant="warning">Starting Soon</Badge>;
      case 'ended':
        return <Badge variant="outline">Ended</Badge>;
      default:
        return <Badge variant="secondary">Scheduled</Badge>;
    }
  };

  const getJoinButtonText = () => {
    switch (sessionStatus) {
      case 'ready':
        return 'Join Now';
      case 'active':
        return 'Join Session';
      case 'soon':
        return 'Join Session';
      case 'ended':
        return 'View Details';
      default:
        return 'View Details';
    }
  };

  if (variant === 'compact') {
    return (
      <>
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleViewDetails}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-sm mb-1">{displayTitle}</h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{formattedDate}</span>
                  <Clock className="h-3 w-3 ml-2" />
                  <span>{formattedTime}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge()}
                {appointment.video_enabled && (sessionStatus === 'ready' || sessionStatus === 'active' || sessionStatus === 'soon') && (
                  <Button 
                    size="sm" 
                    variant="therapy"
                    onClick={(e) => { e.stopPropagation(); handleJoinSession(); }}
                  >
                    <Video className="h-3 w-3 mr-1" />
                    Join
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <AppointmentDetailsModal
          appointment={appointment}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          timeZone={timeZone}
          userRole={userRole}
        />
      </>
    );
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">{displayTitle}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formattedTime} - {formattedEndTime}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm">{otherParticipantName}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {getStatusBadge()}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={handleViewDetails}>
              View Details
            </Button>
            
            {appointment.video_enabled && (sessionStatus === 'ready' || sessionStatus === 'active' || sessionStatus === 'soon') && (
              <Button variant="therapy" onClick={handleJoinSession}>
                <Video className="h-4 w-4 mr-2" />
                {getJoinButtonText()}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <AppointmentDetailsModal
        appointment={appointment}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        timeZone={timeZone}
        userRole={userRole}
      />
    </>
  );
};

export default SessionStatusCard;
