
import { useCallback, useEffect, useRef, useState } from "react";
import { useRealtimeSignaling, SignalingMessage } from "./useRealtimeSignaling";
import { deserializeSessionDesc, deserializeIceCandidate, serializeSessionDesc, serializeIceCandidate } from "./serialize";
import { useToast } from "@/hooks/use-toast";

interface WebRTCSignalingProps {
  sessionId: string;
  peerConnection: RTCPeerConnection | null;
  onRemoteStream?: (stream: MediaStream) => void;
}

type SignalingState = 'stable' | 'have-local-offer' | 'have-remote-offer' | 'have-local-pranswer' | 'have-remote-pranswer' | 'closed';

/**
 * Enhanced WebRTC signaling with race condition prevention
 */
export function useWebRTCSignaling({ 
  sessionId, 
  peerConnection,
  onRemoteStream 
}: WebRTCSignalingProps) {
  const { toast } = useToast();
  const { state: signalingState, sendSignal, registerSignalHandler } = useRealtimeSignaling(sessionId);
  
  // Track signaling state to prevent race conditions
  const [currentSignalingState, setCurrentSignalingState] = useState<SignalingState>('stable');
  const [isInitiator, setIsInitiator] = useState(false);
  const processedMessages = useRef(new Set<string>());
  
  // Monitor peer connection signaling state
  useEffect(() => {
    if (!peerConnection) return;
    
    const handleSignalingStateChange = () => {
      const newState = peerConnection.signalingState as SignalingState;
      console.log('📡 Signaling state changed:', currentSignalingState, '->', newState);
      setCurrentSignalingState(newState);
    };
    
    peerConnection.addEventListener('signalingstatechange', handleSignalingStateChange);
    setCurrentSignalingState(peerConnection.signalingState as SignalingState);
    
    return () => {
      peerConnection.removeEventListener('signalingstatechange', handleSignalingStateChange);
    };
  }, [peerConnection, currentSignalingState]);

  // Handle incoming signaling messages with race condition prevention
  const handleSignalingMessage = useCallback(async (message: SignalingMessage) => {
    if (!peerConnection) {
      console.warn("Received signaling message but no peer connection available");
      return;
    }

    // Create unique message ID to prevent duplicates
    const messageId = `${message.type}-${JSON.stringify(message.content).slice(0, 50)}`;
    if (processedMessages.current.has(messageId)) {
      console.log('🚫 Ignoring duplicate message:', message.type);
      return;
    }
    processedMessages.current.add(messageId);

    console.log(`📡 Processing signaling message: ${message.type} in state ${currentSignalingState}`);

    try {
      switch (message.type) {
        case 'offer': {
          // Only accept offers in stable state
          if (currentSignalingState !== 'stable') {
            console.warn(`⚠️ Cannot handle offer in state ${currentSignalingState}, ignoring`);
            return;
          }
          
          const sessionDesc = deserializeSessionDesc(message.content);
          console.log('📨 Setting remote offer');
          await peerConnection.setRemoteDescription(sessionDesc);
          
          console.log('📤 Creating answer');
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          
          await sendSignal('answer', answer);
          console.log('✅ Answer sent successfully');
          break;
        }
        
        case 'answer': {
          // Only accept answers if we have a local offer
          if (currentSignalingState !== 'have-local-offer') {
            console.warn(`⚠️ Cannot handle answer in state ${currentSignalingState}, ignoring`);
            return;
          }
          
          const sessionDesc = deserializeSessionDesc(message.content);
          console.log('📨 Setting remote answer');
          await peerConnection.setRemoteDescription(sessionDesc);
          console.log('✅ Remote answer set successfully');
          break;
        }
        
        case 'ice-candidate': {
          const candidateData = deserializeIceCandidate(message.content);
          
          // Only add ICE candidates if we have remote description
          if (candidateData.candidate && peerConnection.remoteDescription) {
            try {
              await peerConnection.addIceCandidate(candidateData);
              console.log('✅ ICE candidate added');
            } catch (error) {
              console.warn('⚠️ Failed to add ICE candidate:', error);
            }
          } else {
            console.log('🔄 Queuing ICE candidate (no remote description yet)');
          }
          break;
        }
      }
    } catch (error) {
      console.error("❌ Error handling signaling message:", error);
      toast({
        title: "Connection Error",
        description: "Failed to process signaling message",
        variant: "destructive",
      });
    }
  }, [peerConnection, currentSignalingState, sendSignal, toast]);

  // Register the signaling message handler
  useEffect(() => {
    registerSignalHandler(handleSignalingMessage);
  }, [registerSignalHandler, handleSignalingMessage]);

  // Set up peer connection event handlers
  useEffect(() => {
    if (!peerConnection) return;

    // Handle ICE candidates
    const handleIceCandidate = async (event: RTCPeerConnectionEventMap['icecandidate']) => {
      if (event.candidate) {
        console.log("📤 Sending ICE candidate");
        try {
          await sendSignal('ice-candidate', serializeIceCandidate(event.candidate));
        } catch (error) {
          console.error('❌ Failed to send ICE candidate:', error);
        }
      }
    };

    // Handle remote stream
    const handleTrack = (event: RTCTrackEvent) => {
      console.log("📺 Received remote track:", event.track.kind);
      const [remoteStream] = event.streams;
      if (remoteStream && onRemoteStream) {
        console.log('✅ Calling onRemoteStream with tracks:', remoteStream.getTracks().length);
        onRemoteStream(remoteStream);
      }
    };

    peerConnection.addEventListener('icecandidate', handleIceCandidate);
    peerConnection.addEventListener('track', handleTrack);

    return () => {
      peerConnection.removeEventListener('icecandidate', handleIceCandidate);
      peerConnection.removeEventListener('track', handleTrack);
    };
  }, [peerConnection, sendSignal, onRemoteStream]);

  // Initiate call (caller side)
  const initiateCall = useCallback(async (): Promise<boolean> => {
    if (!peerConnection) {
      console.error("Cannot initiate call: no peer connection");
      return false;
    }

    if (!signalingState.connected) {
      toast({
        title: "Connection Error", 
        description: "Signaling not connected",
        variant: "destructive",
      });
      return false;
    }

    if (currentSignalingState !== 'stable') {
      console.warn(`Cannot initiate call in state ${currentSignalingState}`);
      return false;
    }

    try {
      console.log("📞 Initiating call by creating offer");
      setIsInitiator(true);
      
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      await peerConnection.setLocalDescription(offer);
      console.log('📤 Sending offer');
      
      await sendSignal('offer', offer);
      console.log('✅ Offer sent successfully');
      return true;
    } catch (error) {
      console.error("❌ Error initiating call:", error);
      toast({
        title: "Call Failed",
        description: "Failed to initiate video call",
        variant: "destructive",
      });
      return false;
    }
  }, [peerConnection, signalingState.connected, currentSignalingState, sendSignal, toast]);

  // Reset signaling state
  const reset = useCallback(() => {
    console.log('🔄 Resetting signaling state');
    setIsInitiator(false);
    processedMessages.current.clear();
  }, []);

  return {
    signalingState,
    currentSignalingState,
    isInitiator,
    initiateCall,
    sendSignal,
    reset
  };
}
