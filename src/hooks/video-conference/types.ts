// Re-export all types from unified video-session types
export type {
  MediaDeviceInfo,
  VideoDevices,
  ConnectionQuality,
  VideoQuality,
  ParticipantInfo,
  VideoSessionState,
  SessionStatus,
  CameraStatus,
  StreamDebugInfo
} from '@/types/video-session';

// Import types for use in interfaces
import type { VideoSessionState, ConnectionQuality } from '@/types/video-session';

// Keep legacy types for backward compatibility  
export interface VideoState extends VideoSessionState {
  // Backward compatibility aliases
  screenShareEnabled?: boolean;
}

export type VideoBlurLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  recordedChunks: Blob[];
  mediaRecorder: MediaRecorder | null;
  startTime: number;
  error: Error | null;
  recorder: MediaRecorder | null;
  recordingStream: MediaStream | null;
  savedRecordings: (string | Blob)[];
}

export interface VideoEffects {
  blur: VideoBlurLevel;
  backgroundReplacement: boolean;
  noiseReduction: boolean;
}

export interface SessionMetrics {
  duration: number;
  participantCount: number;
  networkQuality: ConnectionQuality;
  audioQuality: number;
  videoQuality: number;
}
