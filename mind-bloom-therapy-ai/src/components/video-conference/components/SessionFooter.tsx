import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/utils/date/format";
import { 
  Mic, MicOff, Camera, CameraOff, 
  ScreenShare, Phone, MessageCircle, Video, 
  PenTool
} from "lucide-react";
import { ConnectionQuality } from "@/types/core/rbac";
import { VideoState, VideoEffects } from "@/types/video-conference/video-types";

export interface SessionFooterProps {
  videoEnabled?: boolean;
  audioEnabled?: boolean;
  screenShareEnabled?: boolean;
  recordingEnabled?: boolean;
  connectionQuality?: ConnectionQuality;
  onToggleVideo?: () => Promise<boolean>;
  onToggleAudio?: () => Promise<boolean>;
  onToggleScreenShare?: () => Promise<boolean>;
  onToggleRecording?: () => Promise<boolean>;
  onToggleChat?: () => void;
  onToggleWhiteboard?: () => void;
  onEndSession?: () => Promise<void>;
  isInSession?: boolean;
  waitingRoomActive?: boolean;
  joinSession?: () => Promise<void>;
  admitFromWaitingRoom?: () => void;
  connectionAttempt?: number;
  duration?: number;
  isChatOpen?: boolean;
  videoEffects?: VideoEffects;
  isTherapist?: boolean;
  handleToggleBlur?: () => Promise<boolean>;
  handleBlurAmountChange?: (amount: number) => Promise<boolean>;
  // For backward compatibility
  toggleVideo?: () => Promise<boolean>;
  toggleAudio?: () => Promise<boolean>;
  toggleScreenSharing?: () => Promise<boolean>;
  toggleRecording?: () => Promise<boolean>;
  leaveSession?: () => Promise<void>;
  toggleChat?: () => void;
  videoState?: VideoState; 
}

const SessionFooter: React.FC<SessionFooterProps> = ({
  videoEnabled,
  audioEnabled,
  screenShareEnabled,
  recordingEnabled,
  connectionQuality = "good",
  onToggleVideo,
  onToggleAudio,
  onToggleScreenShare,
  onToggleRecording,
  onToggleChat,
  onToggleWhiteboard,
  onEndSession,
  isInSession,
  waitingRoomActive,
  joinSession,
  admitFromWaitingRoom,
  connectionAttempt = 0,
  duration = 0,
  isChatOpen,
  videoEffects,
  isTherapist,
  handleToggleBlur,
  handleBlurAmountChange,
  // Handle backward compatibility
  toggleVideo,
  toggleAudio,
  toggleScreenSharing,
  toggleRecording,
  leaveSession,
  toggleChat,
  videoState
}) => {
  // If we have the older videoState prop, use its values
  const isVideoOn = videoEnabled !== undefined ? videoEnabled : 
                   (videoState ? videoState.isVideoEnabled : true);
  const isAudioOn = audioEnabled !== undefined ? audioEnabled : 
                   (videoState ? videoState.isAudioEnabled : true);
  const isScreenSharing = screenShareEnabled !== undefined ? screenShareEnabled : 
                         (videoState ? videoState.isScreenSharing || videoState.screenShareEnabled : false);
  const isRecording = recordingEnabled !== undefined ? recordingEnabled : 
                     (videoState ? videoState.isRecording || videoState.recordingEnabled : false);
  
  // Select the appropriate handler based on which props were passed
  const handleToggleVideo = onToggleVideo || toggleVideo || (async () => true);
  const handleToggleAudio = onToggleAudio || toggleAudio || (async () => true);
  const handleToggleScreenShare = onToggleScreenShare || toggleScreenSharing || toggleScreenSharing || (async () => true);
  const handleToggleRecording = onToggleRecording || toggleRecording || (async () => true);
  const handleEndSession = onEndSession || leaveSession || (async () => {});
  const handleToggleChat = onToggleChat || toggleChat || (() => {});

  const getQualityColor = () => {
    switch (connectionQuality) {
      case "excellent":
        return "bg-green-500";
      case "good":
        return "bg-green-400";
      case "fair":
      case "poor":
        return "bg-yellow-500";
      case "disconnected":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  // Helper to convert non-promise to promise
  const handleAudio = async () => {
    const result = await handleToggleAudio();
    return result;
  };

  if (!isInSession) {
    return (
      <div className="flex flex-col px-4 py-2 bg-background/90 backdrop-blur-sm border-t">
        <div className="flex justify-center">
          <Button
            variant="default"
            className="px-8"
            onClick={joinSession}
          >
            Join Session
          </Button>
        </div>
      </div>
    );
  }

  if (waitingRoomActive) {
    return (
      <div className="flex flex-col px-4 py-2 bg-background/90 backdrop-blur-sm border-t">
        <div className="flex justify-center">
          {connectionAttempt > 0 && (
            <Badge variant="outline" className="mr-2">
              Attempt {connectionAttempt}
            </Badge>
          )}
          <Button
            variant="default"
            className="px-8"
            onClick={admitFromWaitingRoom}
          >
            Admit Participant
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col px-4 py-2 bg-background/90 backdrop-blur-sm border-t">
      <div className="flex items-center justify-between mb-2">
        <Badge variant="outline" className="text-xs">
          {formatDuration(duration)}
        </Badge>
        <Badge 
          variant="outline" 
          className={`${getQualityColor()} text-white capitalize text-xs`}
        >
          {connectionQuality}
        </Badge>
      </div>
      
      <div className="flex items-center justify-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleAudio}
          className={isAudioOn ? "" : "bg-muted"}
          aria-label={isAudioOn ? "Mute microphone" : "Unmute microphone"}
        >
          {isAudioOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleToggleVideo()}
          className={isVideoOn ? "" : "bg-muted"}
          aria-label={isVideoOn ? "Disable camera" : "Enable camera"}
        >
          {isVideoOn ? <Camera className="h-5 w-5" /> : <CameraOff className="h-5 w-5" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleToggleScreenShare()}
          className={isScreenSharing ? "bg-muted" : ""}
          aria-label={isScreenSharing ? "Stop screen sharing" : "Start screen sharing"}
        >
          <ScreenShare className="h-5 w-5" />
        </Button>

        {onToggleRecording && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleRecording()}
            className={isRecording ? "bg-red-100 text-red-600" : ""}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
          >
            <Video className="h-5 w-5" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleChat}
          aria-label="Open chat"
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
        
        {onToggleWhiteboard && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleWhiteboard}
            aria-label="Open whiteboard"
          >
            <PenTool className="h-5 w-5" />
          </Button>
        )}

        <Button
          variant="destructive"
          size="icon"
          onClick={handleEndSession}
          aria-label="End call"
        >
          <Phone className="h-5 w-5 rotate-135" />
        </Button>
      </div>
    </div>
  );
};

export default SessionFooter;
