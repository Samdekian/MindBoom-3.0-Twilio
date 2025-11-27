/**
 * Twilio Room Manager
 * Handles Twilio Video room connections, participants, and tracks
 */

import { connect, createLocalTracks, type ConnectOptions } from 'twilio-video';
import type { 
  Room, 
  LocalParticipant, 
  RemoteParticipant,
  LocalTrack,
  RemoteTrack,
  RemoteTrackPublication
} from 'twilio-video';
import { TWILIO_CONFIG, getTwilioErrorMessage } from './config';
import type { TwilioRoomOptions, TwilioParticipantInfo, TwilioRoomEvent } from '@/types/twilio';

export class TwilioRoomManager {
  private room: Room | null = null;
  private localTracks: LocalTrack[] = [];
  private eventListeners: Map<string, Set<(event: TwilioRoomEvent) => void>> = new Map();
  private reconnecting = false;

  /**
   * Connect to a Twilio Video room
   */
  async connect(options: TwilioRoomOptions): Promise<Room> {
    try {
      console.log('🎥 [TwilioRoomManager] Connecting to room:', options.roomName);

      // Create local tracks if not already created
      if (this.localTracks.length === 0) {
        this.localTracks = await this.createLocalTracks(
          options.audio ?? true,
          options.video ?? true
        );
      }

      // Build connect options
      const connectOptions: ConnectOptions = {
        name: options.roomName,
        audio: options.audio ?? true,
        video: options.video ?? true,
        tracks: this.localTracks,
        bandwidthProfile: options.bandwidthProfile,
        networkQuality: options.networkQuality !== false ? {
          local: 1,
          remote: 2
        } : undefined,
        dominantSpeaker: options.dominantSpeaker ?? true,
        maxAudioBitrate: options.maxAudioBitrate,
        maxVideoBitrate: options.maxVideoBitrate,
        automaticSubscription: true,
        preferredVideoCodecs: TWILIO_CONFIG.DEFAULT_ROOM_CONFIG.preferredVideoCodecs
      };

      // Connect to room
      this.room = await connect(options.token, connectOptions);

      // Setup event listeners
      this.setupRoomEventListeners(this.room);

      console.log('✅ [TwilioRoomManager] Connected to room:', this.room.sid);
      
      this.emitEvent({
        type: 'reconnected',
        timestamp: Date.now()
      });

      return this.room;

    } catch (error: any) {
      console.error('❌ [TwilioRoomManager] Failed to connect:', error);
      const errorMessage = error.code 
        ? getTwilioErrorMessage(error.code)
        : error.message;
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Create local media tracks
   */
  private async createLocalTracks(audio: boolean, video: boolean): Promise<LocalTrack[]> {
    try {
      const constraints: any = {};
      
      if (audio) {
        constraints.audio = true;
      }
      
      if (video) {
        constraints.video = TWILIO_CONFIG.DEFAULT_ROOM_CONFIG.video;
      }

      const tracks = await createLocalTracks(constraints);
      console.log('🎙️ [TwilioRoomManager] Local tracks created:', tracks.length);
      
      return tracks;
    } catch (error) {
      console.error('❌ [TwilioRoomManager] Failed to create local tracks:', error);
      throw error;
    }
  }

  /**
   * Setup room event listeners
   */
  private setupRoomEventListeners(room: Room): void {
    // Participant events
    room.on('participantConnected', (participant: RemoteParticipant) => {
      console.log('👤 [TwilioRoomManager] Participant connected:', participant.identity);
      
      this.emitEvent({
        type: 'participantConnected',
        participant: this.mapParticipantInfo(participant, false),
        timestamp: Date.now()
      });

      // Setup participant track listeners
      this.setupParticipantEventListeners(participant);
    });

    room.on('participantDisconnected', (participant: RemoteParticipant) => {
      console.log('👤 [TwilioRoomManager] Participant disconnected:', participant.identity);
      
      this.emitEvent({
        type: 'participantDisconnected',
        participant: this.mapParticipantInfo(participant, false),
        timestamp: Date.now()
      });
    });

    // Connection state events
    room.on('reconnecting', (error) => {
      console.warn('🔄 [TwilioRoomManager] Reconnecting...', error);
      this.reconnecting = true;
      
      this.emitEvent({
        type: 'reconnecting',
        data: { error },
        timestamp: Date.now()
      });
    });

    room.on('reconnected', () => {
      console.log('✅ [TwilioRoomManager] Reconnected');
      this.reconnecting = false;
      
      this.emitEvent({
        type: 'reconnected',
        timestamp: Date.now()
      });
    });

    room.on('disconnected', (room, error) => {
      console.log('🔌 [TwilioRoomManager] Disconnected', error);
      
      this.emitEvent({
        type: 'disconnected',
        data: { error },
        timestamp: Date.now()
      });
    });

    // Dominant speaker
    if (room.dominantSpeaker) {
      this.emitEvent({
        type: 'dominantSpeakerChanged',
        participant: this.mapParticipantInfo(room.dominantSpeaker, false),
        timestamp: Date.now()
      });
    }

    room.on('dominantSpeakerChanged', (participant: RemoteParticipant | null) => {
      if (participant) {
        this.emitEvent({
          type: 'dominantSpeakerChanged',
          participant: this.mapParticipantInfo(participant, false),
          timestamp: Date.now()
        });
      }
    });

    // Setup listeners for already connected participants
    room.participants.forEach((participant) => {
      this.setupParticipantEventListeners(participant);
    });
  }

  /**
   * Setup participant event listeners
   */
  private setupParticipantEventListeners(participant: RemoteParticipant): void {
    participant.on('trackSubscribed', (track: RemoteTrack) => {
      console.log('📹 [TwilioRoomManager] Track subscribed:', track.kind, participant.identity);
      
      this.emitEvent({
        type: 'trackSubscribed',
        participant: this.mapParticipantInfo(participant, false),
        track: {
          trackName: track.name,
          trackSid: track.sid,
          kind: track.kind,
          isSubscribed: true,
          isEnabled: track.isEnabled,
          priority: null
        },
        timestamp: Date.now()
      });
    });

    participant.on('trackUnsubscribed', (track: RemoteTrack) => {
      console.log('📹 [TwilioRoomManager] Track unsubscribed:', track.kind, participant.identity);
      
      this.emitEvent({
        type: 'trackUnsubscribed',
        participant: this.mapParticipantInfo(participant, false),
        track: {
          trackName: track.name,
          trackSid: track.sid,
          kind: track.kind,
          isSubscribed: false,
          isEnabled: track.isEnabled,
          priority: null
        },
        timestamp: Date.now()
      });
    });

    participant.on('trackEnabled', (publication: RemoteTrackPublication) => {
      console.log('📹 [TwilioRoomManager] Track enabled:', publication.kind, participant.identity);
      
      this.emitEvent({
        type: 'trackEnabled',
        participant: this.mapParticipantInfo(participant, false),
        timestamp: Date.now()
      });
    });

    participant.on('trackDisabled', (publication: RemoteTrackPublication) => {
      console.log('📹 [TwilioRoomManager] Track disabled:', publication.kind, participant.identity);
      
      this.emitEvent({
        type: 'trackDisabled',
        participant: this.mapParticipantInfo(participant, false),
        timestamp: Date.now()
      });
    });

    participant.on('networkQualityLevelChanged', (networkQualityLevel: number) => {
      this.emitEvent({
        type: 'networkQualityLevelChanged',
        participant: this.mapParticipantInfo(participant, false),
        data: { networkQualityLevel },
        timestamp: Date.now()
      });
    });
  }

  /**
   * Disconnect from room
   */
  disconnect(): void {
    if (this.room) {
      console.log('🔌 [TwilioRoomManager] Disconnecting from room');
      this.room.disconnect();
      this.room = null;
    }

    // Stop all local tracks
    this.localTracks.forEach(track => track.stop());
    this.localTracks = [];

    // Clear event listeners
    this.eventListeners.clear();
  }

  /**
   * Toggle local audio
   */
  toggleAudio(enabled: boolean): void {
    if (!this.room) return;

    const audioTracks = this.room.localParticipant.audioTracks;
    audioTracks.forEach(publication => {
      if (enabled) {
        publication.track.enable();
      } else {
        publication.track.disable();
      }
    });

    console.log('🎙️ [TwilioRoomManager] Audio', enabled ? 'enabled' : 'disabled');
  }

  /**
   * Toggle local video
   */
  toggleVideo(enabled: boolean): void {
    if (!this.room) return;

    const videoTracks = this.room.localParticipant.videoTracks;
    videoTracks.forEach(publication => {
      if (enabled) {
        publication.track.enable();
      } else {
        publication.track.disable();
      }
    });

    console.log('📹 [TwilioRoomManager] Video', enabled ? 'enabled' : 'disabled');
  }

  /**
   * Get current room
   */
  getRoom(): Room | null {
    return this.room;
  }

  /**
   * Get local participant
   */
  getLocalParticipant(): LocalParticipant | null {
    return this.room?.localParticipant ?? null;
  }

  /**
   * Get all participants
   */
  getParticipants(): TwilioParticipantInfo[] {
    if (!this.room) return [];

    const participants: TwilioParticipantInfo[] = [
      this.mapParticipantInfo(this.room.localParticipant, true)
    ];

    this.room.participants.forEach(participant => {
      participants.push(this.mapParticipantInfo(participant, false));
    });

    return participants;
  }

  /**
   * Map participant to info object
   */
  private mapParticipantInfo(
    participant: LocalParticipant | RemoteParticipant,
    isLocal: boolean
  ): TwilioParticipantInfo {
    const audioTrack = Array.from(participant.audioTracks.values())[0];
    const videoTrack = Array.from(participant.videoTracks.values())[0];

    return {
      identity: participant.identity,
      sid: participant.sid,
      isLocal,
      state: participant.state,
      networkQualityLevel: participant.networkQualityLevel,
      audioTrackEnabled: audioTrack?.track?.isEnabled ?? false,
      videoTrackEnabled: videoTrack?.track?.isEnabled ?? false
    };
  }

  /**
   * Register event listener
   */
  on(eventType: TwilioRoomEvent['type'], callback: (event: TwilioRoomEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(callback);
  }

  /**
   * Unregister event listener
   */
  off(eventType: TwilioRoomEvent['type'], callback: (event: TwilioRoomEvent) => void): void {
    this.eventListeners.get(eventType)?.delete(callback);
  }

  /**
   * Emit event to listeners
   */
  private emitEvent(event: TwilioRoomEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(callback => callback(event));
    }
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return this.room?.state === 'connected';
  }

  /**
   * Check if currently reconnecting
   */
  isReconnecting(): boolean {
    return this.reconnecting;
  }
}

// Singleton instance
let roomManagerInstance: TwilioRoomManager | null = null;

/**
 * Get singleton room manager instance
 */
export function getRoomManager(): TwilioRoomManager {
  if (!roomManagerInstance) {
    roomManagerInstance = new TwilioRoomManager();
  }
  return roomManagerInstance;
}

/**
 * Reset room manager (useful for testing)
 */
export function resetRoomManager(): void {
  if (roomManagerInstance) {
    roomManagerInstance.disconnect();
    roomManagerInstance = null;
  }
}

