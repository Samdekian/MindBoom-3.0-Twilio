
import React from 'react';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, Loader2 } from 'lucide-react';
import { useAppointmentVideoBridge } from '@/hooks/use-appointment-video-bridge';
import { Appointment } from '@/types/appointments';

interface VideoSessionButtonProps {
  appointment: Appointment;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

const VideoSessionButton: React.FC<VideoSessionButtonProps> = ({
  appointment,
  variant = 'default',
  size = 'default',
  className
}) => {
  const { 
    createVideoSession, 
    getVideoSessionUrl, 
    joinVideoSession, 
    isCreatingSession 
  } = useAppointmentVideoBridge();

  const existingVideoUrl = getVideoSessionUrl(appointment);
  const canJoinSession = appointment.video_enabled && existingVideoUrl;
  const needsVideoSession = appointment.video_enabled && !existingVideoUrl;

  const handleClick = async () => {
    if (canJoinSession) {
      joinVideoSession(appointment);
    } else if (needsVideoSession) {
      await createVideoSession(appointment.id);
    }
  };

  if (!appointment.video_enabled) {
    return (
      <Button variant="outline" size={size} disabled className={className}>
        <VideoOff className="h-4 w-4 mr-2" />
        No Video
      </Button>
    );
  }

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleClick}
      disabled={isCreatingSession}
      className={className}
    >
      {isCreatingSession ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Setting Up...
        </>
      ) : canJoinSession ? (
        <>
          <Video className="h-4 w-4 mr-2" />
          Join Session
        </>
      ) : (
        <>
          <Video className="h-4 w-4 mr-2" />
          Start Video
        </>
      )}
    </Button>
  );
};

export default VideoSessionButton;
