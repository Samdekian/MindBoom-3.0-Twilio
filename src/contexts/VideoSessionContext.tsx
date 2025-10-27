import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuthRBAC } from './AuthRBACContext';
import { useToast } from '@/hooks/use-toast';
import { useSessionParticipants } from '@/hooks/use-session-participants';
import { SignalingClient } from '@/lib/webrtc/signaling-client';
import { iceServerManager } from '@/lib/webrtc/ice-server-config';
import { supabase } from '@/integrations/supabase/client';
import { 
  ParticipantInfo, 
  VideoDevices, 
  SessionStatus, 
  CameraStatus, 
  StreamDebugInfo,
  VideoSessionState,
  ConnectionQuality
} from '@/types/video-session';

export interface VideoSessionContextType {
  // Core session state
  videoState: VideoSessionState;
  isInSession: boolean;
  sessionDuration: string;
  connectionState: 'IDLE' | 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'FAILED';
  
  // Media state (simple)
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  
  // Participant info
  therapistInfo: ParticipantInfo | null;
  patientInfo: ParticipantInfo | null;
  isTherapist: boolean;
  participants: ParticipantInfo[];
  
  // Media streams and refs
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
  toggleScreenShare: () => Promise<boolean>; // Alias for compatibility
  toggleRecording: () => Promise<boolean>;
  
  // Simple device management
  cameras: MediaDeviceInfo[];
  microphones: MediaDeviceInfo[];
  speakers: MediaDeviceInfo[];
  changeDevice: (type: 'camera' | 'microphone' | 'speaker', deviceId: string) => Promise<void>;
  testDevices: () => Promise<boolean>;
  
  // UI state
  deviceSettingsOpen: boolean;
  setDeviceSettingsOpen: (open: boolean) => void;
  waitingRoomActive: boolean; // For compatibility
  showSessionSummary: boolean; // For compatibility 
  setShowSessionSummary: (show: boolean) => void; // For compatibility
  deviceSwitching: boolean; // For compatibility
  
  // Simple session status
  sessionStatus: SessionStatus;
  cameraStatus: CameraStatus;
  streamDebugInfo: StreamDebugInfo;
  
  // Utility functions
  formatSessionDuration: (seconds?: number) => string;
}

const VideoSessionContext = createContext<VideoSessionContextType | undefined>(undefined);

interface VideoSessionProviderProps {
  children: React.ReactNode;
  sessionId?: string;
  sessionType?: 'appointment' | 'instant';
}

export const VideoSessionProvider: React.FC<VideoSessionProviderProps> = ({
  children,
  sessionId,
  sessionType = 'appointment'
}) => {
  const { user, isTherapist, isAuthenticated } = useAuthRBAC();
  const { toast } = useToast();
  
  // Initialize TURN credentials on mount
  useEffect(() => {
    console.log('🔧 [VideoSession] Initializing TURN credentials...');
    iceServerManager.initializeTurnCredentials().then(() => {
      console.log('✅ [VideoSession] TURN credentials initialized');
    }).catch((error) => {
      console.warn('⚠️ [VideoSession] Failed to initialize TURN credentials:', error);
    });
  }, []);
  
  // Simple session state
  const [isInSession, setIsInSession] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [connectionState, setConnectionState] = useState<'IDLE' | 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'FAILED'>('IDLE');
  
  // WebRTC state with multi-peer support
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([]);
  const [peerConnections, setPeerConnections] = useState<Map<string, RTCPeerConnection>>(new Map());
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map()); // Immediate access without waiting for state
  const [signalingClient, setSignalingClient] = useState<SignalingClient | null>(null);
  const signalingClientRef = useRef<SignalingClient | null>(null); // Ref for immediate access in callbacks
  const [connectedPeers, setConnectedPeers] = useState<Set<string>>(new Set());
  
  // Track connection attempts and timeouts
  const [connectionAttempts, setConnectionAttempts] = useState<Map<string, number>>(new Map());
  const [connectionTimeouts, setConnectionTimeouts] = useState<Map<string, NodeJS.Timeout>>(new Map());
  
  // Video refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  // UI state
  const [deviceSettingsOpen, setDeviceSettingsOpen] = useState(false);
  const [showSessionSummary, setShowSessionSummary] = useState(false);
  
  // Simple participant data
  const { participants: dbParticipants } = useSessionParticipants(sessionId || null);
  
  // Simple device list
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [speakers, setSpeakers] = useState<MediaDeviceInfo[]>([]);

  // Calculate session duration
  const sessionDuration = sessionStartTime 
    ? Math.floor((Date.now() - sessionStartTime.getTime()) / 1000).toString()
    : '0';

  const formatSessionDuration = useCallback((seconds?: number): string => {
    const totalSeconds = seconds ?? parseInt(sessionDuration) ?? 0;
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, [sessionDuration]);

  // Video state object
  const videoState: VideoSessionState = {
    isVideoEnabled,
    isAudioEnabled,
    isScreenSharing: false,
    isRecording: false,
    isChatOpen: false,
    connectionQuality: connectionState === 'CONNECTED' ? 'good' : 'disconnected',
    sessionDuration: formatSessionDuration()
  };

  // Process participants for UI
  const processedParticipants: ParticipantInfo[] = dbParticipants.map(p => ({
    id: p.user_id || p.id,
    name: p.participant_name || 'Anonymous',
    role: p.role,
    isVideoEnabled: true,
    isAudioEnabled: true,
    isCurrentUser: p.user_id === user?.id
  }));

  const therapistInfo: ParticipantInfo | null = processedParticipants.find(p => p.role === 'therapist') || null;
  const patientInfo: ParticipantInfo | null = processedParticipants.find(p => p.role === 'patient') || null;

  // Simple session status calculation
  const sessionStatus: SessionStatus = (() => {
    if (!isInSession) return 'waiting';
    
    switch (connectionState) {
      case 'CONNECTING': return 'connecting';
      case 'CONNECTED': return 'connected';
      case 'DISCONNECTED': return 'reconnecting';
      case 'FAILED': return 'failed';
      default: return 'waiting';
    }
  })();

  // Simple camera status - always available for now
  const cameraStatus: CameraStatus = 'available';

  // Simple stream debug info
  const streamDebugInfo: StreamDebugInfo = {
    localStream: !!localStream,
    remoteStreams: remoteStreams.length,
    connectionState: connectionState,
    hasVideo: isVideoEnabled && !!localStream,
    hasAudio: isAudioEnabled && !!localStream,
    videoTrackCount: localStream?.getVideoTracks().length || 0,
    audioTrackCount: localStream?.getAudioTracks().length || 0,
    lastUpdated: new Date().toISOString()
  };

  // Update video element when local stream changes
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Track previous remote stream to avoid unnecessary updates
  const previousRemoteStreamRef = useRef<MediaStream | null>(null);
  
  // Update remote video element when remote streams change - Optimized with change detection
  useEffect(() => {
    console.log('🎬 [VideoSession] Remote video useEffect triggered:', {
      hasVideoRef: !!remoteVideoRef.current,
      remoteStreamsCount: remoteStreams.length,
      remoteStreamIds: remoteStreams.map(s => s.id)
    });
    
    if (remoteVideoRef.current && remoteStreams.length > 0) {
      const remoteStream = remoteStreams[0];
      
      // Only update if the stream actually changed
      if (previousRemoteStreamRef.current !== remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      previousRemoteStreamRef.current = remoteStream;
      
      // Wait for loadedmetadata before playing to prevent interruption
      const videoElement = remoteVideoRef.current;
      const playWhenReady = () => {
        videoElement.play().catch(err => {
          console.warn('⚠️ [VideoSession] Video autoplay blocked:', err);
          // Try playing muted if autoplay blocked
          videoElement.muted = true;
          videoElement.play().catch(e => console.error('❌ [VideoSession] Failed to play even when muted:', e));
        });
      };
      
      if (videoElement.readyState >= 2) {
        // Metadata already loaded
        playWhenReady();
      } else {
        // Wait for metadata to load
        videoElement.addEventListener('loadedmetadata', playWhenReady, { once: true });
      }
      
      console.log('✅ [VideoSession] Remote stream assigned to video element:', {
        streamId: remoteStream.id,
        videoTracks: remoteStream.getVideoTracks().length,
        audioTracks: remoteStream.getAudioTracks().length,
        videoElement: remoteVideoRef.current.tagName,
        srcObjectSet: !!remoteVideoRef.current.srcObject,
        videoTrackEnabled: remoteStream.getVideoTracks()[0]?.enabled,
        videoTrackReadyState: remoteStream.getVideoTracks()[0]?.readyState,
        videoElementPaused: remoteVideoRef.current.paused,
        videoElementReadyState: remoteVideoRef.current.readyState
      });
      } else {
        console.log('⏭️ [VideoSession] Remote stream unchanged, skipping assignment');
      }
    } else if (remoteVideoRef.current && remoteVideoRef.current.srcObject && previousRemoteStreamRef.current) {
      remoteVideoRef.current.srcObject = null;
      previousRemoteStreamRef.current = null;
      console.log('🔄 [VideoSession] Remote video cleared - no streams available');
    } else {
      console.log('⚠️ [VideoSession] Cannot assign remote stream:', {
        hasVideoRef: !!remoteVideoRef.current,
        remoteStreamsCount: remoteStreams.length
      });
    }
  }, [remoteStreams]);

  // Clear connection timeout for a user
  const clearConnectionTimeout = useCallback((userId: string) => {
    const timeout = connectionTimeouts.get(userId);
    if (timeout) {
      clearTimeout(timeout);
      setConnectionTimeouts(prev => {
        const updated = new Map(prev);
        updated.delete(userId);
        return updated;
      });
    }
  }, [connectionTimeouts]);

  // Set connection timeout with automatic retry
  const setConnectionTimeout = useCallback((userId: string) => {
    clearConnectionTimeout(userId);
    
    const timeout = setTimeout(() => {
      console.log('⏰ [VideoSession] Connection timeout for', userId, '- attempting retry');
      const attempts = connectionAttempts.get(userId) || 0;
      
      if (attempts < 3) {
        // Retry connection
        setConnectionAttempts(prev => {
          const updated = new Map(prev);
          updated.set(userId, attempts + 1);
          return updated;
        });
        // Trigger retry by cleaning up failed connection and allowing new attempt
        const pc = peerConnections.get(userId);
        if (pc) {
          pc.close();
          setPeerConnections(prev => {
            const updated = new Map(prev);
            updated.delete(userId);
            return updated;
          });
        }
      } else {
        console.error('❌ [VideoSession] Max connection attempts reached for', userId);
        setConnectionState('FAILED');
      }
    }, 10000); // 10 second timeout
    
    setConnectionTimeouts(prev => {
      const updated = new Map(prev);
      updated.set(userId, timeout);
      return updated;
    });
  }, [connectionAttempts, peerConnections, clearConnectionTimeout]);

  // Check if connection already exists
  const hasExistingConnection = useCallback((userId: string): boolean => {
    return peerConnections.has(userId);
  }, [peerConnections]);

  // Create peer connection with proper WebRTC setup
  const createPeerConnection = useCallback((userId: string, isInitiator: boolean = false): RTCPeerConnection => {
    console.log('🔗 [VideoSession] Creating peer connection for user:', userId, 'as', isInitiator ? 'initiator' : 'receiver');
    
    // Detect if we're on a local network (localhost or private IP ranges)
    const isLocalNetwork = window.location.hostname === 'localhost' || 
                          window.location.hostname.startsWith('192.168.') ||
                          window.location.hostname.startsWith('10.') ||
                          window.location.hostname.startsWith('172.');
    
    // Get ICE server configuration
    // Use local-optimized config (STUN-only) for local network testing to get better quality
    const iceConfig = iceServerManager.getConfig(isLocalNetwork);
    console.log('🌐 [VideoSession] Using ICE config:', {
      serverCount: iceConfig.iceServers.length,
      hasTurn: iceConfig.iceServers.some(s => s.urls?.toString().includes('turn:')),
      policy: iceConfig.iceTransportPolicy,
      optimizedForLocal: isLocalNetwork
    });

    const pc = new RTCPeerConnection(iceConfig);

    // Handle remote stream
    pc.ontrack = (event) => {
      console.log('📹 [VideoSession] Remote track received from', userId);
      const [remoteStream] = event.streams;
      console.log('🔍 [VideoSession] Remote stream details:', {
        streamId: remoteStream?.id,
        hasStream: !!remoteStream,
        trackCount: remoteStream?.getTracks().length || 0,
        videoTracks: remoteStream?.getVideoTracks().length || 0,
        audioTracks: remoteStream?.getAudioTracks().length || 0
      });
      setRemoteStreams(prev => {
        console.log('🔄 [VideoSession] Updating remoteStreams state:', {
          previousCount: prev.length,
          previousIds: prev.map(s => s.id),
          newStreamId: remoteStream?.id
        });
        const filtered = prev.filter(stream => stream.id !== remoteStream.id);
        const updated = [...filtered, remoteStream];
        console.log('✅ [VideoSession] Updated remoteStreams:', {
          newCount: updated.length,
          newIds: updated.map(s => s.id)
        });
        return updated;
      });
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      console.log('🎬 [VideoSession] onicecandidate fired for', userId, ':', { hasCandidate: !!event.candidate, hasSignalingClient: !!signalingClientRef.current });
      
      if (event.candidate && signalingClientRef.current) {
        console.log('🧊 [VideoSession] Sending ICE candidate to', userId, ':', {
          type: event.candidate.type,
          protocol: event.candidate.protocol,
          address: event.candidate.address,
          port: event.candidate.port,
          relatedAddress: event.candidate.relatedAddress,
          relatedPort: event.candidate.relatedPort,
          candidate: event.candidate.candidate.substring(0, 50) + '...'
        });
        signalingClientRef.current.sendIceCandidate(event.candidate, userId);
      } else if (!event.candidate) {
        console.log('🏁 [VideoSession] ICE gathering complete for', userId);
      } else if (event.candidate && !signalingClientRef.current) {
        console.error('❌ [VideoSession] Cannot send ICE candidate - no signaling client for', userId);
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log('🔗 [VideoSession] Connection state for', userId, ':', pc.connectionState);
      if (pc.connectionState === 'connected') {
        setConnectedPeers(prev => {
          const newSet = new Set([...prev, userId]);
          console.log('✅ [VideoSession] Connected peers:', newSet);
          return newSet;
        });
        setConnectionState('CONNECTED');
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setConnectedPeers(prev => {
          const newSet = new Set([...prev]);
          newSet.delete(userId);
          console.log('❌ [VideoSession] Disconnected peer:', userId, 'Remaining:', newSet);
          return newSet;
        });
        // Update connection state based on remaining peers
        setTimeout(() => {
          setConnectedPeers(currentPeers => {
            if (currentPeers.size === 0) {
              setConnectionState('DISCONNECTED');
            }
            return currentPeers;
          });
        }, 100);
      }
    };
    
    // ICE connection state monitoring (more granular than connectionState)
    pc.oniceconnectionstatechange = async () => {
      console.log('❄️ [VideoSession] ICE connection state for', userId, ':', pc.iceConnectionState);
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        console.log('✅ [VideoSession] ICE connection successful for', userId);
        clearConnectionTimeout(userId);
      } else if (pc.iceConnectionState === 'disconnected') {
        console.warn('⚠️ [VideoSession] ICE disconnected for', userId, '- attempting ICE restart...');
        // Don't immediately give up - wait a moment for reconnection
        setTimeout(async () => {
          if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
            console.log('🔄 [VideoSession] Attempting ICE restart for', userId);
            try {
              // Restart ICE without recreating the entire peer connection
              const offer = await pc.createOffer({ iceRestart: true });
              await pc.setLocalDescription(offer);
              if (signalingClientRef.current && isInitiator) {
                await signalingClientRef.current.sendOffer(offer, userId);
                console.log('📤 [VideoSession] ICE restart offer sent to', userId);
              }
            } catch (error) {
              console.error('❌ [VideoSession] ICE restart failed for', userId, ':', error);
            }
          }
        }, 3000); // Wait 3 seconds before restart
      } else if (pc.iceConnectionState === 'failed') {
        console.error('❌ [VideoSession] ICE connection failed for', userId);
      }
    };
    
    // ICE gathering state monitoring
    pc.onicegatheringstatechange = () => {
      console.log('🧊 [VideoSession] ICE gathering state for', userId, ':', pc.iceGatheringState);
    };

    // Store the peer connection in both state and ref for immediate access
    peerConnectionsRef.current.set(userId, pc);
    setPeerConnections(prev => {
      const updated = new Map(prev);
      updated.set(userId, pc);
      return updated;
    });

    return pc;
  }, [signalingClient, localStream]);

  // Register participant in database
  const registerParticipant = useCallback(async () => {
    // Validate authentication first
    if (!isAuthenticated || !user?.id) {
      console.warn('❌ [VideoSession] User not authenticated');
      toast({
        title: "Authentication Required",
        description: "Please log in to join the session.",
        variant: "destructive",
      });
      return;
    }

    if (!sessionId || sessionId === 'unknown') {
      console.warn('❌ [VideoSession] Invalid session ID');
      toast({
        title: "Invalid Session",
        description: "Session ID is missing or invalid.",
        variant: "destructive",
      });
      return;
    }

    try {
      // First verify the session exists and is accessible
      const { data: sessionData, error: sessionError } = await supabase
        .from('instant_sessions')
        .select('id, therapist_id, is_active, expires_at, max_participants')
        .eq('id', sessionId)
        .single();

      if (sessionError || !sessionData) {
        console.error('❌ [VideoSession] Session validation failed:', sessionError);
        toast({
          title: "Session Not Found",
          description: "The session could not be found or accessed.",
          variant: "destructive",
        });
        return;
      }

      // Check if session is still active and not expired
      if (!sessionData.is_active || new Date(sessionData.expires_at) < new Date()) {
        console.warn('❌ [VideoSession] Session is inactive or expired');
        toast({
          title: "Session Unavailable",
          description: "This session is no longer active or has expired.",
          variant: "destructive",
        });
        return;
      }

      // Check participant capacity
      const { count: participantCount } = await supabase
        .from('instant_session_participants')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', sessionId)
        .eq('is_active', true);

      if (participantCount && participantCount >= sessionData.max_participants) {
        const isSessionOwner = sessionData.therapist_id === user.id;
        if (!isSessionOwner) {
          toast({
            title: "Session Full",
            description: "This session has reached its maximum capacity.",
            variant: "destructive",
          });
          return;
        }
      }

      // Attempt to register participant
      const { error } = await supabase
        .from('instant_session_participants')
        .upsert({
          session_id: sessionId,
          user_id: user.id,
          participant_name: user.user_metadata?.fullName || user.email || 'Anonymous',
          role: isTherapist ? 'host' : 'participant',
          is_active: true,
          joined_at: new Date().toISOString()
        }, {
          onConflict: 'session_id,user_id'
        });

      if (error) {
        console.error('❌ [VideoSession] Failed to register participant:', error);
        
        // Provide specific error messages based on error code
        if (error.code === '42501') {
          toast({
            title: "Access Denied",
            description: "You don't have permission to join this session. Please check with the session host.",
            variant: "destructive",
          });
        } else if (error.code === '23505') {
          // Duplicate key - user already in session
          console.log('✅ [VideoSession] User already registered in session');
        } else {
          toast({
            title: "Registration Failed",
            description: "Failed to join the session. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        console.log('✅ [VideoSession] Participant registered successfully');
        toast({
          title: "Joined Session",
          description: "Successfully joined the video session.",
        });
      }
    } catch (error) {
      console.error('❌ [VideoSession] Database error:', error);
      toast({
        title: "Connection Error",
        description: "Unable to connect to the session. Please check your connection and try again.",
        variant: "destructive",
      });
    }
  }, [sessionId, user?.id, user?.email, user?.user_metadata?.fullName, isTherapist, isAuthenticated, toast]);

  // WebRTC session controls
  const joinSession = useCallback(async () => {
    try {
      console.log('🚀 [VideoSession] Starting WebRTC session join...');
      setConnectionState('CONNECTING');
      
      // Get user media with quality constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 60 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      setLocalStream(stream);
      setIsVideoEnabled(true);
      setIsAudioEnabled(true);
      setIsInSession(true);
      setSessionStartTime(new Date());

      // Register in database
      await registerParticipant();

      // Setup signaling client
      if (sessionId && user?.id) {
        const client = new SignalingClient({
          sessionId,
          userId: user.id,
          onMessage: async (message) => {
            console.log('📨 [VideoSession] Processing signaling message:', message.type, 'from', message.senderId);
            
            try {
              if (message.type === 'offer') {
                // Handle incoming offer - avoid duplicate connections
                if (hasExistingConnection(message.senderId)) {
                  console.log('🔗 [VideoSession] Ignoring offer - connection already exists for', message.senderId);
                  return;
                }
                
                console.log('🤝 [VideoSession] Processing offer from', message.senderId);
                const pc = createPeerConnection(message.senderId, false);
                
                // Clear any existing timeout since we're processing an offer
                clearConnectionTimeout(message.senderId);
                
                // Add local tracks
                if (stream) {
                  stream.getTracks().forEach(track => {
                    pc.addTrack(track, stream);
                  });
                }
                
                try {
                  await pc.setRemoteDescription(message.payload);
                  const answer = await pc.createAnswer();
                  await pc.setLocalDescription(answer);
                  await client.sendAnswer(answer, message.senderId);
                  console.log('📤 [VideoSession] Answer sent to', message.senderId);
                } catch (offerError) {
                  console.error('❌ [VideoSession] Failed to process offer:', offerError);
                  // Clean up failed connection
                  pc.close();
                  setPeerConnections(prev => {
                    const updated = new Map(prev);
                    updated.delete(message.senderId);
                    return updated;
                  });
                }
                
              } else if (message.type === 'answer') {
                // Use ref for immediate access, fallback to state
                const pc = peerConnectionsRef.current.get(message.senderId) || peerConnections.get(message.senderId);
                if (!pc) {
                  console.warn('⚠️ [VideoSession] No peer connection for answer from', message.senderId);
                  return;
                }
                
                console.log('📥 [VideoSession] Processing answer from', message.senderId, 'PC state:', pc.signalingState);
                
                // Clear connection timeout since we got an answer
                clearConnectionTimeout(message.senderId);
                
                try {
                  if (pc.signalingState === 'have-local-offer') {
                    await pc.setRemoteDescription(message.payload);
                    console.log('✅ [VideoSession] Answer processed successfully from', message.senderId);
                  } else {
                    console.warn('⚠️ [VideoSession] Cannot process answer - wrong signaling state:', pc.signalingState);
                  }
                } catch (answerError) {
                  console.error('❌ [VideoSession] Failed to process answer:', answerError);
                }
                
              } else if (message.type === 'ice-candidate') {
                const pc = peerConnectionsRef.current.get(message.senderId) || peerConnections.get(message.senderId);
                if (!pc) {
                  console.warn('⚠️ [VideoSession] No peer connection for ICE candidate from', message.senderId);
                  return;
                }
                
                try {
                  const candidate = message.payload as RTCIceCandidateInit;
                  console.log('📨 [VideoSession] Received ICE candidate from', message.senderId, ':', {
                    hasCandidate: !!candidate.candidate,
                    hasRemoteDesc: !!pc.remoteDescription,
                    signalingState: pc.signalingState,
                    candidatePreview: candidate.candidate?.substring(0, 50) + '...'
                  });
                  
                  if (pc.remoteDescription && pc.signalingState !== 'closed') {
                    await pc.addIceCandidate(candidate);
                    console.log('✅ [VideoSession] ICE candidate added for', message.senderId);
                  } else {
                    console.warn('⚠️ [VideoSession] Cannot add ICE candidate - no remote description or connection closed for', message.senderId);
                  }
                } catch (iceError) {
                  console.error('❌ [VideoSession] Failed to add ICE candidate:', iceError);
                }
              }
            } catch (error) {
              console.error('❌ [VideoSession] Error processing signaling message:', error);
            }
          },
          onUserJoined: async (userId) => {
            console.log('👋 [VideoSession] User joined:', userId);
            
            // Avoid duplicate connections
            if (hasExistingConnection(userId)) {
              console.log('🔗 [VideoSession] User already connected:', userId);
              return;
            }
            
            try {
              // Use simple "first to send offer wins" approach - smaller user ID initiates
              const shouldInitiate = user?.id && user.id < userId;
              
              if (shouldInitiate) {
                console.log('🚀 [VideoSession] Initiating connection to', userId);
                
                // Track connection attempt and set timeout
                setConnectionAttempts(prev => {
                  const updated = new Map(prev);
                  updated.set(userId, (updated.get(userId) || 0) + 1);
                  return updated;
                });
                setConnectionTimeout(userId);
                
                // Create offer for new user
                const pc = createPeerConnection(userId, true);
                
                // Add local tracks
                if (stream) {
                  stream.getTracks().forEach(track => {
                    pc.addTrack(track, stream);
                  });
                }
                
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                client.sendOffer(offer, userId);
                console.log('📤 [VideoSession] Offer sent to new user:', userId);
              } else {
                console.log('⏳ [VideoSession] Waiting for offer from', userId, 'or connection already exists');
              }
            } catch (error) {
              console.error('❌ [VideoSession] Error handling user join:', error);
            }
          },
          onUserLeft: (userId) => {
            console.log('👋 [VideoSession] User left:', userId);
            
            // Clean up peer connection
            const pc = peerConnections.get(userId);
            if (pc) {
              pc.close();
              setPeerConnections(prev => {
                const updated = new Map(prev);
                updated.delete(userId);
                return updated;
              });
            }
            
            // Clean up connection tracking
            setConnectionAttempts(prev => {
              const updated = new Map(prev);
              updated.delete(userId);
              return updated;
            });
            
            setConnectedPeers(prev => {
              const newSet = new Set([...prev]);
              newSet.delete(userId);
              return newSet;
            });
          }
        });

        const connected = await client.connect();
        if (connected) {
          signalingClientRef.current = client; // Set ref FIRST for immediate access
          setSignalingClient(client);
      console.log('✅ [VideoSession] Signaling connected');
      
      // Discover and connect to existing participants
      // Add a small delay to ensure other participants have time to register in the database
      await new Promise(resolve => setTimeout(resolve, 500));
      await discoverExistingParticipants(client, stream);
        }
      }
      
      toast({
        title: "Session Joined",
        description: "Successfully connected to video session"
      });
    } catch (error) {
      console.error('❌ [VideoSession] Failed to join session:', error);
      setConnectionState('FAILED');
      toast({
        title: "Join Failed",
        description: error instanceof Error ? error.message : "Failed to join session",
        variant: "destructive"
      });
    }
  }, [sessionId, user?.id, toast, createPeerConnection, registerParticipant, hasExistingConnection, clearConnectionTimeout, setConnectionTimeout]);

  const leaveSession = useCallback(async () => {
    try {
      // Disconnect signaling
      if (signalingClient) {
        signalingClient.disconnect();
        signalingClientRef.current = null; // Clear ref
        setSignalingClient(null);
      }
      
      // Stop local stream
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
      
      // Close all peer connections
      peerConnections.forEach((pc, userId) => {
        pc.close();
        console.log('🔚 [VideoSession] Closed peer connection for', userId);
      });
      setPeerConnections(new Map());

      // Mark as inactive in database
      if (sessionId && user?.id) {
        await supabase
          .from('instant_session_participants')
          .update({ is_active: false, left_at: new Date().toISOString() })
          .eq('session_id', sessionId)
          .eq('user_id', user.id);
      }
      
      setIsInSession(false);
      setIsVideoEnabled(false);
      setIsAudioEnabled(false);
      setSessionStartTime(null);
      setConnectionState('IDLE');
      setRemoteStreams([]);
      setConnectedPeers(new Set());
      
      toast({
        title: "Session Ended",
        description: "You have left the video session"
      });
    } catch (error) {
      console.error('Failed to leave session:', error);
      toast({
        title: "Error",
        description: "There was an issue leaving the session",
        variant: "destructive"
      });
    }
  }, [localStream, peerConnections, signalingClient, sessionId, user?.id, toast]);

  const reconnectSession = useCallback(async () => {
    try {
      await joinSession();
      toast({
        title: "Reconnected",
        description: "Session connection restored"
      });
    } catch (error) {
      console.error('Reconnection failed:', error);
      toast({
        title: "Reconnection Failed",
        description: "Unable to restore connection",
        variant: "destructive"
      });
    }
  }, [joinSession, toast]);

  // Simple media controls
  const toggleVideo = useCallback(async (): Promise<boolean> => {
    if (!localStream) return false;
    
    const videoTracks = localStream.getVideoTracks();
    const newEnabled = !isVideoEnabled;
    
    videoTracks.forEach(track => track.enabled = newEnabled);
    setIsVideoEnabled(newEnabled);
    return newEnabled;
  }, [localStream, isVideoEnabled]);

  const toggleAudio = useCallback(async (): Promise<boolean> => {
    if (!localStream) return false;
    
    const audioTracks = localStream.getAudioTracks();
    const newEnabled = !isAudioEnabled;
    
    audioTracks.forEach(track => track.enabled = newEnabled);
    setIsAudioEnabled(newEnabled);
    return newEnabled;
  }, [localStream, isAudioEnabled]);

  const toggleScreenSharing = useCallback(async (): Promise<boolean> => {
    // Simple screen sharing - not implemented yet
    console.log('Screen sharing not implemented in simplified version');
    return false;
  }, []);

  const toggleRecording = useCallback(async (): Promise<boolean> => {
    // TODO: Implement recording with MediaRecorder
    return false;
  }, []);

  // Simple device management - not fully implemented yet
  // Discover existing participants and create connections
  const discoverExistingParticipants = useCallback(async (client: SignalingClient, stream: MediaStream) => {
    try {
      // Query existing participants from database
      const { data: existingParticipants, error } = await supabase
        .from('instant_session_participants')
        .select('user_id, participant_name')
        .eq('session_id', sessionId)
        .eq('is_active', true)
        .neq('user_id', user?.id);

      if (error) {
        console.error('❌ [VideoSession] Failed to query existing participants:', error);
        return;
      }

      console.log('🔍 [VideoSession] Found existing participants:', existingParticipants?.length || 0);

      // Create offers to existing participants (only if we should initiate and don't have connection)
      if (existingParticipants && existingParticipants.length > 0) {
        for (const participant of existingParticipants) {
          // Use simple "first to send offer wins" approach - smaller user ID initiates
          const shouldInitiate = user?.id && user.id < participant.user_id;
          
          if (shouldInitiate && !hasExistingConnection(participant.user_id)) {
            console.log('🤝 [VideoSession] Initiating connection to existing participant:', participant.user_id);
            
            // Track connection attempt and set timeout
            setConnectionAttempts(prev => {
              const updated = new Map(prev);
              updated.set(participant.user_id, (updated.get(participant.user_id) || 0) + 1);
              return updated;
            });
            setConnectionTimeout(participant.user_id);
            
            const pc = createPeerConnection(participant.user_id, true);
            
            // Add local tracks
            console.log('🎥 [VideoSession] Adding local tracks to peer connection:', {
              hasStream: !!stream,
              trackCount: stream?.getTracks().length || 0,
              videoTracks: stream?.getVideoTracks().length || 0,
              audioTracks: stream?.getAudioTracks().length || 0
            });
            
            if (!stream || stream.getTracks().length === 0) {
              console.error('❌ [VideoSession] No local stream available to add tracks!');
              pc.close();
              setPeerConnections(prev => {
                const updated = new Map(prev);
                updated.delete(participant.user_id);
                return updated;
              });
              clearConnectionTimeout(participant.user_id);
              continue;
            }
            
            stream.getTracks().forEach(track => {
              console.log('➕ [VideoSession] Adding track:', track.kind, track.id, 'enabled:', track.enabled);
              pc.addTrack(track, stream);
            });
            
            try {
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              await client.sendOffer(offer, participant.user_id);
              console.log('📤 [VideoSession] Offer sent to existing participant:', participant.user_id);
            } catch (error) {
              console.error('❌ [VideoSession] Failed to create/send offer to existing participant:', error);
              // Clean up failed connection
              pc.close();
              setPeerConnections(prev => {
                const updated = new Map(prev);
                updated.delete(participant.user_id);
                return updated;
              });
              clearConnectionTimeout(participant.user_id);
            }
          } else {
            console.log('⏳ [VideoSession] Waiting for offer from existing participant or connection exists:', participant.user_id);
          }
        }
      }
    } catch (error) {
      console.error('❌ [VideoSession] Error discovering existing participants:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  }, [sessionId, user?.id, createPeerConnection, hasExistingConnection, setConnectionTimeout, clearConnectionTimeout]);

  const changeDevice = useCallback(async (type: 'camera' | 'microphone' | 'speaker', deviceId: string) => {
    console.log(`Device switching not implemented in simplified version: ${type} ${deviceId}`);
  }, []);

  const testDevices = useCallback(async (): Promise<boolean> => {
    try {
      // Test device access
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Device test failed:', error);
      return false;
    }
  }, []);

  const contextValue: VideoSessionContextType = {
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
    isTherapist,
    participants: processedParticipants,
    
    // Media streams and refs
    localVideoRef,
    remoteVideoRef,
    localStream,
    remoteStreams,
    
    // Session controls
    joinSession,
    leaveSession,
    reconnectSession,
    
    // Media controls
    toggleVideo,
    toggleAudio,
    toggleScreenSharing,
    toggleScreenShare: toggleScreenSharing, // Alias for compatibility
    toggleRecording,
    
    // Simple device management
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
    
    // Utility functions
    formatSessionDuration
  };

  return (
    <VideoSessionContext.Provider value={contextValue}>
      {children}
    </VideoSessionContext.Provider>
  );
};

export const useVideoSession = () => {
  const context = useContext(VideoSessionContext);
  if (context === undefined) {
    throw new Error('useVideoSession must be used within a VideoSessionProvider');
  }
  return context;
};

// Export types for external use
export type { 
  ParticipantInfo, 
  VideoDevices,
  SessionStatus,
  CameraStatus,
  StreamDebugInfo,
  VideoSessionState,
  ConnectionQuality
} from '@/types/video-session';