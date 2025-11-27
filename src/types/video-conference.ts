
// Connection and quality types
export type ConnectionQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'disconnected';
export type VideoQuality = 'high' | 'medium' | 'low' | 'auto';

// Video blur levels
export type VideoBlurLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

// Video state
export interface VideoSessionState {
  videoEnabled: boolean;
  audioEnabled: boolean;
  screenShareEnabled?: boolean;
  recordingEnabled?: boolean;
  connectionQuality: ConnectionQuality;
  videoQuality: VideoQuality;
  selectedCamera?: string | null;
  selectedMicrophone?: string | null;
  selectedSpeaker?: string | null;
}

// Video effects
export interface VideoEffects {
  blurEnabled: boolean;
  blurLevel: VideoBlurLevel;
  virtualBackground?: boolean;
  backgroundImage?: string;
}

// Participant information
export interface ParticipantInfo {
  id: string;
  name: string;
  avatarUrl?: string;
  email?: string;
  role?: 'therapist' | 'patient' | 'guest';
  status?: 'online' | 'away' | 'offline';
}

// Session status
export type SessionStatus = 
  | 'connecting' 
  | 'connected' 
  | 'reconnecting' 
  | 'disconnected'
  | 'failed'
  | 'waiting-room';

// Recording status
export type RecordingStatus =
  | 'not-recording'
  | 'starting'
  | 'recording'
  | 'paused'
  | 'stopping'
  | 'error';

// Device types
export interface VideoDevice {
  deviceId: string;
  groupId: string;
  label: string;
  kind: string;
}

// Whiteboard element types
export type WhiteboardElementType = 
  | 'pen' 
  | 'line' 
  | 'rectangle' 
  | 'circle' 
  | 'text'
  | 'image'
  | 'eraser';
