
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  Monitor,
  MonitorOff,
  Square,
  StopCircle,
  MessageSquare,
  MoreHorizontal
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useHapticFeedback } from '@/hooks/video-conference/use-haptic-feedback';

interface FloatingControlsProps {
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  isRecording: boolean;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onToggleScreenShare: () => void;
  onToggleRecording: () => void;
  onToggleChat: () => void;
  onLeaveSession: () => void;
  autoHide?: boolean;
  className?: string;
}

const FloatingControls: React.FC<FloatingControlsProps> = ({
  isVideoEnabled,
  isAudioEnabled,
  isScreenSharing,
  isRecording,
  onToggleVideo,
  onToggleAudio,
  onToggleScreenShare,
  onToggleRecording,
  onToggleChat,
  onLeaveSession,
  autoHide = true,
  className
}) => {
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const { vibrate } = useHapticFeedback();

  // Auto-hide functionality
  useEffect(() => {
    if (!autoHide) return;

    let timeout: NodeJS.Timeout;

    const resetTimeout = () => {
      clearTimeout(timeout);
      setIsVisible(true);
      timeout = setTimeout(() => setIsVisible(false), 3000);
    };

    const handleActivity = () => resetTimeout();

    // Show controls on any interaction
    document.addEventListener('mousemove', handleActivity);
    document.addEventListener('touchstart', handleActivity);
    document.addEventListener('keydown', handleActivity);

    resetTimeout();

    return () => {
      clearTimeout(timeout);
      document.removeEventListener('mousemove', handleActivity);
      document.removeEventListener('touchstart', handleActivity);
      document.removeEventListener('keydown', handleActivity);
    };
  }, [autoHide]);

  // Enhanced control handlers with haptic feedback
  const handleToggleVideo = () => {
    vibrate('medium');
    onToggleVideo();
  };

  const handleToggleAudio = () => {
    vibrate('light');
    onToggleAudio();
  };

  const handleToggleScreenShare = () => {
    vibrate('medium');
    onToggleScreenShare();
  };

  const handleToggleRecording = () => {
    vibrate(isRecording ? 'warning' : 'success');
    onToggleRecording();
  };

  const handleToggleChat = () => {
    vibrate('light');
    onToggleChat();
  };

  const handleLeaveSession = () => {
    vibrate('error');
    onLeaveSession();
  };

  // Primary controls (always visible)
  const primaryControls = [
    {
      icon: isAudioEnabled ? Mic : MicOff,
      onClick: handleToggleAudio,
      active: isAudioEnabled,
      critical: !isAudioEnabled,
      label: isAudioEnabled ? 'Mute' : 'Unmute'
    },
    {
      icon: Phone,
      onClick: handleLeaveSession,
      active: false,
      critical: true,
      label: 'End Call',
      variant: 'destructive' as const
    },
    {
      icon: isVideoEnabled ? Video : VideoOff,
      onClick: handleToggleVideo,
      active: isVideoEnabled,
      critical: !isVideoEnabled,
      label: isVideoEnabled ? 'Turn off camera' : 'Turn on camera'
    }
  ];

  // Secondary controls (shown in more menu on mobile)
  const secondaryControls = [
    {
      icon: isScreenSharing ? MonitorOff : Monitor,
      onClick: handleToggleScreenShare,
      active: isScreenSharing,
      label: isScreenSharing ? 'Stop sharing' : 'Share screen'
    },
    {
      icon: isRecording ? StopCircle : Square,
      onClick: handleToggleRecording,
      active: isRecording,
      label: isRecording ? 'Stop recording' : 'Start recording'
    },
    {
      icon: MessageSquare,
      onClick: handleToggleChat,
      active: false,
      label: 'Chat'
    }
  ];

  const buttonSize = isMobile ? "h-14 w-14" : "h-12 w-12";

  return (
    <div className={cn(
      "fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50",
      "transition-all duration-300 ease-in-out",
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
      className
    )}>
      <div className={cn(
        "bg-black/80 backdrop-blur-md rounded-full px-4 py-3",
        "border border-gray-700/50 shadow-2xl",
        "flex items-center gap-3",
        isMobile && "px-3 py-2"
      )}>
        {/* Primary controls */}
        {primaryControls.map((control, index) => {
          const Icon = control.icon;
          return (
            <Button
              key={index}
              variant={control.variant || (control.critical ? "destructive" : control.active ? "secondary" : "ghost")}
              size="icon"
              className={cn(
                buttonSize,
                "rounded-full border-0 text-white hover:scale-105 transition-transform",
                control.active && !control.critical && "bg-blue-600 hover:bg-blue-700",
                control.critical && "bg-red-600 hover:bg-red-700",
                !control.active && !control.critical && "bg-gray-700 hover:bg-gray-600"
              )}
              onClick={control.onClick}
              aria-label={control.label}
            >
              <Icon className={cn(
                isMobile ? "h-6 w-6" : "h-5 w-5"
              )} />
            </Button>
          );
        })}

        {/* More button for secondary controls on mobile */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              buttonSize,
              "rounded-full border-0 text-white bg-gray-700 hover:bg-gray-600"
            )}
            onClick={() => {
              vibrate('light');
              setShowMore(!showMore);
            }}
            aria-label="More options"
          >
            <MoreHorizontal className="h-6 w-6" />
          </Button>
        )}

        {/* Secondary controls (desktop) */}
        {!isMobile && secondaryControls.map((control, index) => {
          const Icon = control.icon;
          return (
            <Button
              key={`secondary-${index}`}
              variant={control.active ? "secondary" : "ghost"}
              size="icon"
              className={cn(
                buttonSize,
                "rounded-full border-0 text-white hover:scale-105 transition-transform",
                control.active ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-700 hover:bg-gray-600"
              )}
              onClick={control.onClick}
              aria-label={control.label}
            >
              <Icon className="h-5 w-5" />
            </Button>
          );
        })}
      </div>

      {/* Secondary controls popup for mobile */}
      {isMobile && showMore && (
        <div className={cn(
          "absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2",
          "bg-black/80 backdrop-blur-md rounded-2xl p-3",
          "border border-gray-700/50 shadow-2xl",
          "flex gap-3 animate-scale-in"
        )}>
          {secondaryControls.map((control, index) => {
            const Icon = control.icon;
            return (
              <Button
                key={index}
                variant={control.active ? "secondary" : "ghost"}
                size="icon"
                className={cn(
                  buttonSize,
                  "rounded-full border-0 text-white",
                  control.active ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-700 hover:bg-gray-600"
                )}
                onClick={() => {
                  control.onClick();
                  setShowMore(false);
                }}
                aria-label={control.label}
              >
                <Icon className="h-6 w-6" />
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FloatingControls;
