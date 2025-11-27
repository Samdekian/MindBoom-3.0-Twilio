
import { useCallback } from "react";

interface SignalingOperationsProps {
  sendSignal: (type: 'offer' | 'answer' | 'ice-candidate', content: any) => Promise<boolean>;
}

/**
 * Hook for WebRTC signaling operations (offer/answer creation, remote description setting)
 */
export function useSignalingOperations({ sendSignal }: SignalingOperationsProps) {
  
  const createOffer = useCallback(async (pc: RTCPeerConnection): Promise<boolean> => {
    try {
      console.log("Creating offer");
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      await pc.setLocalDescription(offer);
      
      const success = await sendSignal('offer', {
        type: offer.type,
        sdp: offer.sdp
      });
      if (success) {
        console.log("Offer sent successfully");
      }
      return success;
    } catch (error) {
      console.error("Error creating offer:", error);
      return false;
    }
  }, [sendSignal]);

  const createAnswer = useCallback(async (pc: RTCPeerConnection): Promise<boolean> => {
    try {
      console.log("Creating answer");
      const answer = await pc.createAnswer();
      
      await pc.setLocalDescription(answer);
      
      const success = await sendSignal('answer', {
        type: answer.type,
        sdp: answer.sdp
      });
      if (success) {
        console.log("Answer sent successfully");
      }
      return success;
    } catch (error) {
      console.error("Error creating answer:", error);
      return false;
    }
  }, [sendSignal]);

  const setRemoteDescription = useCallback(async (
    pc: RTCPeerConnection, 
    type: 'offer' | 'answer', 
    sdp: string
  ): Promise<boolean> => {
    try {
      console.log(`Setting remote description: ${type}`);
      const desc = new RTCSessionDescription({ type, sdp });
      await pc.setRemoteDescription(desc);
      console.log("Remote description set successfully");
      return true;
    } catch (error) {
      console.error("Error setting remote description:", error);
      return false;
    }
  }, []);

  const addIceCandidate = useCallback(async (
    pc: RTCPeerConnection, 
    candidateData: RTCIceCandidateInit
  ): Promise<boolean> => {
    try {
      if (candidateData.candidate) {
        console.log("Adding ICE candidate");
        await pc.addIceCandidate(candidateData);
        console.log("ICE candidate added successfully");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error adding ICE candidate:", error);
      return false;
    }
  }, []);

  return {
    createOffer,
    createAnswer,
    setRemoteDescription,
    addIceCandidate
  };
}
