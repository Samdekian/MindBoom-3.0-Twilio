
import { useCallback } from "react";
import type { ConnectionState } from "./usePeerConnectionCore";

interface PeerConnectionEventsProps {
  pc: RTCPeerConnection;
  setState: React.Dispatch<React.SetStateAction<ConnectionState>>;
  getConnectionQuality: (state: RTCPeerConnectionState) => ConnectionState['connectionQuality'];
  getIceConnectionQuality: (state: RTCIceConnectionState) => ConnectionState['connectionQuality'];
  sendSignal: (type: string, content: any) => void;
}

/**
 * Hook for setting up WebRTC peer connection event handlers
 */
export function usePeerConnectionEvents({
  pc,
  setState,
  getConnectionQuality,
  getIceConnectionQuality,
  sendSignal
}: PeerConnectionEventsProps) {
  
  // Set up ICE candidate event handler
  const setupIceCandidateHandler = useCallback(() => {
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("Local ICE candidate:", event.candidate);
        sendSignal('ice-candidate', {
          candidate: event.candidate.candidate,
          sdpMid: event.candidate.sdpMid,
          sdpMLineIndex: event.candidate.sdpMLineIndex,
          usernameFragment: event.candidate.usernameFragment
        });
      }
    };
  }, [pc, sendSignal]);
  
  // Set up remote track handler
  const setupTrackHandler = useCallback(() => {
    pc.ontrack = (event) => {
      console.log("Received remote track", event.streams[0]);
      setState(prev => ({
        ...prev,
        remoteStream: event.streams[0]
      }));
    };
  }, [pc, setState]);
  
  // Set up connection state change handler
  const setupConnectionStateHandler = useCallback(() => {
    pc.onconnectionstatechange = () => {
      console.log("Connection state changed:", pc.connectionState);
      setState(prev => ({
        ...prev,
        connectionState: pc.connectionState,
        connected: pc.connectionState === 'connected',
        connectionQuality: getConnectionQuality(pc.connectionState)
      }));
    };
  }, [pc, setState, getConnectionQuality]);
  
  // Set up ICE connection state change handler
  const setupIceConnectionStateHandler = useCallback(() => {
    pc.oniceconnectionstatechange = () => {
      console.log("ICE connection state changed:", pc.iceConnectionState);
      setState(prev => ({
        ...prev,
        iceConnectionState: pc.iceConnectionState,
        connectionQuality: getIceConnectionQuality(pc.iceConnectionState)
      }));
    };
  }, [pc, setState, getIceConnectionQuality]);
  
  // Set up ICE gathering state change handler
  const setupIceGatheringStateHandler = useCallback(() => {
    pc.onicegatheringstatechange = () => {
      console.log("ICE gathering state changed:", pc.iceGatheringState);
      setState(prev => ({
        ...prev,
        iceGatheringState: pc.iceGatheringState
      }));
    };
  }, [pc, setState]);
  
  // Set up signaling state change handler
  const setupSignalingStateHandler = useCallback(() => {
    pc.onsignalingstatechange = () => {
      console.log("Signaling state changed:", pc.signalingState);
      setState(prev => ({
        ...prev,
        signalingState: pc.signalingState
      }));
    };
  }, [pc, setState]);
  
  // Set up all event handlers
  const setupAllEventHandlers = useCallback(() => {
    setupIceCandidateHandler();
    setupTrackHandler();
    setupConnectionStateHandler();
    setupIceConnectionStateHandler();
    setupIceGatheringStateHandler();
    setupSignalingStateHandler();
  }, [
    setupIceCandidateHandler,
    setupTrackHandler,
    setupConnectionStateHandler,
    setupIceConnectionStateHandler,
    setupIceGatheringStateHandler,
    setupSignalingStateHandler
  ]);
  
  return { setupAllEventHandlers };
}
