import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { useSessionTimer } from '@/hooks/use-session-timer';
import { useVideoUIState } from '@/hooks/video-conference/use-video-ui-state';

// Advanced WebRTC Infrastructure Imports
import { usePeerConnectionCore } from '@/hooks/webrtc/usePeerConnectionCore';
import { useMediaDevices } from '@/hooks/webrtc/useMediaDevices';
import { useWebRTCSignaling } from '@/hooks/webrtc/useWebRTCSignaling';
import { useStreamExchange } from '@/hooks/webrtc/useStreamExchange';
import { useScreenSharing } from '@/hooks/webrtc/useScreenSharing';
import { usePeerConnectionEvents } from '@/hooks/webrtc/usePeerConnectionEvents';
import { supabase } from '@/integrations/supabase/client';

// Types
export type ConnectionQuality = "excellent" | "good" | "poor" | "disconnected";

export interface ParticipantInfo {
  id: string;
  name: string;
  role: 'therapist' | 'patient';
  avatar?: string;
  email?: string;
}

export interface AdvancedVideoSessionState {
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  isRecording: boolean;
  isChatOpen: boolean;
  connectionQuality: ConnectionQuality;
  selectedCamera: string | null;
  selectedMicrophone: string | null;
  selectedSpeaker: string | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
}

export interface AdvancedVideoSessionContextType {
  // Session state
  videoState: AdvancedVideoSessionState;
  isInSession: boolean;
  waitingRoomActive: boolean;
  sessionDuration: number;
  
  // Video refs
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  
  // Participant info
  therapistInfo: ParticipantInfo | null;
  patientInfo: ParticipantInfo | null;
  isTherapist: boolean;
  
  // Advanced device management
  cameras: Array<{ deviceId: string; label: string; kind: string; groupId: string }>;
  microphones: Array<{ deviceId: string; label: string; kind: string; groupId: string }>;
  speakers: Array<{ deviceId: string; label: string; kind: string; groupId: string }>;
  devicePermissions: boolean;
  requestPermissions: () => Promise<boolean>;
  changeDevice: (type: "camera" | "microphone" | "speaker", deviceId: string) => Promise<void>;
  testDevices: () => Promise<boolean>;
  
  // Advanced session controls
  joinSession: () => Promise<void>;
  leaveSession: () => void;
  toggleVideo: () => void;
  toggleAudio: () => void;
  toggleScreenShare: () => Promise<void>;
  toggleRecording: () => void;
  toggleChat: () => void;
  
  // WebRTC connection state
  connectionState: string;
  signalingState: { connected: boolean };
  
  // Waiting room (therapist only)
  admitFromWaitingRoom: () => void;
  
  // UI state
  formatSessionDuration: () => string;
  deviceSettingsOpen: boolean;
  setDeviceSettingsOpen: (open: boolean) => void;
  showSessionSummary: boolean;
  setShowSessionSummary: (show: boolean) => void;
}

const AdvancedVideoSessionContext = createContext<AdvancedVideoSessionContextType | undefined>(undefined);

interface AdvancedVideoSessionProviderProps {
  children: React.ReactNode;
  sessionId: string;
}

export const AdvancedVideoSessionProvider: React.FC<AdvancedVideoSessionProviderProps> = ({ 
  children, 
  sessionId 
}) => {
  // Basic session state
  const [isInSession, setIsInSession] = useState(false);
  const [waitingRoomActive, setWaitingRoomActive] = useState(false);
  const [isTherapist, setIsTherapist] = useState(false);
  
  // Advanced Video state
  const [videoState, setVideoState] = useState<AdvancedVideoSessionState>({
    isVideoEnabled: true,
    isAudioEnabled: true,
    isScreenSharing: false,
    isRecording: false,
    isChatOpen: false,
    connectionQuality: "good" as ConnectionQuality,
    selectedCamera: null,
    selectedMicrophone: null,
    selectedSpeaker: null,
    localStream: null,
    remoteStream: null,
  });

  // Get real participant info from session
  const [therapistInfo, setTherapistInfo] = useState<ParticipantInfo | null>(null);
  const [patientInfo, setPatientInfo] = useState<ParticipantInfo | null>(null);

  // Load participant info and determine user role on mount
  useEffect(() => {
    const loadParticipantInfo = async () => {
      try {
        // Get current user first
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get session details to find therapist
        const { data: session } = await supabase
          .from('instant_sessions')
          .select('therapist_id')
          .eq('id', sessionId)
          .single();

        if (session) {
          // Check if current user is the therapist
          const currentUserIsTherapist = user.id === session.therapist_id;
          setIsTherapist(currentUserIsTherapist);

          // Get therapist profile
          const { data: therapist } = await supabase
            .from('profiles')
            .select('id, full_name')
            .eq('id', session.therapist_id)
            .single();

          if (therapist) {
            setTherapistInfo({
              id: therapist.id,
              name: therapist.full_name || 'Therapist',
              role: 'therapist'
            });
          }
        }

        // Set current user as patient info (even if they're the therapist)
        setPatientInfo({
          id: user.id,
          name: user.user_metadata?.name || 'User',
          role: 'patient'
        });
      } catch (error) {
        console.error('Error loading participant info:', error);
      }
    };

    loadParticipantInfo();
  }, [sessionId]);

  // Video refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Advanced WebRTC Infrastructure
  const { sessionDuration, startTimer, stopTimer, formatSessionDuration } = useSessionTimer();
  const { 
    deviceSettingsOpen, 
    setDeviceSettingsOpen, 
    showSessionSummary, 
    setShowSessionSummary 
  } = useVideoUIState();

  // Core WebRTC peer connection management
  const {
    state: connectionState,
    setState: setConnectionState,
    peerConnectionRef,
    createPeerConnection,
    getConnectionQuality,
    getIceConnectionQuality,
    cleanup: cleanupPeerConnection
  } = usePeerConnectionCore();

  // Advanced device management - this is legacy, permissions should be handled elsewhere
  const {
    cameras,
    microphones,
    speakers,
    enumerateDevices
  } = useMediaDevices(false);
  
  // Legacy permission placeholders for interface compatibility
  const devicePermissions = false;
  const requestPermissions = async () => false;

  // Handle remote stream callback
  const handleRemoteStream = useCallback((stream: MediaStream) => {
    console.log('Received remote stream:', stream);
    setVideoState(prev => ({ ...prev, remoteStream: stream }));
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = stream;
    }
  }, []);

  // WebRTC signaling with real-time communication
  const {
    signalingState,
    initiateCall,
    sendSignal
  } = useWebRTCSignaling({
    sessionId,
    peerConnection: peerConnectionRef.current,
    onRemoteStream: handleRemoteStream
  });

  // Stream exchange for adding/removing tracks
  const {
    addLocalStream,
    replaceTrack
  } = useStreamExchange({
    peerConnection: peerConnectionRef.current,
    onRemoteStream: handleRemoteStream,
    localVideoRef,
    remoteVideoRef
  });

  // Screen sharing functionality
  const {
    startScreenSharing,
    stopScreenSharing,
    isScreenSharing: screenSharingActive
  } = useScreenSharing(
    peerConnectionRef.current,
    localVideoRef,
    setVideoState
  );

  // Set up peer connection events when we have a connection
  useEffect(() => {
    if (peerConnectionRef.current) {
      // TODO: Set up peer connection events
    }
  }, [peerConnectionRef.current]);

  // Update video state when connection state changes
  useEffect(() => {
    setVideoState(prev => ({
      ...prev,
      connectionQuality: connectionState.connectionQuality,
      localStream: connectionState.localStream,
      remoteStream: connectionState.remoteStream
    }));
  }, [connectionState]);

  // Advanced session controls
  const joinSession = useCallback(async () => {
    try {
      console.log('🚀 Joining advanced session...');
      
      // Media permissions should be handled by calling component
      console.log('📱 Assuming permissions already granted...');

      // Get user media stream
      console.log('🎥 Getting user media stream...');
      const constraints = {
        video: videoState.selectedCamera ? 
          { deviceId: { exact: videoState.selectedCamera } } : 
          { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: videoState.selectedMicrophone ? 
          { deviceId: { exact: videoState.selectedMicrophone } } : 
          { echoCancellation: true, noiseSuppression: true }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('✅ Got local stream:', stream);

      // Update local video element immediately
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true; // Prevent feedback
      }

      setVideoState(prev => ({ ...prev, localStream: stream }));

      // Initialize peer connection after we have the stream
      console.log('🔗 Creating peer connection...');
      const pc = createPeerConnection();
      if (!pc) {
        throw new Error('Failed to create peer connection');
      }

      // Add local stream to peer connection
      console.log('🔀 Adding local stream to peer connection...');
      await addLocalStream(stream);
      
      setIsInSession(true);
      setWaitingRoomActive(false);
      startTimer();

      // Initiate call if we're the caller (therapist or first to join)
      if (isTherapist) {
        console.log('👨‍⚕️ Therapist initiating call...');
        await initiateCall();
      }

      console.log('✅ Session joined successfully');
    } catch (error) {
      console.error('❌ Failed to join session:', error);
      setIsInSession(false);
      setWaitingRoomActive(false);
      stopTimer();
      
      // Clean up stream if it was created
      if (videoState.localStream) {
        videoState.localStream.getTracks().forEach(track => track.stop());
      }
      
      throw error;
    }
  }, [
    devicePermissions, 
    requestPermissions, 
    videoState.selectedCamera,
    videoState.selectedMicrophone,
    videoState.localStream,
    createPeerConnection,
    addLocalStream,
    startTimer,
    isTherapist,
    initiateCall,
    stopTimer
  ]);

  const leaveSession = useCallback(() => {
    try {
      console.log('👋 Leaving session...');
      
      // Stop local media stream
      if (videoState.localStream) {
        videoState.localStream.getTracks().forEach(track => track.stop());
      }

      // Cleanup peer connection
      cleanupPeerConnection();

      setIsInSession(false);
      setWaitingRoomActive(false);
      stopTimer();
      
      // Reset video state
      setVideoState(prev => ({
        ...prev,
        localStream: null,
        remoteStream: null,
        isScreenSharing: false
      }));

      console.log('✅ Session left successfully');
    } catch (error) {
      console.error('❌ Error leaving session:', error);
    }
  }, [videoState.localStream, cleanupPeerConnection, stopTimer]);

  const toggleVideo = useCallback(() => {
    if (videoState.localStream) {
      const videoTracks = videoState.localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !videoState.isVideoEnabled;
      });
      setVideoState(prev => ({ ...prev, isVideoEnabled: !prev.isVideoEnabled }));
    }
  }, [videoState.localStream, videoState.isVideoEnabled]);

  const toggleAudio = useCallback(() => {
    if (videoState.localStream) {
      const audioTracks = videoState.localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !videoState.isAudioEnabled;
      });
      setVideoState(prev => ({ ...prev, isAudioEnabled: !prev.isAudioEnabled }));
    }
  }, [videoState.localStream, videoState.isAudioEnabled]);

  const toggleScreenShare = useCallback(async () => {
    try {
      if (screenSharingActive) {
        await stopScreenSharing();
      } else {
        await startScreenSharing();
      }
      setVideoState(prev => ({ ...prev, isScreenSharing: screenSharingActive }));
    } catch (error) {
      console.error('Error toggling screen share:', error);
    }
  }, [screenSharingActive, startScreenSharing, stopScreenSharing]);

  const toggleRecording = useCallback(() => {
    setVideoState(prev => ({ ...prev, isRecording: !prev.isRecording }));
  }, []);

  const toggleChat = useCallback(() => {
    setVideoState(prev => ({ ...prev, isChatOpen: !prev.isChatOpen }));
  }, []);

  const admitFromWaitingRoom = useCallback(() => {
    setWaitingRoomActive(false);
  }, []);

  const testDevices = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Device test failed:', error);
      return false;
    }
  }, []);

  const changeDevice = useCallback(async (
    type: "camera" | "microphone" | "speaker", 
    deviceId: string
  ) => {
    try {
      if (type === "camera" && videoState.localStream) {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId },
          audio: { deviceId: videoState.selectedMicrophone || undefined }
        });
        
        // Replace video track in peer connection
        const videoTrack = newStream.getVideoTracks()[0];
        if (videoTrack) {
          await replaceTrack(videoTrack, 'video');
        }
        
        setVideoState(prev => ({ 
          ...prev, 
          selectedCamera: deviceId,
          localStream: newStream
        }));
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = newStream;
        }
      } else if (type === "microphone" && videoState.localStream) {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: videoState.selectedCamera || undefined },
          audio: { deviceId }
        });
        
        // Replace audio track in peer connection
        const audioTrack = newStream.getAudioTracks()[0];
        if (audioTrack) {
          await replaceTrack(audioTrack, 'audio');
        }
        
        setVideoState(prev => ({ 
          ...prev, 
          selectedMicrophone: deviceId,
          localStream: newStream
        }));
      } else if (type === "speaker") {
        setVideoState(prev => ({ ...prev, selectedSpeaker: deviceId }));
        // Note: Speaker selection requires HTMLAudioElement.setSinkId()
        if (remoteVideoRef.current && 'setSinkId' in remoteVideoRef.current) {
          await (remoteVideoRef.current as any).setSinkId(deviceId);
        }
      }
    } catch (error) {
      console.error(`Error changing ${type}:`, error);
    }
  }, [
    videoState.localStream, 
    videoState.selectedCamera, 
    videoState.selectedMicrophone, 
    replaceTrack
  ]);

  const contextValue: AdvancedVideoSessionContextType = {
    // Session state
    videoState,
    isInSession,
    waitingRoomActive,
    sessionDuration,
    
    // Video refs
    localVideoRef,
    remoteVideoRef,
    
    // Participant info
    therapistInfo,
    patientInfo,
    isTherapist,
    
    // Advanced device management
    cameras: cameras.map(c => ({ ...c, groupId: c.groupId || '' })),
    microphones: microphones.map(m => ({ ...m, groupId: m.groupId || '' })),
    speakers: speakers.map(s => ({ ...s, groupId: s.groupId || '' })),
    devicePermissions,
    requestPermissions,
    changeDevice,
    testDevices,
    
    // Session controls
    joinSession,
    leaveSession,
    toggleVideo,
    toggleAudio,
    toggleScreenShare,
    toggleRecording,
    toggleChat,
    
    // WebRTC connection state
    connectionState: connectionState.connectionState,
    signalingState,
    
    // Waiting room
    admitFromWaitingRoom,
    
    // UI state
    formatSessionDuration,
    deviceSettingsOpen,
    setDeviceSettingsOpen,
    showSessionSummary,
    setShowSessionSummary,
  };

  return (
    <AdvancedVideoSessionContext.Provider value={contextValue}>
      {children}
    </AdvancedVideoSessionContext.Provider>
  );
};

export const useAdvancedVideoSession = () => {
  const context = useContext(AdvancedVideoSessionContext);
  if (context === undefined) {
    throw new Error('useAdvancedVideoSession must be used within an AdvancedVideoSessionProvider');
  }
  return context;
};