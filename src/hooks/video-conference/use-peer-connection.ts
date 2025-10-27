
import { useState, useCallback, useRef } from "react";
import { useToast } from "../use-toast";

export function usePeerConnection() {
  const { toast } = useToast();
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [connectionState, setConnectionState] = useState<string>("new");
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Set up peer connection
  const setupPeerConnection = useCallback(() => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.google.com.com:19302' },
        ],
      });
      
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          // In a real app, this would send the candidate to the remote peer
          console.log("New ICE candidate", event.candidate);
        }
      };
      
      pc.ontrack = (event) => {
        console.log("Received remote track", event.streams[0]);
        setRemoteStream(event.streams[0]);
        
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };
      
      pc.oniceconnectionstatechange = () => {
        setConnectionState(pc.iceConnectionState);
        console.log("ICE connection state change:", pc.iceConnectionState);
      };
      
      setPeerConnection(pc);
      return pc;
    } catch (err) {
      console.error("Error setting up peer connection:", err);
      return null;
    }
  }, []);

  // Initiate a call
  const initiateCall = useCallback(async (stream: MediaStream) => {
    try {
      const pc = setupPeerConnection();
      if (!pc) return false;
      
      // Add local stream tracks to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });
      
      // Create and set local description
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      // In a real app, this would send the offer to the remote peer
      console.log("Created offer:", offer);
      
      // Simulate receiving an answer after a delay
      setTimeout(async () => {
        if (pc.signalingState !== "closed") {
          // Create an RTCSessionDescriptionInit object with the correct type
          const answer: RTCSessionDescriptionInit = {
            type: 'answer',
            sdp: offer.sdp,
          };
          
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          console.log("Set remote description");
        }
      }, 1000);
      
      return true;
    } catch (err) {
      console.error("Error initiating call:", err);
      return false;
    }
  }, [setupPeerConnection]);

  return { 
    peerConnection, 
    setPeerConnection, 
    connectionState, 
    remoteStream, 
    remoteVideoRef,
    setupPeerConnection, 
    initiateCall 
  };
}
