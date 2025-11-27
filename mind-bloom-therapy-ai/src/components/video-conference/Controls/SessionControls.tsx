
import React from "react";
import { cn } from "@/lib/utils";
import VideoControls from "../VideoControls";
import WhiteboardButton from "./WhiteboardButton";

interface SessionControlsProps {
  videoState: any;
  onToggleVideo: () => Promise<boolean>;
  onToggleAudio: () => boolean;
  onToggleScreenShare: () => Promise<boolean>;
  onToggleRecording: () => Promise<boolean>;
  onToggleChat: () => void;
  onToggleBlur: () => Promise<void>;
  onChangeBlurAmount: (amount: number) => Promise<void>;
  onLeaveSession: () => Promise<void>;
  showBlurControls: boolean;
  blurEnabled: boolean;
  blurAmount: number;
  showRecording: boolean;
  chatOpen: boolean;
  onOpenWhiteboard: () => void;
  className?: string;
}

const SessionControls: React.FC<SessionControlsProps> = ({
  videoState,
  onToggleVideo,
  onToggleAudio,
  onToggleScreenShare,
  onToggleRecording,
  onToggleChat,
  onToggleBlur,
  onChangeBlurAmount,
  onLeaveSession,
  showBlurControls,
  blurEnabled,
  blurAmount,
  showRecording,
  chatOpen,
  onOpenWhiteboard,
  className
}) => {
  return (
    <div className={cn("flex flex-col md:flex-row gap-2", className)}>
      <VideoControls
        videoState={videoState}
        onToggleVideo={onToggleVideo}
        onToggleAudio={onToggleAudio}
        onToggleScreenShare={onToggleScreenShare}
        onToggleRecording={onToggleRecording}
        onToggleChat={onToggleChat}
        onToggleBlur={onToggleBlur}
        onChangeBlurAmount={onChangeBlurAmount}
        onLeaveSession={onLeaveSession}
        showBlurControls={showBlurControls}
        blurEnabled={blurEnabled}
        blurAmount={blurAmount}
        className="w-full justify-center"
        showRecording={showRecording}
        chatOpen={chatOpen}
      />
      
      <div className="flex justify-center md:justify-end gap-2 w-full md:w-auto mt-2 md:mt-0">
        <WhiteboardButton onClick={onOpenWhiteboard} />
      </div>
    </div>
  );
};

export default SessionControls;
