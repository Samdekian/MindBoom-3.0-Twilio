
import { ConnectionQuality } from "../core/rbac";

// Video state types
export interface VideoState {
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  isRecording: boolean;
  connectionQuality: ConnectionQuality;
  isChatOpen: boolean;
  selectedCamera: string | null;
  selectedMicrophone: string | null;
  selectedSpeaker: string | null;
  screenShareEnabled?: boolean;
  recordingEnabled?: boolean;
}

export type VideoBlurLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

// Video effects interface
export interface VideoEffects {
  blurEnabled: boolean;
  blurLevel: VideoBlurLevel;
  virtualBackgroundEnabled: boolean;
  virtualBackgroundUrl: string | null;
  filterEnabled: boolean;
  filterType: string | null;
}
