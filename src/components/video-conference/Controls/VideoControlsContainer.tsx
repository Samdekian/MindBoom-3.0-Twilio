
import React from "react";
import VideoControlButton from "./VideoControlButton";
import ConnectionQualityBadge from "./ConnectionQualityBadge";
import BlurControls from "./BlurControls";
import { cn } from "@/lib/utils";
import { VideoSessionState } from "@/contexts/VideoSessionContext";
import { Video, VideoOff, Mic, MicOff, ScreenShare, Phone, Circle, MessageCircle } from "lucide-react";

interface VideoControlsContainerProps {
  videoState: VideoSessionState;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onToggleScreenShare: () => void;
  onToggleRecording: () => void;
  onToggleChat: () => void;
  onToggleBlur?: () => void;
  onChangeBlurAmount?: (value: number) => void;
  onLeaveSession: () => void;
  showBlurControls?: boolean;
  blurEnabled?: boolean;
  blurAmount?: number;
  className?: string;
  showRecording?: boolean;
  chatOpen?: boolean;
}

const VideoControlsContainer: React.FC<VideoControlsContainerProps> = ({
  videoState,
  onToggleVideo,
  onToggleAudio,
  onToggleScreenShare,
  onToggleRecording,
  onToggleChat,
  onToggleBlur,
  onChangeBlurAmount,
  onLeaveSession,
  showBlurControls = false,
  blurEnabled = false, 
  blurAmount = 5,
  className,
  showRecording = false,
  chatOpen = false,
}) => {
  // Use consistent property names
  const isScreenSharing = videoState.isScreenSharing || false;
  const isRecording = videoState.isRecording || false;
  const isChatOpen = videoState.isChatOpen || chatOpen;
  
  // Map ConnectionQuality to the allowed types
  const connectionQuality: "excellent" | "good" | "poor" | "disconnected" = 
    (videoState.connectionQuality as "excellent" | "good" | "poor" | "disconnected") || "disconnected";
  
  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-2 p-3 bg-slate-900/90 rounded-lg", className)}>
      <VideoControlButton
        active={videoState.isVideoEnabled}
        onClick={onToggleVideo}
        tooltip={videoState.isVideoEnabled ? "Turn off camera" : "Turn on camera"}
        activeIcon={<Video />}
        inactiveIcon={<VideoOff />}
      />

      <VideoControlButton
        active={videoState.isAudioEnabled}
        onClick={onToggleAudio}
        tooltip={videoState.isAudioEnabled ? "Mute microphone" : "Unmute microphone"}
        activeIcon={<Mic />}
        inactiveIcon={<MicOff />}
      />

      <VideoControlButton
        active={isScreenSharing}
        onClick={onToggleScreenShare}
        tooltip={isScreenSharing ? "Stop sharing screen" : "Share screen"}
        activeIcon={<ScreenShare />}
        activeColorClass="bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 hover:text-amber-500"
      />

      <VideoControlButton
        active={isChatOpen}
        onClick={onToggleChat}
        tooltip={isChatOpen ? "Hide chat" : "Show chat"}
        activeIcon={<MessageCircle />}
        activeColorClass="bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 hover:text-blue-500"
      />

      {showBlurControls && onToggleBlur && (
        <BlurControls 
          blurEnabled={blurEnabled} 
          blurAmount={blurAmount} 
          onToggleBlur={onToggleBlur}
          onChangeBlurAmount={onChangeBlurAmount}
        />
      )}

      {showRecording && (
        <VideoControlButton
          active={isRecording}
          onClick={onToggleRecording}
          tooltip={isRecording ? "Stop recording" : "Start recording"}
          activeIcon={<Circle className="animate-pulse" />}
          activeColorClass="bg-red-500/20 text-red-500 hover:bg-red-500/30 hover:text-red-500"
        />
      )}

      <ConnectionQualityBadge quality={connectionQuality} />

      <VideoControlButton
        active={false}
        onClick={onLeaveSession}
        tooltip="Leave session"
        activeIcon={<Phone className="rotate-135" />}
        variant="destructive"
      />
    </div>
  );
};

export default VideoControlsContainer;
