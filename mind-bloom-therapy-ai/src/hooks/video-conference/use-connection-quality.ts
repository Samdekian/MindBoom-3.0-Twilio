
import { useEffect } from "react";
import { VideoState } from "./types";

export function useConnectionQuality(
  isInSession: boolean,
  peerConnection: RTCPeerConnection | null,
  videoState: VideoState,
  setVideoState: React.Dispatch<React.SetStateAction<VideoState>>
) {
  // Monitor connection quality
  useEffect(() => {
    if (!isInSession || !peerConnection) return;
    
    const intervalId = setInterval(async () => {
      // In a real implementation, this would check stats from peerConnection
      // For now, we'll do a simplified version that checks connection state
      
      const connectionState = peerConnection?.connectionState || "disconnected";
      
      let quality: "excellent" | "good" | "poor" | "disconnected" = "disconnected";
      
      switch (connectionState) {
        case "connected":
          quality = "excellent";
          break;
        case "connecting":
          quality = "good";
          break;
        case "disconnected":
          quality = "poor";
          break;
        case "failed":
          quality = "disconnected";
          break;
        default:
          quality = "good"; // Default to good
      }
      
      setVideoState(prev => ({ ...prev, connectionQuality: quality }));
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, [isInSession, peerConnection, setVideoState]);

  // Return function to handle quality changes
  const handleQualityChange = (quality: "excellent" | "good" | "poor" | "disconnected") => {
    setVideoState(prev => ({ ...prev, connectionQuality: quality }));
  };

  return {
    handleQualityChange
  };
}
