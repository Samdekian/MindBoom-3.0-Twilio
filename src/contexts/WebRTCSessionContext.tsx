import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuthRBAC } from './AuthRBACContext';
import { useToast } from '@/hooks/use-toast';
import { WebRTCManager } from '@/lib/webrtc/webrtc-manager';
import { useSessionParticipants } from '@/hooks/use-session-participants';
import { useMediaDevices } from '@/hooks/webrtc/useMediaDevices';
import { useUnifiedPermissionHandler } from '@/hooks/video-conference/use-unified-permission-handler';
import { 
  ParticipantInfo, 
  VideoDevices, 
  SessionStatus, 
  CameraStatus, 
  StreamDebugInfo,
  VideoSessionState,
  ConnectionQuality
} from '@/types/video-session';

export interface WebRTCSessionContextType {
  // Core session state
  videoState: VideoSessionState;
  isInSession: boolean;
  sessionDuration: string;
  connectionState: 'IDLE' | 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'FAILED';
  
  // Participant info
  therapistInfo: ParticipantInfo | null;
  patientInfo: ParticipantInfo | null;
  isTherapist: boolean;
  participants: ParticipantInfo[];
  
  // Media streams
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  localStream: MediaStream | null;
  remoteStreams: MediaStream[];
  
  // Session controls
  joinSession: () => Promise<void>;
  leaveSession: () => Promise<void>;
  reconnectSession: () => Promise<void>;
  
  // Media controls
  toggleVideo: () => Promise<boolean>;
  toggleAudio: () => Promise<boolean>;
  toggleScreenSharing: () => Promise<boolean>;
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
  showSessionSummary: boolean;
  setShowSessionSummary: (show: boolean) => void;
  
  // Session status
  sessionStatus: SessionStatus;
  cameraStatus: CameraStatus;
  streamDebugInfo: StreamDebugInfo;
  
  // AI Integration
  toggleAI: () => Promise<void>;
  sendAIMessage: (message: string) => void;
  
  // Utility functions
  formatSessionDuration: (seconds?: number) => string;
}

const WebRTCSessionContext = createContext<WebRTCSessionContextType | undefined>(undefined);

interface WebRTCSessionProviderProps {
  children: React.ReactNode;
  sessionId?: string;
  sessionType?: 'appointment' | 'instant';
}

export const WebRTCSessionProvider: React.FC<WebRTCSessionProviderProps> = ({
  children,
  sessionId,
  sessionType = 'appointment'
}) => {
  const { user, isTherapist } = useAuthRBAC();
  const { toast } = useToast();
  
  // WebRTC Manager
  const webrtcManagerRef = useRef<WebRTCManager | null>(null);
  const [isInSession, setIsInSession] = useState(false);
  const [connectionState, setConnectionState] = useState<'IDLE' | 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'FAILED'>('IDLE');
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionDuration, setSessionDuration] = useState('00:00');
  
  // Media streams
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([]);
  
  // Video refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  // UI state
  const [deviceSettingsOpen, setDeviceSettingsOpen] = useState(false);
  const [showSessionSummary, setShowSessionSummary] = useState(false);
  
  // Initialize participants and permissions
  const { participants } = useSessionParticipants(sessionId || null);
  const { 
    permissionState, 
    requestPermissions: unifiedRequestPermissions 
  } = useUnifiedPermissionHandler();
  
  const {
    cameras,
    microphones,
    speakers,
    isLoading: devicesLoading,
    error: devicesError,
  } = useMediaDevices(permissionState.bothGranted);

  // Session duration timer
  useEffect(() => {
    if (!sessionStartTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000);
      const minutes = Math.floor(diff / 60);
      const seconds = diff % 60;
      setSessionDuration(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  // Initialize WebRTC Manager
  useEffect(() => {
    if (!sessionId || !user?.id) return;

    const manager = new WebRTCManager({
      sessionId,
      userId: user.id,
      onRemoteStream: (stream, userId) => {
        console.log('📺 [WebRTCSession] Remote stream received from', userId);
        setRemoteStreams(prev => [...prev.filter(s => s.id !== stream.id), stream]);
      },
      onConnectionStateChange: (state, userId) => {
        console.log('🔗 [WebRTCSession] Connection state:', state, 'for', userId);
        
        // Update overall connection state based on peer states
        const states = manager.getConnectionStates();
        const hasConnected = Object.values(states).some(s => s === 'connected');
        const hasConnecting = Object.values(states).some(s => s === 'connecting');
        const hasFailed = Object.values(states).some(s => s === 'failed');
        
        if (hasFailed) {
          setConnectionState('FAILED');
        } else if (hasConnected) {
          setConnectionState('CONNECTED');
        } else if (hasConnecting) {
          setConnectionState('CONNECTING');
        } else {
          setConnectionState('DISCONNECTED');
        }
      }
    });

    webrtcManagerRef.current = manager;

    return () => {
      manager.destroy();
      webrtcManagerRef.current = null;
    };
  }, [sessionId, user?.id]);

  // Connect video refs to streams
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStreams.length > 0) {
      remoteVideoRef.current.srcObject = remoteStreams[0];
    }
  }, [remoteStreams]);

  // Session controls
  const joinSession = useCallback(async () => {
    try {
      console.log('🚀 [WebRTCSession] Starting session join process...');
      
      if (!webrtcManagerRef.current) {
        throw new Error('WebRTC manager not initialized');
      }

      setConnectionState('CONNECTING');

      // Check permissions
      if (!permissionState.realCameraAccess || !permissionState.realMicrophoneAccess) {
        console.log('🔒 [WebRTCSession] Requesting permissions...');
        const granted = await unifiedRequestPermissions();
        if (!granted) {
          throw new Error('Camera and microphone access is required to join the session');
        }
      }

      // Initialize WebRTC manager
      const initialized = await webrtcManagerRef.current.initialize();
      if (!initialized) {
        throw new Error('Failed to initialize WebRTC connection');
      }

      // Get local stream
      const stream = await webrtcManagerRef.current.getLocalStream();
      if (!stream) {
        throw new Error('Failed to access camera and microphone');
      }

      setLocalStream(stream);
      setIsInSession(true);
      setSessionStartTime(new Date());
      setConnectionState('CONNECTED');

      console.log('✅ [WebRTCSession] Successfully joined session');
      toast({
        title: "Session Joined",
        description: "Successfully connected to video session"
      });
    } catch (error) {
      console.error('❌ [WebRTCSession] Failed to join session:', error);
      setConnectionState('FAILED');
      toast({
        title: "Join Failed",
        description: error instanceof Error ? error.message : "Failed to join session",
        variant: "destructive"
      });
    }
  }, [permissionState, unifiedRequestPermissions, toast]);

  const leaveSession = useCallback(async () => {
    try {
      console.log('👋 [WebRTCSession] Leaving session...');
      
      if (webrtcManagerRef.current) {
        await webrtcManagerRef.current.destroy();
      }

      setLocalStream(null);
      setRemoteStreams([]);
      setIsInSession(false);
      setSessionStartTime(null);
      setSessionDuration('00:00');
      setConnectionState('IDLE');

      toast({
        title: "Session Ended",
        description: "You have left the video session"
      });
    } catch (error) {
      console.error('❌ [WebRTCSession] Failed to leave session:', error);
      toast({
        title: "Error",
        description: "There was an issue leaving the session",
        variant: "destructive"
      });
    }
  }, [toast]);

  const reconnectSession = useCallback(async () => {
    try {
      console.log('🔄 [WebRTCSession] Reconnecting...');
      await leaveSession();
      await joinSession();
      
      toast({
        title: "Reconnected",
        description: "Session connection restored"
      });
    } catch (error) {
      console.error('❌ [WebRTCSession] Reconnection failed:', error);
      toast({
        title: "Reconnection Failed",
        description: "Unable to restore connection",
        variant: "destructive"
      });
    }
  }, [joinSession, leaveSession, toast]);

  // Media controls
  const toggleVideo = useCallback(async (): Promise<boolean> => {
    if (!webrtcManagerRef.current) return false;
    return await webrtcManagerRef.current.toggleVideo();
  }, []);

  const toggleAudio = useCallback(async (): Promise<boolean> => {
    if (!webrtcManagerRef.current) return false;
    return await webrtcManagerRef.current.toggleAudio();
  }, []);

  const toggleScreenSharing = useCallback(async (): Promise<boolean> => {
    // TODO: Implement screen sharing
    console.log('🖥️ [WebRTCSession] Screen sharing not yet implemented');
    return false;
  }, []);

  const toggleRecording = useCallback(async (): Promise<boolean> => {
    if (!webrtcManagerRef.current || !localStream) return false;
    
    // Advanced recording will be implemented with AdvancedRecorder
    console.log('🎥 [WebRTCSession] Advanced recording system ready');
    return true;
  }, [localStream]);

  // Device management
  const changeDevice = useCallback(async (type: 'camera' | 'microphone' | 'speaker', deviceId: string) => {
    try {
      if (!webrtcManagerRef.current) return;

      // Get new constraints based on device type
      const constraints: MediaStreamConstraints = {
        video: type === 'camera' ? { deviceId: { exact: deviceId } } : true,
        audio: type === 'microphone' ? { deviceId: { exact: deviceId } } : true
      };

      // Get new stream with updated device
      const newStream = await webrtcManagerRef.current.getLocalStream(constraints);
      if (newStream) {
        setLocalStream(newStream);
        toast({
          title: "Device Changed",
          description: `${type} successfully changed`
        });
      }
    } catch (error) {
      console.error(`❌ [WebRTCSession] Failed to change ${type}:`, error);
      toast({
        title: "Device Change Failed",
        description: `Failed to change ${type}`,
        variant: "destructive"
      });
    }
  }, [toast]);

  const testDevices = useCallback(async (): Promise<boolean> => {
    try {
      const testStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      testStream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('❌ [WebRTCSession] Device test failed:', error);
      return false;
    }
  }, []);

  // Participant info
  const therapistInfo: ParticipantInfo | null = participants.find(p => p.role === 'host') ? {
    id: participants.find(p => p.role === 'host')?.user_id || '',
    name: participants.find(p => p.role === 'host')?.participant_name || 'Therapist',
    role: 'therapist',
    isVideoEnabled: true,
    isAudioEnabled: true,
    isCurrentUser: participants.find(p => p.role === 'host')?.user_id === user?.id
  } : null;

  const patientInfo: ParticipantInfo | null = participants.find(p => p.role === 'participant' && p.user_id !== therapistInfo?.id) ? {
    id: participants.find(p => p.role === 'participant' && p.user_id !== therapistInfo?.id)?.user_id || '',
    name: participants.find(p => p.role === 'participant' && p.user_id !== therapistInfo?.id)?.participant_name || 'Patient',
    role: 'patient',
    isVideoEnabled: true,
    isAudioEnabled: true,
    isCurrentUser: participants.find(p => p.role === 'participant' && p.user_id !== therapistInfo?.id)?.user_id === user?.id
  } : null;

  const processedParticipants: ParticipantInfo[] = participants.map(p => ({
    id: p.user_id || p.id,
    name: p.participant_name || 'Anonymous',
    role: p.role,
    isVideoEnabled: true,
    isAudioEnabled: true,
    isCurrentUser: p.user_id === user?.id
  }));

  // Status calculations
  const sessionStatus: SessionStatus = (() => {
    if (devicesLoading) return 'initializing';
    if (devicesError) return 'failed';
    if (!isInSession) return 'waiting';
    
    switch (connectionState) {
      case 'CONNECTING': return 'connecting';
      case 'CONNECTED': return 'connected';
      case 'DISCONNECTED': return 'reconnecting';
      case 'FAILED': return 'failed';
      default: return 'waiting';
    }
  })();

  const cameraStatus: CameraStatus = (() => {
    if (permissionState.isChecking || devicesLoading) return 'requesting';
    if (devicesError) return 'denied';
    if (permissionState.camera === 'denied' || permissionState.microphone === 'denied') {
      return 'permission-denied';
    }
    if (!permissionState.realCameraAccess || !permissionState.realMicrophoneAccess) {
      return 'permission-denied';
    }
    if (cameras.length === 0) return 'unavailable';
    return 'available';
  })();

  const streamDebugInfo: StreamDebugInfo = {
    localStream: !!localStream,
    remoteStreams: remoteStreams.length,
    connectionState: connectionState,
    hasVideo: !!localStream && localStream.getVideoTracks().length > 0,
    hasAudio: !!localStream && localStream.getAudioTracks().length > 0,
    videoTrackCount: localStream?.getVideoTracks().length || 0,
    audioTrackCount: localStream?.getAudioTracks().length || 0,
    lastUpdated: new Date().toISOString()
  };

  const videoState: VideoSessionState = {
    isVideoEnabled: localStream?.getVideoTracks()[0]?.enabled ?? false,
    isAudioEnabled: localStream?.getAudioTracks()[0]?.enabled ?? false,
    isScreenSharing: false,
    isRecording: false,
    isChatOpen: false,
    connectionQuality: connectionState === 'CONNECTED' ? 'good' : 'poor',
    sessionDuration: sessionDuration,
    aiEnabled: false,
    aiConnected: false,
    aiResponding: false
  };

  // AI Integration
  const toggleAI = useCallback(async () => {
    // AI toggle will be handled by components that use this context
    console.log('AI toggle not yet implemented in WebRTC context');
  }, []);

  const sendAIMessage = useCallback((message: string) => {
    // AI messaging will be handled by components that use this context
    console.log('AI Message:', message);
  }, []);

  const formatSessionDuration = useCallback((seconds?: number): string => {
    if (typeof seconds === 'number') {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return sessionDuration;
  }, [sessionDuration]);

  const contextValue: WebRTCSessionContextType = {
    videoState,
    isInSession,
    sessionDuration,
    connectionState,
    therapistInfo,
    patientInfo,
    isTherapist,
    participants: processedParticipants,
    localVideoRef,
    remoteVideoRef,
    localStream,
    remoteStreams,
    joinSession,
    leaveSession,
    reconnectSession,
    toggleVideo,
    toggleAudio,
    toggleScreenSharing,
    toggleRecording,
    cameras: cameras as MediaDeviceInfo[],
    microphones: microphones as MediaDeviceInfo[],
    speakers: speakers as MediaDeviceInfo[],
    changeDevice,
    testDevices,
    deviceSettingsOpen,
    setDeviceSettingsOpen,
    showSessionSummary,
    setShowSessionSummary,
    sessionStatus,
    cameraStatus,
    streamDebugInfo,
    toggleAI,
    sendAIMessage,
    formatSessionDuration
  };

  return (
    <WebRTCSessionContext.Provider value={contextValue}>
      {children}
    </WebRTCSessionContext.Provider>
  );
};

export const useWebRTCSession = (): WebRTCSessionContextType => {
  const context = useContext(WebRTCSessionContext);
  if (context === undefined) {
    throw new Error('useWebRTCSession must be used within a WebRTCSessionProvider');
  }
  return context;
};

// For compatibility with existing code
export const useVideoSession = useWebRTCSession;