export interface MediaDeviceInfo {
  deviceId: string;
  label: string;
  kind: 'videoinput' | 'audioinput' | 'audiooutput';
  groupId: string;
  toJSON?: () => any;
}

export interface ParticipantInfo {
  id: string;
  name: string;
  role?: string;
  isVideoEnabled?: boolean;
  isAudioEnabled?: boolean;
  isCurrentUser?: boolean;
  avatar?: string;
  isHost?: boolean;
  isSpeaking?: boolean;
  connectionQuality?: ConnectionQuality;
  lastSpeakingTime?: number;
}

export interface VideoDevices {
  cameras: MediaDeviceInfo[];
  microphones: MediaDeviceInfo[];
  speakers: MediaDeviceInfo[];
  videoInputs?: MediaDeviceInfo[];
  audioInputs?: MediaDeviceInfo[];
  audioOutputs?: MediaDeviceInfo[];
  devices?: MediaDeviceInfo[];
  getDevices?: () => Promise<MediaDeviceInfo[]>;
  hasCameras?: boolean;
  hasMicrophones?: boolean;
  hasSpeakers?: boolean;
  loading?: boolean;
  error?: Error | null;
  defaultDevices?: {
    camera: string | null;
    microphone: string | null;
    speaker: string | null;
  };
}

export type ConnectionQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'disconnected';
export type VideoQuality = 'low' | 'medium' | 'high';

export type SessionStatus = 'waiting' | 'connecting' | 'connected' | 'reconnecting' | 'ended' | 'initializing' | 'failed' | 'idle' | 'disconnecting';
export type CameraStatus = 'available' | 'unavailable' | 'permission-denied' | 'requesting' | 'granted' | 'denied' | 'idle';

export interface StreamDebugInfo {
  localStream: boolean;
  remoteStreams: number;
  connectionState: string;
  hasVideo: boolean;
  hasAudio: boolean;
  videoTrackCount: number;
  audioTrackCount: number;
  lastUpdated: string;
}

export interface VideoSessionState {
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  isRecording: boolean;
  isChatOpen: boolean;
  selectedCamera?: string | null;
  selectedMicrophone?: string | null;
  selectedSpeaker?: string | null;
  connectionQuality: ConnectionQuality;
  sessionDuration?: string;
  // Additional properties for backward compatibility
  screenShareEnabled?: boolean;
  // AI Integration
  aiEnabled?: boolean;
  aiConnected?: boolean;
  aiResponding?: boolean;
  // Enhanced Features
  securityScore?: number;
  analyticsEnabled?: boolean;
  fileSharingEnabled?: boolean;
}