/**
 * Twilio Video Types
 * Type definitions for Twilio Video SDK integration
 */

import type { 
  Room, 
  LocalParticipant, 
  RemoteParticipant,
  LocalVideoTrack,
  LocalAudioTrack,
  RemoteVideoTrack,
  RemoteAudioTrack,
  TwilioError
} from 'twilio-video';

// Re-export Twilio types for convenience
export type {
  Room,
  LocalParticipant,
  RemoteParticipant,
  LocalVideoTrack,
  LocalAudioTrack,
  RemoteVideoTrack,
  RemoteAudioTrack,
  TwilioError
};

export interface TwilioTokenResponse {
  token: string;
  identity: string;
  roomName: string;
  expiresAt: string;
}

export interface TwilioRoomConfig {
  name: string;
  audio?: boolean | MediaTrackConstraints;
  video?: boolean | MediaTrackConstraints;
  bandwidthProfile?: {
    video?: {
      mode?: 'collaboration' | 'presentation' | 'grid';
      maxTracks?: number;
      dominantSpeakerPriority?: 'low' | 'standard' | 'high';
    };
  };
  maxAudioBitrate?: number;
  maxVideoBitrate?: number;
  preferredVideoCodecs?: Array<'VP8' | 'H264' | 'VP9'>;
  networkQuality?: {
    local?: number;
    remote?: number;
  };
}

export interface TwilioParticipantInfo {
  identity: string;
  sid: string;
  isLocal: boolean;
  state: 'connected' | 'reconnecting' | 'disconnected';
  networkQualityLevel: number | null;
  audioTrackEnabled: boolean;
  videoTrackEnabled: boolean;
}

export interface TwilioRoomState {
  sid: string;
  name: string;
  state: 'connecting' | 'connected' | 'reconnecting' | 'disconnected';
  localParticipant: TwilioParticipantInfo | null;
  participants: Map<string, TwilioParticipantInfo>;
  dominantSpeaker: string | null;
  isRecording: boolean;
}

export interface TwilioConnectionQuality {
  level: number; // 0-5, where 5 is best
  stats: {
    audio?: {
      jitter: number;
      packetLoss: number;
      rtt: number;
    };
    video?: {
      jitter: number;
      packetLoss: number;
      rtt: number;
      frameRate: number;
      dimensions: { width: number; height: number };
    };
  };
}

export interface TwilioRoomOptions {
  /**
   * Room name/SID to join
   */
  roomName: string;
  
  /**
   * Access token for authentication
   */
  token: string;
  
  /**
   * Enable audio track
   */
  audio?: boolean;
  
  /**
   * Enable video track
   */
  video?: boolean;
  
  /**
   * Bandwidth profile for adaptive quality
   */
  bandwidthProfile?: TwilioRoomConfig['bandwidthProfile'];
  
  /**
   * Enable network quality monitoring
   */
  networkQuality?: boolean;
  
  /**
   * Dominant speaker detection
   */
  dominantSpeaker?: boolean;
  
  /**
   * Maximum audio bitrate in bps
   */
  maxAudioBitrate?: number;
  
  /**
   * Maximum video bitrate in bps
   */
  maxVideoBitrate?: number;
}

export interface TwilioTrackPublication {
  trackName: string;
  trackSid: string;
  isSubscribed: boolean;
  isEnabled: boolean;
  kind: 'audio' | 'video' | 'data';
  priority: 'low' | 'standard' | 'high' | null;
}

export interface TwilioRoomMetrics {
  duration: number; // in seconds
  participantCount: number;
  peakParticipantCount: number;
  averageNetworkQuality: number;
  reconnectionCount: number;
  totalDataSent: number; // in bytes
  totalDataReceived: number; // in bytes
}

export type TwilioRoomStatus = 
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'failed';

export type NetworkQualityLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface TwilioRoomEvent {
  type: 
    | 'participantConnected'
    | 'participantDisconnected'
    | 'trackSubscribed'
    | 'trackUnsubscribed'
    | 'trackEnabled'
    | 'trackDisabled'
    | 'dominantSpeakerChanged'
    | 'networkQualityLevelChanged'
    | 'reconnecting'
    | 'reconnected'
    | 'disconnected';
  participant?: TwilioParticipantInfo;
  track?: TwilioTrackPublication;
  data?: any;
  timestamp: number;
}

export interface TwilioErrorInfo {
  code: number;
  message: string;
  twilioError?: TwilioError;
}

