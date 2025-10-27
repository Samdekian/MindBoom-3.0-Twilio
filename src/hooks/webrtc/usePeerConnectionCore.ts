
import { useState, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export interface ConnectionState {
  connected: boolean;
  connectionState: RTCPeerConnectionState;
  iceConnectionState: RTCIceConnectionState;
  iceGatheringState: RTCIceGatheringState;
  signalingState: RTCSignalingState;
  remoteStream: MediaStream | null;
  localStream: MediaStream | null;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
}

/**
 * Core hook that manages the WebRTC peer connection creation and state
 */
export function usePeerConnectionCore() {
  const { toast } = useToast();
  
  // Connection state
  const [state, setState] = useState<ConnectionState>({
    connected: false,
    connectionState: 'new',
    iceConnectionState: 'new',
    iceGatheringState: 'new',
    signalingState: 'stable',
    remoteStream: null,
    localStream: null,
    connectionQuality: 'good'
  });
  
  // Reference to the RTCPeerConnection object
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  
  // Create a peer connection with the right configuration
  const createPeerConnection = useCallback((iceServers: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ]) => {
    try {
      // Use proper STUN/TURN servers for production
      const pc = new RTCPeerConnection({
        iceServers,
        iceCandidatePoolSize: 10,
      });
      
      // Update the ref
      peerConnectionRef.current = pc;
      return pc;
    } catch (err) {
      console.error("Error creating peer connection:", err);
      toast({
        title: "Connection Error",
        description: "Could not create connection. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);
  
  // Helper to map connection state to quality
  const getConnectionQuality = useCallback((state: RTCPeerConnectionState): ConnectionState['connectionQuality'] => {
    switch (state) {
      case 'connected': return 'excellent';
      case 'connecting': return 'good';
      case 'disconnected': return 'poor';
      case 'failed': return 'disconnected';
      case 'closed': return 'disconnected';
      default: return 'good';
    }
  }, []);
  
  // Helper to map ICE connection state to quality
  const getIceConnectionQuality = useCallback((state: RTCIceConnectionState): ConnectionState['connectionQuality'] => {
    switch (state) {
      case 'connected': 
      case 'completed': return 'excellent';
      case 'checking': return 'good';
      case 'disconnected': return 'poor';
      case 'failed': return 'disconnected';
      case 'closed': return 'disconnected';
      default: return 'good';
    }
  }, []);

  // Clean up when component unmounts
  const cleanup = useCallback(() => {
    const pc = peerConnectionRef.current;
    if (pc) {
      pc.close();
      peerConnectionRef.current = null;
    }
    
    setState({
      connected: false,
      connectionState: 'new',
      iceConnectionState: 'new',
      iceGatheringState: 'new',
      signalingState: 'stable',
      remoteStream: null,
      localStream: null,
      connectionQuality: 'good'
    });
  }, []);

  return {
    state,
    setState,
    peerConnectionRef,
    createPeerConnection,
    getConnectionQuality,
    getIceConnectionQuality,
    cleanup
  };
}
