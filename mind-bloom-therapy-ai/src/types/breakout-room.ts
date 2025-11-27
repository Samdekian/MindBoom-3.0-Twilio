/**
 * Breakout Room Types
 * Type definitions for breakout room functionality in group therapy sessions
 */

export interface BreakoutRoom {
  id: string;
  session_id: string;
  room_name: string;
  twilio_room_sid: string | null;
  max_participants: number;
  current_participants: number;
  created_at: string;
  closed_at: string | null;
  is_active: boolean;
  created_by: string | null;
}

export interface BreakoutRoomParticipant {
  id: string;
  breakout_room_id: string;
  participant_id: string;
  user_id: string | null;
  participant_name: string | null;
  joined_at: string;
  left_at: string | null;
  is_active: boolean;
  connection_quality: 'excellent' | 'good' | 'poor' | 'disconnected';
}

export interface BreakoutRoomTransition {
  id: string;
  participant_id: string;
  from_room_id: string | null;
  to_room_id: string | null;
  moved_by: string | null;
  moved_at: string;
  transition_type: 'manual' | 'auto' | 'self';
  reason: string | null;
}

export interface BreakoutRoomConfig {
  /**
   * Number of breakout rooms to create
   */
  roomCount: number;
  
  /**
   * Maximum participants per room
   */
  maxParticipantsPerRoom: number;
  
  /**
   * Assignment strategy
   */
  assignmentStrategy: 'auto' | 'manual';
  
  /**
   * Duration in minutes (optional, 0 = unlimited)
   */
  duration?: number;
  
  /**
   * Allow participants to switch rooms themselves
   */
  allowSelfSwitch?: boolean;
  
  /**
   * Custom room names (optional)
   */
  customRoomNames?: string[];
}

export interface ParticipantAssignment {
  participant_id: string;
  participant_name: string;
  user_id: string | null;
  breakout_room_id: string | null;
  breakout_room_name: string | null;
}

export interface BreakoutRoomWithParticipants extends BreakoutRoom {
  participants: BreakoutRoomParticipant[];
}

export interface BreakoutRoomStats {
  room_id: string;
  room_name: string;
  participant_count: number;
  average_connection_quality: number;
  duration_seconds: number;
  is_active: boolean;
}

export type BreakoutRoomStatus = 
  | 'creating'
  | 'active'
  | 'closing'
  | 'closed'
  | 'error';

export interface BreakoutRoomManagerState {
  /**
   * All breakout rooms in the session
   */
  rooms: Map<string, BreakoutRoomWithParticipants>;
  
  /**
   * Participant assignments
   */
  assignments: Map<string, ParticipantAssignment>;
  
  /**
   * Current status
   */
  status: BreakoutRoomStatus;
  
  /**
   * Active room count
   */
  activeRoomCount: number;
  
  /**
   * Total participants in breakout rooms
   */
  totalParticipants: number;
  
  /**
   * Configuration used
   */
  config: BreakoutRoomConfig | null;
  
  /**
   * Error if any
   */
  error: string | null;
}

export interface CreateBreakoutRoomRequest {
  session_id: string;
  room_name: string;
  max_participants: number;
}

export interface CreateBreakoutRoomResponse {
  success: boolean;
  breakout_room: BreakoutRoom;
  twilio_room_sid: string;
  error?: string;
}

export interface CloseBreakoutRoomRequest {
  breakout_room_id: string;
  reason?: string;
}

export interface CloseBreakoutRoomResponse {
  success: boolean;
  closed_room_id: string;
  error?: string;
}

export interface MoveParticipantRequest {
  participant_id: string;
  from_room_id: string | null;
  to_room_id: string;
  transition_type: 'manual' | 'auto' | 'self';
  reason?: string;
}

export interface MoveParticipantResponse {
  success: boolean;
  transition: BreakoutRoomTransition;
  error?: string;
}

export interface BulkAssignParticipantsRequest {
  session_id: string;
  assignments: Array<{
    participant_id: string;
    breakout_room_id: string;
  }>;
  transition_type: 'manual' | 'auto';
}

export interface BulkAssignParticipantsResponse {
  success: boolean;
  assigned_count: number;
  failed_count: number;
  errors?: string[];
}

export type BreakoutRoomEvent = 
  | { type: 'room_created'; room: BreakoutRoom }
  | { type: 'room_closed'; room_id: string }
  | { type: 'participant_joined'; room_id: string; participant: BreakoutRoomParticipant }
  | { type: 'participant_left'; room_id: string; participant_id: string }
  | { type: 'participant_moved'; transition: BreakoutRoomTransition }
  | { type: 'error'; error: string };

