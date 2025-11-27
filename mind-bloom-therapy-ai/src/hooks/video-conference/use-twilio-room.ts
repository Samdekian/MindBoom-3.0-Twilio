/**
 * useTwilioRoom Hook
 * React hook for managing Twilio Video room connections
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Room } from 'twilio-video';
import { getRoomManager } from '@/lib/twilio/room-manager';
import { TwilioVideoService } from '@/services/twilio-video-service';
import type {
  TwilioRoomOptions,
  TwilioParticipantInfo,
  TwilioRoomStatus,
  TwilioRoomEvent
} from '@/types/twilio';
import { useToast } from '@/hooks/use-toast';

interface UseTwilioRoomOptions {
  sessionId: string;
  participantName: string;
  autoConnect?: boolean;
}

interface UseTwilioRoomReturn {
  room: Room | null;
  status: TwilioRoomStatus;
  participants: TwilioParticipantInfo[];
  localParticipant: TwilioParticipantInfo | null;
  dominantSpeaker: string | null;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  networkQuality: number;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  refreshToken: () => Promise<void>;
}

export function useTwilioRoom(options: UseTwilioRoomOptions): UseTwilioRoomReturn {
  const { sessionId, participantName, autoConnect = false } = options;
  const { toast } = useToast();
  
  const [room, setRoom] = useState<Room | null>(null);
  const [status, setStatus] = useState<TwilioRoomStatus>('idle');
  const [participants, setParticipants] = useState<TwilioParticipantInfo[]>([]);
  const [localParticipant, setLocalParticipant] = useState<TwilioParticipantInfo | null>(null);
  const [dominantSpeaker, setDominantSpeaker] = useState<string | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [networkQuality, setNetworkQuality] = useState(5);
  const [error, setError] = useState<string | null>(null);
  
  const roomManagerRef = useRef(getRoomManager());
  const tokenDataRef = useRef<any>(null);
  const roomNameRef = useRef<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Handle room events
   */
  const handleRoomEvent = useCallback((event: TwilioRoomEvent) => {
    console.log('🎥 [useTwilioRoom] Room event:', event.type);

    switch (event.type) {
      case 'participantConnected':
        if (event.participant) {
          setParticipants(prev => [...prev, event.participant!]);
          toast({
            title: 'Participant joined',
            description: `${event.participant.identity} joined the session`
          });
        }
        break;

      case 'participantDisconnected':
        if (event.participant) {
          setParticipants(prev => prev.filter(p => p.sid !== event.participant!.sid));
          toast({
            title: 'Participant left',
            description: `${event.participant.identity} left the session`
          });
        }
        break;

      case 'dominantSpeakerChanged':
        if (event.participant) {
          setDominantSpeaker(event.participant.identity);
        }
        break;

      case 'networkQualityLevelChanged':
        if (event.data?.networkQualityLevel !== undefined) {
          setNetworkQuality(event.data.networkQualityLevel);
        }
        break;

      case 'reconnecting':
        setStatus('reconnecting');
        toast({
          title: 'Reconnecting...',
          description: 'Connection lost, attempting to reconnect',
          variant: 'default'
        });
        break;

      case 'reconnected':
        setStatus('connected');
        toast({
          title: 'Reconnected',
          description: 'Connection restored',
        });
        break;

      case 'disconnected':
        setStatus('disconnected');
        setRoom(null);
        break;
    }
  }, [toast]);

  /**
   * Connect to room
   */
  const connect = useCallback(async () => {
    if (status === 'connecting' || status === 'connected') {
      console.warn('⚠️ [useTwilioRoom] Already connecting or connected');
      return;
    }

    try {
      setStatus('connecting');
      setError(null);

      // Get room name
      const roomName = await TwilioVideoService.getOrCreateRoomForSession(sessionId);
      roomNameRef.current = roomName;

      // Get access token
      const tokenData = await TwilioVideoService.getAccessToken(participantName, roomName);
      tokenDataRef.current = tokenData;

      // Create or get participant record
      await TwilioVideoService.getOrCreateParticipant(sessionId, participantName);

      // Connect to room
      const roomOptions: TwilioRoomOptions = {
        roomName,
        token: tokenData.token,
        audio: true,
        video: true,
        networkQuality: true,
        dominantSpeaker: true
      };

      const connectedRoom = await roomManagerRef.current.connect(roomOptions);
      setRoom(connectedRoom);
      setStatus('connected');

      // Update participants
      const allParticipants = roomManagerRef.current.getParticipants();
      setParticipants(allParticipants);
      setLocalParticipant(allParticipants.find(p => p.isLocal) || null);

      // Log connection
      await TwilioVideoService.logSessionEvent(sessionId, 'participant_connected', {
        participant_name: participantName,
        room_name: roomName
      });

      toast({
        title: 'Connected',
        description: 'Successfully connected to video session'
      });

    } catch (err: any) {
      console.error('❌ [useTwilioRoom] Connection failed:', err);
      setStatus('failed');
      setError(err.message || 'Failed to connect');
      
      toast({
        title: 'Connection failed',
        description: err.message || 'Failed to connect to video session',
        variant: 'destructive'
      });
    }
  }, [sessionId, participantName, status, toast]);

  /**
   * Disconnect from room
   */
  const disconnect = useCallback(() => {
    console.log('🔌 [useTwilioRoom] Disconnecting...');
    
    roomManagerRef.current.disconnect();
    setRoom(null);
    setStatus('disconnected');
    setParticipants([]);
    setLocalParticipant(null);
    setDominantSpeaker(null);

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Log disconnection
    if (sessionId) {
      TwilioVideoService.logSessionEvent(sessionId, 'participant_disconnected', {
        participant_name: participantName
      });
    }
  }, [sessionId, participantName]);

  /**
   * Toggle audio
   */
  const toggleAudio = useCallback(() => {
    const newState = !isAudioEnabled;
    roomManagerRef.current.toggleAudio(newState);
    setIsAudioEnabled(newState);
    
    TwilioVideoService.logSessionEvent(sessionId, `audio_${newState ? 'enabled' : 'disabled'}`);
  }, [isAudioEnabled, sessionId]);

  /**
   * Toggle video
   */
  const toggleVideo = useCallback(() => {
    const newState = !isVideoEnabled;
    roomManagerRef.current.toggleVideo(newState);
    setIsVideoEnabled(newState);
    
    TwilioVideoService.logSessionEvent(sessionId, `video_${newState ? 'enabled' : 'disabled'}`);
  }, [isVideoEnabled, sessionId]);

  /**
   * Refresh token
   */
  const refreshToken = useCallback(async () => {
    if (!tokenDataRef.current || !roomNameRef.current) return;

    try {
      const newTokenData = await TwilioVideoService.validateAndRefreshToken(
        tokenDataRef.current,
        participantName,
        roomNameRef.current
      );

      tokenDataRef.current = newTokenData;
      console.log('✅ [useTwilioRoom] Token refreshed');

    } catch (err) {
      console.error('❌ [useTwilioRoom] Token refresh failed:', err);
    }
  }, [participantName]);

  /**
   * Setup event listeners
   */
  useEffect(() => {
    const manager = roomManagerRef.current;
    
    manager.on('participantConnected', handleRoomEvent);
    manager.on('participantDisconnected', handleRoomEvent);
    manager.on('dominantSpeakerChanged', handleRoomEvent);
    manager.on('networkQualityLevelChanged', handleRoomEvent);
    manager.on('reconnecting', handleRoomEvent);
    manager.on('reconnected', handleRoomEvent);
    manager.on('disconnected', handleRoomEvent);

    return () => {
      manager.off('participantConnected', handleRoomEvent);
      manager.off('participantDisconnected', handleRoomEvent);
      manager.off('dominantSpeakerChanged', handleRoomEvent);
      manager.off('networkQualityLevelChanged', handleRoomEvent);
      manager.off('reconnecting', handleRoomEvent);
      manager.off('reconnected', handleRoomEvent);
      manager.off('disconnected', handleRoomEvent);
    };
  }, [handleRoomEvent]);

  /**
   * Auto-connect if requested
   */
  useEffect(() => {
    if (autoConnect && status === 'idle') {
      connect();
    }
  }, [autoConnect, status, connect]);

  /**
   * Setup token refresh interval
   */
  useEffect(() => {
    if (status !== 'connected') return;

    const interval = setInterval(() => {
      refreshToken();
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [status, refreshToken]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    room,
    status,
    participants,
    localParticipant,
    dominantSpeaker,
    isAudioEnabled,
    isVideoEnabled,
    networkQuality,
    error,
    connect,
    disconnect,
    toggleAudio,
    toggleVideo,
    refreshToken
  };
}

