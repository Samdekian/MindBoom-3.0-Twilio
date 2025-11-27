import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useToast } from '@/hooks/use-toast';
import { useInstantSessionParticipants } from '@/hooks/video-conference/use-instant-session-participants';

interface InstantSessionState {
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isInSession: boolean;
  isLoading: boolean;
  error: string | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  connectionState: string;
}

interface InstantSessionContextType {
  // State
  state: InstantSessionState;
  
  // Video refs
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  
  // Session info
  sessionDetails: any;
  isTherapist: boolean;
  
  // Participants
  participants: any[];
  participantCount: number;
  
  // Actions
  joinSession: (sessionToken: string) => Promise<void>;
  leaveSession: () => void;
  toggleVideo: () => void;
  toggleAudio: () => void;
  
  // Media access
  getMediaAccess: () => Promise<MediaStream | null>;
}

const InstantSessionContext = createContext<InstantSessionContextType | undefined>(undefined);

interface InstantSessionProviderProps {
  children: React.ReactNode;
}

export const InstantSessionProvider: React.FC<InstantSessionProviderProps> = ({ children }) => {
  const { user } = useAuthRBAC();
  const { toast } = useToast();
  
  // Core state
  const [state, setState] = useState<InstantSessionState>({
    isVideoEnabled: true,
    isAudioEnabled: true,
    isInSession: false,
    isLoading: false,
    error: null,
    localStream: null,
    remoteStream: null,
    connectionState: 'new'
  });
  
  // Session data
  const [sessionDetails, setSessionDetails] = useState<any>(null);
  const [isTherapist, setIsTherapist] = useState(false);
  
  // Video refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  // WebRTC
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  
  // Participants
  const { participants, addParticipant, removeParticipant } = useInstantSessionParticipants(sessionDetails?.id || null);
  const participantCount = participants.length;
  
  // Get media access with proper error handling
  const getMediaAccess = useCallback(async (): Promise<MediaStream | null> => {
    try {
      console.log('🎥 Requesting camera and microphone access...');
      
      // Stop existing stream
      if (state.localStream) {
        state.localStream.getTracks().forEach(track => track.stop());
      }
      
      const constraints = {
        video: state.isVideoEnabled ? {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30 }
        } : false,
        audio: state.isAudioEnabled ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } : false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('✅ Got media stream:', stream.getTracks().map(t => t.kind));
      
      // Update state
      setState(prev => ({ ...prev, localStream: stream, error: null }));
      
      // Connect to video element
      if (localVideoRef.current && stream.getVideoTracks().length > 0) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
        console.log('📺 Connected to local video element');
      }
      
      return stream;
    } catch (err) {
      console.error('❌ Media access failed:', err);
      
      let errorMessage = "Unable to access camera or microphone";
      if (err instanceof DOMException) {
        switch (err.name) {
          case 'NotAllowedError':
            errorMessage = "Camera/microphone access denied. Please allow access and refresh.";
            break;
          case 'NotFoundError':
            errorMessage = "No camera or microphone found.";
            break;
          case 'NotReadableError':
            errorMessage = "Camera or microphone is in use by another app.";
            break;
        }
      }
      
      setState(prev => ({ ...prev, error: errorMessage }));
      toast({
        title: "Media Access Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      return null;
    }
  }, [state.isVideoEnabled, state.isAudioEnabled, state.localStream, toast]);
  
  // Simple WebRTC setup for instant sessions
  const setupWebRTC = useCallback((localStream: MediaStream) => {
    try {
      console.log('🔗 Setting up WebRTC connection...');
      
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });
      
      // Add event listeners
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('🧊 New ICE candidate:', event.candidate);
          // In a real implementation, send this to other peers
        }
      };
      
      pc.ontrack = (event) => {
        console.log('📹 Received remote track');
        const [remoteStream] = event.streams;
        setState(prev => ({ ...prev, remoteStream }));
        
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      };
      
      pc.onconnectionstatechange = () => {
        console.log('🔄 Connection state:', pc.connectionState);
        setState(prev => ({ ...prev, connectionState: pc.connectionState }));
      };
      
      // Add local stream tracks
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
        console.log('➕ Added track:', track.kind);
      });
      
      peerConnectionRef.current = pc;
      console.log('✅ WebRTC setup complete');
      
    } catch (err) {
      console.error('❌ WebRTC setup failed:', err);
    }
  }, []);
  
  // Join session
  const joinSession = useCallback(async (sessionToken: string) => {
    try {
      console.log('🚀 Joining instant session...');
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // 1. Find session by token
      const { data: session, error: sessionError } = await supabase
        .from('instant_sessions')
        .select('*')
        .eq('session_token', sessionToken)
        .eq('is_active', true)
        .single();
      
      if (sessionError || !session) {
        throw new Error('Session not found or inactive');
      }
      
      console.log('📍 Found session:', session.session_name);
      setSessionDetails(session);
      setIsTherapist(user?.id === session.therapist_id);
      
      // 2. Get media access
      const stream = await getMediaAccess();
      if (!stream) {
        throw new Error('Could not access camera/microphone');
      }
      
      // 3. Create participant record
      await addParticipant(
        user?.user_metadata?.full_name || `Guest ${Date.now()}`,
        user?.id
      );
      
      // 4. Setup WebRTC
      setupWebRTC(stream);
      
      // 5. Mark as joined
      setState(prev => ({ 
        ...prev, 
        isInSession: true, 
        isLoading: false,
        error: null 
      }));
      
      console.log('✅ Successfully joined session!');
      
    } catch (err) {
      console.error('❌ Failed to join session:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to join session';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      
      toast({
        title: "Join Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [user, getMediaAccess, addParticipant, setupWebRTC, toast]);
  
  // Leave session
  const leaveSession = useCallback(() => {
    console.log('👋 Leaving session...');
    
    // Stop media streams
    if (state.localStream) {
      state.localStream.getTracks().forEach(track => track.stop());
    }
    
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    // Reset state
    setState({
      isVideoEnabled: true,
      isAudioEnabled: true,
      isInSession: false,
      isLoading: false,
      error: null,
      localStream: null,
      remoteStream: null,
      connectionState: 'new'
    });
    
    setSessionDetails(null);
    setIsTherapist(false);
    
    console.log('✅ Left session');
  }, [state.localStream]);
  
  // Toggle video
  const toggleVideo = useCallback(() => {
    if (state.localStream) {
      const videoTracks = state.localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !state.isVideoEnabled;
      });
      setState(prev => ({ ...prev, isVideoEnabled: !prev.isVideoEnabled }));
      console.log('📹 Video toggled:', !state.isVideoEnabled);
    }
  }, [state.localStream, state.isVideoEnabled]);
  
  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (state.localStream) {
      const audioTracks = state.localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !state.isAudioEnabled;
      });
      setState(prev => ({ ...prev, isAudioEnabled: !prev.isAudioEnabled }));
      console.log('🎤 Audio toggled:', !state.isAudioEnabled);
    }
  }, [state.localStream, state.isAudioEnabled]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (state.localStream) {
        state.localStream.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);
  
  const contextValue: InstantSessionContextType = {
    state,
    localVideoRef,
    remoteVideoRef,
    sessionDetails,
    isTherapist,
    participants,
    participantCount,
    joinSession,
    leaveSession,
    toggleVideo,
    toggleAudio,
    getMediaAccess
  };
  
  return (
    <InstantSessionContext.Provider value={contextValue}>
      {children}
    </InstantSessionContext.Provider>
  );
};

export const useInstantSession = () => {
  const context = useContext(InstantSessionContext);
  if (context === undefined) {
    throw new Error('useInstantSession must be used within an InstantSessionProvider');
  }
  return context;
};