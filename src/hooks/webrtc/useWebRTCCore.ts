
import { useState, useRef, useEffect, useCallback } from 'react';

export function useWebRTCCore() {
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [connectionState, setConnectionState] = useState<string>('new');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  const connectionAttemptRef = useRef<number>(0);
  
  // Create a new WebRTC peer connection
  const createPeerConnection = useCallback(() => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });
      
      // Handle ICE connection state changes
      pc.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', pc.iceConnectionState);
        setConnectionState(pc.iceConnectionState);
      };
      
      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log('Connection state:', pc.connectionState);
        setConnectionState(pc.connectionState);
      };
      
      // Handle ICE candidate events
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('New ICE candidate:', event.candidate);
          // Here you would send this candidate to the remote peer
          // via your signaling server
        }
      };
      
      // Handle remote tracks
      pc.ontrack = (event) => {
        console.log('Remote track received:', event.track);
        
        if (!remoteStream) {
          const newRemoteStream = new MediaStream();
          setRemoteStream(newRemoteStream);
          
          // Add the track to the remote stream
          event.streams[0].getTracks().forEach(track => {
            newRemoteStream.addTrack(track);
          });
          
          // Set the remote video element's srcObject
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = newRemoteStream;
          }
        } else {
          // If we already have a remote stream, just add the track
          const track = event.track;
          remoteStream.addTrack(track);
        }
      };
      
      console.log('Created new peer connection');
      setPeerConnection(pc);
      return pc;
    } catch (error) {
      console.error('Error creating peer connection:', error);
      return null;
    }
  }, [remoteStream]);
  
  // Clean up peer connection when component unmounts
  useEffect(() => {
    return () => {
      if (peerConnection) {
        peerConnection.close();
        console.log('Peer connection closed');
      }
    };
  }, [peerConnection]);
  
  // Add tracks from local stream to peer connection
  const addTracksToConnection = useCallback(() => {
    if (!peerConnection || !localStream) return;
    
    try {
      // Clear any existing senders
      const senders = peerConnection.getSenders();
      senders.forEach(sender => peerConnection.removeTrack(sender));
      
      // Add all tracks from the local stream
      localStream.getTracks().forEach(track => {
        console.log('Adding track to peer connection:', track.kind);
        peerConnection.addTrack(track, localStream);
      });
    } catch (error) {
      console.error('Error adding tracks to peer connection:', error);
    }
  }, [peerConnection, localStream]);
  
  // Create and send an offer
  const createAndSendOffer = useCallback(async () => {
    if (!peerConnection) return;
    
    try {
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      await peerConnection.setLocalDescription(offer);
      console.log('Set local description, offer:', offer);
      
      // Here you would send this offer to the remote peer
      // via your signaling server
      
      return offer;
    } catch (error) {
      console.error('Error creating offer:', error);
      return null;
    }
  }, [peerConnection]);
  
  // Initiate a call to the remote peer
  const initiateCall = useCallback(async () => {
    try {
      // Increment connection attempt counter
      connectionAttemptRef.current += 1;
      
      // Create a new peer connection if we don't have one
      const pc = peerConnection || createPeerConnection();
      if (!pc) throw new Error('Failed to create peer connection');
      
      // Add local stream tracks to the connection
      addTracksToConnection();
      
      // Create and send an offer
      const offer = await createAndSendOffer();
      if (!offer) throw new Error('Failed to create offer');
      
      console.log('Call initiated successfully');
      return true;
    } catch (error) {
      console.error('Error initiating call:', error, 'Attempt:', connectionAttemptRef.current);
      return false;
    }
  }, [peerConnection, createPeerConnection, addTracksToConnection, createAndSendOffer]);
  
  // Fixed this function to take no arguments
  const resetConnectionAttempts = useCallback(() => {
    connectionAttemptRef.current = 0;
  }, []);
  
  return {
    peerConnection,
    connectionState,
    localStream,
    remoteStream,
    localVideoRef,
    remoteVideoRef,
    connectionAttempt: connectionAttemptRef.current,
    setLocalStream,
    createPeerConnection,
    addTracksToConnection,
    createAndSendOffer,
    initiateCall,
    resetConnectionAttempts
  };
}
