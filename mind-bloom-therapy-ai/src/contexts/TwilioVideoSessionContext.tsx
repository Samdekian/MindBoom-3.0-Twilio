/**
 * Twilio Video Session Context
 * Unified video session provider using Twilio Video for all sessions (main + breakout)
 * Replaces the custom WebRTC implementation with a simpler, more reliable solution
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { Room, LocalParticipant, RemoteParticipant } from 'twilio-video';
import { useAuthRBAC } from './AuthRBACContext';
import { useToast } from '@/hooks/use-toast';
import { getRoomManager, TwilioRoomManager } from '@/lib/twilio/room-manager';
import { TwilioVideoService } from '@/services/twilio-video-service';
import { supabase } from '@/integrations/supabase/client';
import type { TwilioRoomStatus, TwilioParticipantInfo, TwilioRoomEvent } from '@/types/twilio';
import type {
  ParticipantInfo,
  SessionStatus,
  CameraStatus,
  StreamDebugInfo,
  VideoSessionState,
  ConnectionQuality
} from '@/types/video-session';

// Map Twilio status to our connection state
type ConnectionState = 'IDLE' | 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'FAILED';

const mapTwilioStatusToConnectionState = (status: TwilioRoomStatus): ConnectionState => {
  switch (status) {
    case 'idle': return 'IDLE';
    case 'connecting': return 'CONNECTING';
    case 'connected': return 'CONNECTED';
    case 'reconnecting': return 'CONNECTING';
    case 'disconnected': return 'DISCONNECTED';
    case 'failed': return 'FAILED';
    default: return 'IDLE';
  }
};

const mapNetworkQualityToConnectionQuality = (level: number | null): ConnectionQuality => {
  if (level === null) return 'disconnected';
  if (level >= 4) return 'excellent';
  if (level >= 3) return 'good';
  if (level >= 2) return 'fair';
  return 'poor';
};

export interface TwilioVideoSessionContextType {
  // Twilio Room
  room: Room | null;
  
  // Core session state
  videoState: VideoSessionState;
  isInSession: boolean;
  sessionDuration: string;
  connectionState: ConnectionState;
  
  // Media state
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  
  // Participant info
  therapistInfo: ParticipantInfo | null;
  patientInfo: ParticipantInfo | null;
  isTherapist: boolean;
  participants: ParticipantInfo[];
  twilioParticipants: TwilioParticipantInfo[];
  
  // Media refs (for backward compatibility - Twilio handles this internally)
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  localStream: MediaStream | null;
  remoteStreams: MediaStream[];
  connectedPeers: string[];
  
  // Session controls
  joinSession: () => Promise<void>;
  leaveSession: () => Promise<void>;
  reconnectSession: () => Promise<void>;
  
  // Media controls
  toggleVideo: () => Promise<boolean>;
  toggleAudio: () => Promise<boolean>;
  toggleScreenSharing: () => Promise<boolean>;
  toggleScreenShare: () => Promise<boolean>;
  toggleRecording: () => Promise<boolean>;
  
  // Device management
  cameras: MediaDeviceInfo[];
  microphones: MediaDeviceInfo[];
  speakers: MediaDeviceInfo[];
  changeDevice: (type: 'camera' | 'microphone' | 'speaker', deviceId: string) => Promise<void>;
  testDevices: () => Promise<boolean>;
  
  // UI state
  deviceSettingsOpen: boolean;
  setDeviceSettingsOpen: (open: boolean) => void;
  waitingRoomActive: boolean;
  showSessionSummary: boolean;
  setShowSessionSummary: (show: boolean) => void;
  deviceSwitching: boolean;
  
  // Session status
  sessionStatus: SessionStatus;
  cameraStatus: CameraStatus;
  streamDebugInfo: StreamDebugInfo;
  networkQuality: number;
  dominantSpeaker: string | null;
  error: string | null;
  
  // Utility functions
  formatSessionDuration: (seconds?: number) => string;
}

const TwilioVideoSessionContext = createContext<TwilioVideoSessionContextType | undefined>(undefined);

interface TwilioVideoSessionProviderProps {
  children: React.ReactNode;
  sessionId?: string;
  sessionType?: 'appointment' | 'instant';
}

export const TwilioVideoSessionProvider: React.FC<TwilioVideoSessionProviderProps> = ({
  children,
  sessionId,
  sessionType = 'instant'
}) => {
  const { user, isTherapist: userIsTherapist, isAuthenticated } = useAuthRBAC();
  const { toast } = useToast();
  
  // Twilio state
  const [room, setRoom] = useState<Room | null>(null);
  const [status, setStatus] = useState<TwilioRoomStatus>('idle');
  const [twilioParticipants, setTwilioParticipants] = useState<TwilioParticipantInfo[]>([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [networkQuality, setNetworkQuality] = useState(5);
  const [dominantSpeaker, setDominantSpeaker] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Session timing
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionDurationSeconds, setSessionDurationSeconds] = useState(0);
  
  // UI state
  const [deviceSettingsOpen, setDeviceSettingsOpen] = useState(false);
  const [showSessionSummary, setShowSessionSummary] = useState(false);
  
  // Device lists
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [speakers, setSpeakers] = useState<MediaDeviceInfo[]>([]);
  
  // Refs
  const roomManagerRef = useRef<TwilioRoomManager>(getRoomManager());
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  // Computed values
  const isInSession = status === 'connected';
  const connectionState = mapTwilioStatusToConnectionState(status);
  
  const participantName = user?.user_metadata?.fullName || user?.email?.split('@')[0] || 'Anonymous';
  
  // Format session duration
  const formatSessionDuration = useCallback((seconds?: number): string => {
    const totalSeconds = seconds ?? sessionDurationSeconds;
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, [sessionDurationSeconds]);
  
  // Session duration timer
  useEffect(() => {
    if (!sessionStartTime || !isInSession) return;
    
    const interval = setInterval(() => {
      setSessionDurationSeconds(Math.floor((Date.now() - sessionStartTime.getTime()) / 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [sessionStartTime, isInSession]);

  // Map Twilio participants to ParticipantInfo
  const participants: ParticipantInfo[] = twilioParticipants.map(p => ({
    id: p.sid,
    name: p.identity,
    role: p.isLocal && userIsTherapist ? 'therapist' : 'patient',
    isVideoEnabled: p.videoTrackEnabled,
    isAudioEnabled: p.audioTrackEnabled,
    isCurrentUser: p.isLocal,
    connectionQuality: mapNetworkQualityToConnectionQuality(p.networkQualityLevel)
  }));
  
  const therapistInfo = participants.find(p => p.role === 'therapist') || null;
  const patientInfo = participants.find(p => p.role === 'patient') || null;
  
  // Video state object
  const videoState: VideoSessionState = {
    isVideoEnabled,
    isAudioEnabled,
    isScreenSharing: false,
    isRecording: false,
    isChatOpen: false,
    connectionQuality: mapNetworkQualityToConnectionQuality(networkQuality),
    sessionDuration: formatSessionDuration()
  };
  
  // Session status
  const sessionStatus: SessionStatus = (() => {
    switch (status) {
      case 'idle': return 'waiting';
      case 'connecting': return 'connecting';
      case 'connected': return 'connected';
      case 'reconnecting': return 'reconnecting';
      case 'disconnected': return 'ended';
      case 'failed': return 'failed';
      default: return 'waiting';
    }
  })();
  
  const cameraStatus: CameraStatus = 'available';
  
  const streamDebugInfo: StreamDebugInfo = {
    localStream: isInSession,
    remoteStreams: twilioParticipants.filter(p => !p.isLocal).length,
    connectionState,
    hasVideo: isVideoEnabled,
    hasAudio: isAudioEnabled,
    videoTrackCount: isVideoEnabled ? 1 : 0,
    audioTrackCount: isAudioEnabled ? 1 : 0,
    lastUpdated: new Date().toISOString()
  };

  // Handle Twilio room events
  const handleRoomEvent = useCallback((event: TwilioRoomEvent) => {
    console.log('🎥 [TwilioVideoSession] Room event:', event.type);

    switch (event.type) {
      case 'participantConnected':
        if (event.participant) {
          setTwilioParticipants(prev => [...prev, event.participant!]);
          toast({
            title: 'Participant joined',
            description: `${event.participant.identity} joined the session`
          });
        }
        break;

      case 'participantDisconnected':
        if (event.participant) {
          setTwilioParticipants(prev => prev.filter(p => p.sid !== event.participant!.sid));
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

      case 'connected':
        console.log('✅ [TwilioVideoSession] Connected event - setting status to connected');
        setStatus('connected');
        break;

      case 'reconnecting':
        setStatus('reconnecting');
        toast({
          title: 'Reconnecting...',
          description: 'Connection lost, attempting to reconnect'
        });
        break;

      case 'reconnected':
        setStatus('connected');
        toast({
          title: 'Reconnected',
          description: 'Connection restored'
        });
        break;

      case 'disconnected':
        setStatus('disconnected');
        setRoom(null);
        break;
    }
  }, [toast]);

  // Setup event listeners
  useEffect(() => {
    const manager = roomManagerRef.current;
    
    const eventTypes: TwilioRoomEvent['type'][] = [
      'participantConnected',
      'participantDisconnected',
      'dominantSpeakerChanged',
      'networkQualityLevelChanged',
      'connected',
      'reconnecting',
      'reconnected',
      'disconnected'
    ];
    
    eventTypes.forEach(type => manager.on(type, handleRoomEvent));
    
    return () => {
      eventTypes.forEach(type => manager.off(type, handleRoomEvent));
    };
  }, [handleRoomEvent]);

  // Enumerate devices
  useEffect(() => {
    const enumerateDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setCameras(devices.filter(d => d.kind === 'videoinput'));
        setMicrophones(devices.filter(d => d.kind === 'audioinput'));
        setSpeakers(devices.filter(d => d.kind === 'audiooutput'));
      } catch (err) {
        console.error('Failed to enumerate devices:', err);
      }
    };
    
    enumerateDevices();
    navigator.mediaDevices.addEventListener('devicechange', enumerateDevices);
    return () => navigator.mediaDevices.removeEventListener('devicechange', enumerateDevices);
  }, []);

  // Join session
  const joinSession = useCallback(async () => {
    if (!sessionId || !isAuthenticated || !user?.id) {
      toast({
        title: 'Cannot join session',
        description: 'Please log in to join the session',
        variant: 'destructive'
      });
      return;
    }

    if (status === 'connecting' || status === 'connected') {
      console.warn('⚠️ [TwilioVideoSession] Already connecting or connected');
      return;
    }

    try {
      setStatus('connecting');
      setError(null);

      // Get room name for session
      const roomName = await TwilioVideoService.getOrCreateRoomForSession(sessionId);

      // Get access token
      const tokenData = await TwilioVideoService.getAccessToken(participantName, roomName);

      // Register participant in database
      await TwilioVideoService.getOrCreateParticipant(sessionId, participantName);

      // Connect to Twilio room
      const connectedRoom = await roomManagerRef.current.connect({
        roomName,
        token: tokenData.token,
        audio: true,
        video: true,
        networkQuality: true,
        dominantSpeaker: true
      });

      setRoom(connectedRoom);
      setStatus('connected');
      setSessionStartTime(new Date());

      // Update participants
      const allParticipants = roomManagerRef.current.getParticipants();
      setTwilioParticipants(allParticipants);

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
      console.error('❌ [TwilioVideoSession] Connection failed:', err);
      setStatus('failed');
      setError(err.message || 'Failed to connect');
      
      toast({
        title: 'Connection failed',
        description: err.message || 'Failed to connect to video session',
        variant: 'destructive'
      });
    }
  }, [sessionId, isAuthenticated, user?.id, participantName, status, toast]);

  // Leave session
  const leaveSession = useCallback(async () => {
    console.log('🔌 [TwilioVideoSession] Leaving session...');
    
    roomManagerRef.current.disconnect();
    setRoom(null);
    setStatus('disconnected');
    setTwilioParticipants([]);
    setDominantSpeaker(null);
    setSessionStartTime(null);
    setSessionDurationSeconds(0);

    // Log disconnection
    if (sessionId) {
      await TwilioVideoService.logSessionEvent(sessionId, 'participant_disconnected', {
        participant_name: participantName
      });
    }

    toast({
      title: 'Session Ended',
      description: 'You have left the video session'
    });
  }, [sessionId, participantName, toast]);

  // Reconnect session
  const reconnectSession = useCallback(async () => {
    await leaveSession();
    await joinSession();
  }, [leaveSession, joinSession]);

  // Toggle video
  const toggleVideo = useCallback(async (): Promise<boolean> => {
    const newState = !isVideoEnabled;
    roomManagerRef.current.toggleVideo(newState);
    setIsVideoEnabled(newState);
    
    if (sessionId) {
      TwilioVideoService.logSessionEvent(sessionId, `video_${newState ? 'enabled' : 'disabled'}`);
    }
    
    return newState;
  }, [isVideoEnabled, sessionId]);

  // Toggle audio
  const toggleAudio = useCallback(async (): Promise<boolean> => {
    const newState = !isAudioEnabled;
    roomManagerRef.current.toggleAudio(newState);
    setIsAudioEnabled(newState);
    
    if (sessionId) {
      TwilioVideoService.logSessionEvent(sessionId, `audio_${newState ? 'enabled' : 'disabled'}`);
    }
    
    return newState;
  }, [isAudioEnabled, sessionId]);

  // Toggle screen sharing (TODO: implement with Twilio screen share track)
  const toggleScreenSharing = useCallback(async (): Promise<boolean> => {
    console.log('Screen sharing not yet implemented in Twilio context');
    return false;
  }, []);

  // Toggle recording (TODO: implement with Twilio Compositions API)
  const toggleRecording = useCallback(async (): Promise<boolean> => {
    console.log('Recording not yet implemented in Twilio context');
    return false;
  }, []);

  // Change device (TODO: implement with Twilio track replacement)
  const changeDevice = useCallback(async (type: 'camera' | 'microphone' | 'speaker', deviceId: string) => {
    console.log(`Device change (${type}): ${deviceId} - not yet implemented`);
  }, []);

  // Test devices
  const testDevices = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Device test failed:', error);
      return false;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (roomManagerRef.current.isConnected()) {
        roomManagerRef.current.disconnect();
      }
    };
  }, []);

  const contextValue: TwilioVideoSessionContextType = {
    // Twilio Room
    room,
    
    // Core session state
    videoState,
    isInSession,
    sessionDuration: formatSessionDuration(),
    connectionState,
    
    // Media state
    isVideoEnabled,
    isAudioEnabled,
    
    // Participant info
    therapistInfo,
    patientInfo,
    isTherapist: userIsTherapist,
    participants,
    twilioParticipants,
    
    // Refs (for backward compatibility)
    localVideoRef,
    remoteVideoRef,
    localStream: null, // Twilio manages streams internally
    remoteStreams: [], // Use twilioParticipants instead
    connectedPeers: twilioParticipants.filter(p => !p.isLocal).map(p => p.sid),
    
    // Session controls
    joinSession,
    leaveSession,
    reconnectSession,
    
    // Media controls
    toggleVideo,
    toggleAudio,
    toggleScreenSharing,
    toggleScreenShare: toggleScreenSharing,
    toggleRecording,
    
    // Device management
    cameras,
    microphones,
    speakers,
    changeDevice,
    testDevices,
    
    // UI state
    deviceSettingsOpen,
    setDeviceSettingsOpen,
    waitingRoomActive: false,
    showSessionSummary,
    setShowSessionSummary,
    deviceSwitching: false,
    
    // Session status
    sessionStatus,
    cameraStatus,
    streamDebugInfo,
    networkQuality,
    dominantSpeaker,
    error,
    
    // Utility functions
    formatSessionDuration
  };

  return (
    <TwilioVideoSessionContext.Provider value={contextValue}>
      {children}
    </TwilioVideoSessionContext.Provider>
  );
};

export const useTwilioVideoSession = () => {
  const context = useContext(TwilioVideoSessionContext);
  if (context === undefined) {
    throw new Error('useTwilioVideoSession must be used within a TwilioVideoSessionProvider');
  }
  return context;
};

// Alias for backward compatibility with existing code
export const useVideoSession = useTwilioVideoSession;
export const VideoSessionProvider = TwilioVideoSessionProvider;

// Export types
export type {
  ParticipantInfo,
  SessionStatus,
  CameraStatus,
  StreamDebugInfo,
  VideoSessionState,
  ConnectionQuality
} from '@/types/video-session';


