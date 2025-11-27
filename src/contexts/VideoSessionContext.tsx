/**
 * VideoSessionContext - Backward Compatibility Layer
 * 
 * This file re-exports from TwilioVideoSessionContext to maintain backward compatibility
 * with existing code that imports from VideoSessionContext.
 * 
 * All new code should import directly from TwilioVideoSessionContext.
 */

export {
  TwilioVideoSessionProvider as VideoSessionProvider,
  useTwilioVideoSession as useVideoSession,
  TwilioVideoSessionContextType,
  type TwilioVideoSessionContextType as VideoSessionContextType
} from './TwilioVideoSessionContext';

// Re-export types for backward compatibility
export type {
  ParticipantInfo,
  SessionStatus,
  CameraStatus,
  StreamDebugInfo,
  VideoSessionState,
  ConnectionQuality
} from '@/types/video-session';

// Re-export VideoDevices type if it exists
export type VideoDevices = {
  cameras: MediaDeviceInfo[];
  microphones: MediaDeviceInfo[];
  speakers: MediaDeviceInfo[];
};
