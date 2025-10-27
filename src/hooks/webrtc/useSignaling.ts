
import { useCallback, useRef, useEffect } from "react";
import { useRealtimeSignaling } from "./useRealtimeSignaling";
import { serializeIceCandidate, serializeSessionDesc, deserializeSessionDesc, deserializeIceCandidate } from "./serialize";
import { useToast } from "@/hooks/use-toast";

interface SignalingProps {
  sessionId: string;
  peerConnection: RTCPeerConnection | null;
  onRemoteStream?: (stream: MediaStream) => void;
}

/**
 * Hook for managing WebRTC signaling with race condition prevention
 */
export function useSignaling({ sessionId, peerConnection, onRemoteStream }: SignalingProps) {
  const { toast } = useToast();
  const { state, sendSignal, registerSignalHandler } = useRealtimeSignaling(sessionId);
  const signalingStateRef = useRef({
    hasOffer: false,
    hasAnswer: false,
    isInitiator: false,
    lastProcessedOfferId: null as string | null,
    lastProcessedAnswerId: null as string | null
  });

  // Handle incoming signaling messages with state tracking
  const handleSignalingMessage = useCallback(async (message: any) => {
    if (!peerConnection) return;

    const currentState = peerConnection.signalingState;
    console.log(`📡 Handling ${message.type} in state ${currentState}`, message);

    try {
      switch (message.type) {
        case 'offer': {
          // Create unique ID for this offer based on content
          const offerId = JSON.stringify(message.content);
          
          // Prevent duplicate offers
          if (signalingStateRef.current.lastProcessedOfferId === offerId) {
            console.log('🚫 Ignoring duplicate offer with same content');
            return;
          }
          
          // Only accept offer if we're in stable state OR have-remote-offer (for renegotiation)
          if (currentState !== 'stable' && currentState !== 'have-remote-offer') {
            console.warn(`⚠️ Cannot handle offer in state ${currentState}, will process anyway for recovery`);
          }

          signalingStateRef.current.lastProcessedOfferId = offerId;
          signalingStateRef.current.hasOffer = true;
          
          const sessionDesc = deserializeSessionDesc(message.content);
          await peerConnection.setRemoteDescription(sessionDesc);
          
          console.log('✅ [Signaling] Remote description set, creating answer...');
          
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          await sendSignal('answer', answer);
          signalingStateRef.current.hasAnswer = true;
          
          console.log('✅ [Signaling] Answer sent successfully');
          break;
        }
        
        case 'answer': {
          // Create unique ID for this answer based on content
          const answerId = JSON.stringify(message.content);
          
          // Prevent duplicate answers
          if (signalingStateRef.current.lastProcessedAnswerId === answerId) {
            console.log('🚫 Ignoring duplicate answer with same content');
            return;
          }

          // Only accept answer if we have a local offer
          if (currentState !== 'have-local-offer') {
            console.warn(`⚠️ Cannot handle answer in state ${currentState}`);
            return;
          }

          signalingStateRef.current.lastProcessedAnswerId = answerId;
          signalingStateRef.current.hasAnswer = true;
          
          const sessionDesc = deserializeSessionDesc(message.content);
          await peerConnection.setRemoteDescription(sessionDesc);
          break;
        }
        
        case 'ice-candidate': {
          const candidateData = deserializeIceCandidate(message.content);
          // Only add ICE candidates if we have remote description and the candidate is valid
          if (candidateData.candidate && 
              peerConnection.remoteDescription && 
              peerConnection.signalingState !== 'closed') {
            try {
              await peerConnection.addIceCandidate(candidateData);
              console.log('✅ Added ICE candidate');
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
  }, [peerConnection, sendSignal, toast]);

  // Register the signaling handler
  registerSignalHandler(handleSignalingMessage);

  // Reset signaling state when peer connection changes
  useEffect(() => {
    if (peerConnection) {
      signalingStateRef.current = {
        hasOffer: false,
        hasAnswer: false,
        isInitiator: false,
        lastProcessedOfferId: null,
        lastProcessedAnswerId: null
      };
    }
  }, [peerConnection]);

  return {
    signalingState: state,
    sendSignal,
    resetSignalingState: () => {
      signalingStateRef.current = {
        hasOffer: false,
        hasAnswer: false,
        isInitiator: false,
        lastProcessedOfferId: null,
        lastProcessedAnswerId: null
      };
    }
  };
}
