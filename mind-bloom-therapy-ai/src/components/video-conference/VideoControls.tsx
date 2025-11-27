
import React from "react";
import type { VideoSessionState } from "@/types/video-session";
import VideoControlsContainer from "./controls/VideoControlsContainer";

interface VideoControlsProps {
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

const VideoControls: React.FC<VideoControlsProps> = (props) => {
  return <VideoControlsContainer {...props} />;
};

export default VideoControls;
