// Session validation utilities for production environments
import { z } from 'zod';

// Validation schemas
export const SessionCreateSchema = z.object({
  session_name: z.string().min(1).max(100),
  therapist_id: z.string().uuid(),
  expires_at: z.string().datetime(),
  max_participants: z.number().min(2).max(10),
  recording_enabled: z.boolean().default(false),
  waiting_room_enabled: z.boolean().default(true)
});

export const ParticipantJoinSchema = z.object({
  session_id: z.string().uuid(),
  user_id: z.string().uuid().optional(),
  participant_name: z.string().min(1).max(50),
  role: z.enum(['therapist', 'patient', 'observer'])
});

export const ChatMessageSchema = z.object({
  session_id: z.string().uuid(),
  sender_id: z.string().uuid(),
  content: z.string().min(1).max(1000),
  is_system_message: z.boolean().default(false)
});

export const SignalingMessageSchema = z.object({
  channel_id: z.string().uuid(),
  sender_id: z.string().uuid(),
  recipient_id: z.string().uuid().optional(),
  message_type: z.enum(['offer', 'answer', 'ice-candidate', 'leave']),
  content: z.record(z.unknown())
});

// Validation functions
export class SessionValidator {
  static validateSessionCreate(data: unknown) {
    return SessionCreateSchema.safeParse(data);
  }

  static validateParticipantJoin(data: unknown) {
    return ParticipantJoinSchema.safeParse(data);
  }

  static validateChatMessage(data: unknown) {
    return ChatMessageSchema.safeParse(data);
  }

  static validateSignalingMessage(data: unknown) {
    return SignalingMessageSchema.safeParse(data);
  }

  static isValidSessionToken(token: string): boolean {
    // Basic token validation - should be 64 characters hex
    return /^[a-fA-F0-9]{64}$/.test(token);
  }

  static isSessionExpired(expiresAt: string): boolean {
    return new Date(expiresAt) <= new Date();
  }

  static sanitizeParticipantName(name: string): string {
    return name
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .trim()
      .slice(0, 50);
  }

  static validateVideoConstraints(constraints: MediaStreamConstraints): boolean {
    if (!constraints.video && !constraints.audio) {
      return false;
    }

    // Check for reasonable video constraints
    if (constraints.video && typeof constraints.video === 'object') {
      const video = constraints.video as MediaTrackConstraints;
      
      if (video.width && typeof video.width === 'number' && video.width > 4096) {
        return false;
      }
      
      if (video.height && typeof video.height === 'number' && video.height > 2160) {
        return false;
      }
      
      if (video.frameRate && typeof video.frameRate === 'number' && video.frameRate > 60) {
        return false;
      }
    }

    return true;
  }

  static validateWebRTCConfiguration(config: RTCConfiguration): boolean {
    // Validate ICE servers
    if (config.iceServers) {
      for (const server of config.iceServers) {
        if (!server.urls || (Array.isArray(server.urls) && server.urls.length === 0)) {
          return false;
        }
      }
    }

    return true;
  }
}

// Type exports for use in components
export type SessionCreateData = z.infer<typeof SessionCreateSchema>;
export type ParticipantJoinData = z.infer<typeof ParticipantJoinSchema>;
export type ChatMessageData = z.infer<typeof ChatMessageSchema>;
export type SignalingMessageData = z.infer<typeof SignalingMessageSchema>;