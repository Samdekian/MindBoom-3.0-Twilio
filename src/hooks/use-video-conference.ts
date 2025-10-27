
// Simple re-export of the unified context hook
export { useVideoSession as useVideoConference } from '@/contexts/VideoSessionContext';
export type { 
  VideoSessionState, 
  ParticipantInfo, 
  VideoDevices,
  ConnectionQuality,
  VideoQuality,
  SessionStatus,
  CameraStatus,
  StreamDebugInfo
} from '@/types/video-session';
