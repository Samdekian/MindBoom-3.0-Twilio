/**
 * Twilio Video Configuration
 * Centralized configuration for Twilio Video SDK
 */

import { ENVIRONMENT } from '@/config/environment';

export const TWILIO_CONFIG = {
  /**
   * API endpoint for token generation
   */
  TOKEN_ENDPOINT: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/twilio-video-token`,
  
  /**
   * Default room configuration
   */
  DEFAULT_ROOM_CONFIG: {
    audio: true,
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      frameRate: { ideal: 24, max: 30 }
    },
    bandwidthProfile: {
      video: {
        mode: 'collaboration' as const,
        maxTracks: 10,
        dominantSpeakerPriority: 'standard' as const,
        renderDimensions: {
          high: { width: 1280, height: 720 },
          standard: { width: 640, height: 480 },
          low: { width: 320, height: 240 }
        }
      }
    },
    maxAudioBitrate: 16000, // 16 kbps
    preferredVideoCodecs: ['VP8', 'H264'] as Array<'VP8' | 'H264' | 'VP9'>,
    networkQuality: {
      local: 1, // Report network quality for local participant
      remote: 2  // Report network quality for remote participants
    },
    dominantSpeaker: true,
    automaticSubscription: true
  },
  
  /**
   * Breakout room configuration
   */
  BREAKOUT_ROOM_CONFIG: {
    maxRoomsPerSession: 10,
    maxParticipantsPerRoom: 15,
    minParticipantsToCreate: 2,
    autoCloseEmptyRoomDelay: 5 * 60 * 1000, // 5 minutes
    defaultRoomNames: [
      'Room 1',
      'Room 2',
      'Room 3',
      'Room 4',
      'Room 5',
      'Room 6',
      'Room 7',
      'Room 8',
      'Room 9',
      'Room 10'
    ]
  },
  
  /**
   * Connection settings
   */
  CONNECTION: {
    reconnectAttempts: 3,
    reconnectDelay: 2000, // 2 seconds
    tokenRefreshBuffer: 5 * 60 * 1000, // Refresh token 5 minutes before expiry
    heartbeatInterval: 30 * 1000, // 30 seconds
    connectionTimeout: 15 * 1000 // 15 seconds
  },
  
  /**
   * Quality settings based on environment
   */
  QUALITY_PROFILES: {
    high: {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 }
      },
      maxVideoBitrate: 2500000 // 2.5 Mbps
    },
    medium: {
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        frameRate: { ideal: 24 }
      },
      maxVideoBitrate: 1000000 // 1 Mbps
    },
    low: {
      video: {
        width: { ideal: 320 },
        height: { ideal: 240 },
        frameRate: { ideal: 15 }
      },
      maxVideoBitrate: 500000 // 500 kbps
    }
  },
  
  /**
   * Get quality profile based on network conditions
   */
  getQualityProfile(networkQuality: number): 'high' | 'medium' | 'low' {
    if (networkQuality >= 4) return 'high';
    if (networkQuality >= 2) return 'medium';
    return 'low';
  },
  
  /**
   * Check if in development mode
   */
  isDevelopment(): boolean {
    return ENVIRONMENT.isDevelopment();
  },
  
  /**
   * Get room options with defaults
   */
  getRoomOptions(overrides?: Partial<typeof TWILIO_CONFIG.DEFAULT_ROOM_CONFIG>) {
    return {
      ...TWILIO_CONFIG.DEFAULT_ROOM_CONFIG,
      ...overrides
    };
  }
};

/**
 * Twilio Error Codes
 * Common error codes from Twilio Video SDK
 */
export const TWILIO_ERROR_CODES = {
  // Access Token Errors (20101-20104)
  INVALID_ACCESS_TOKEN: 20101,
  ACCESS_TOKEN_EXPIRED: 20104,
  
  // Connection Errors (53000-53006)
  SIGNALING_CONNECTION_ERROR: 53000,
  SIGNALING_CONNECTION_TIMEOUT: 53001,
  SIGNALING_INCOMING_MESSAGE_INVALID: 53002,
  SIGNALING_OUTGOING_MESSAGE_INVALID: 53003,
  ROOM_CONNECT_FAILED: 53104,
  ROOM_CREATE_FAILED: 53103,
  
  // Media Errors (53400-53407)
  MEDIA_CLIENT_LOCAL_DESC_FAILED: 53400,
  MEDIA_SERVER_LOCAL_DESC_FAILED: 53401,
  MEDIA_CLIENT_REMOTE_DESC_FAILED: 53402,
  MEDIA_SERVER_REMOTE_DESC_FAILED: 53403,
  MEDIA_NO_SUPPORTED_CODEC: 53404,
  MEDIA_CONNECTION_FAILED: 53405,
  
  // Participant Errors
  PARTICIPANT_NOT_FOUND: 53105,
  PARTICIPANT_DUPLICATE_IDENTITY: 53205,
  
  // Track Errors
  TRACK_INVALID_ID: 53300,
  LOCAL_TRACK_LIMIT_EXCEEDED: 53301
};

/**
 * Get user-friendly error message from Twilio error code
 */
export function getTwilioErrorMessage(code: number): string {
  switch (code) {
    case TWILIO_ERROR_CODES.INVALID_ACCESS_TOKEN:
    case TWILIO_ERROR_CODES.ACCESS_TOKEN_EXPIRED:
      return 'Your session has expired. Please refresh and try again.';
    
    case TWILIO_ERROR_CODES.SIGNALING_CONNECTION_ERROR:
    case TWILIO_ERROR_CODES.SIGNALING_CONNECTION_TIMEOUT:
      return 'Unable to connect to the video service. Please check your internet connection.';
    
    case TWILIO_ERROR_CODES.ROOM_CONNECT_FAILED:
      return 'Failed to join the room. Please try again.';
    
    case TWILIO_ERROR_CODES.MEDIA_CONNECTION_FAILED:
      return 'Media connection failed. Please check your network and try again.';
    
    case TWILIO_ERROR_CODES.MEDIA_NO_SUPPORTED_CODEC:
      return 'Your browser does not support the required video codecs.';
    
    case TWILIO_ERROR_CODES.PARTICIPANT_DUPLICATE_IDENTITY:
      return 'You are already connected to this session from another device.';
    
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Validate room name
 */
export function isValidRoomName(name: string): boolean {
  // Twilio room names must be 1-128 characters
  // Can contain alphanumeric characters, hyphens, and underscores
  return /^[a-zA-Z0-9_-]{1,128}$/.test(name);
}

/**
 * Generate a unique room name
 */
export function generateRoomName(prefix: string = 'room'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}`;
}

