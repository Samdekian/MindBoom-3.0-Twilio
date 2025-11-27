
import React, { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface VideoPeerConnectionProps {
  peerConnection: RTCPeerConnection | null;
}

export const VideoPeerConnection: React.FC<VideoPeerConnectionProps> = ({ peerConnection }) => {
  const { toast } = useToast();

  // Monitor WebRTC peer connection status
  useEffect(() => {
    if (!peerConnection) return;

    const handleIceConnectionStateChange = () => {
      console.log("ICE connection state changed to:", peerConnection.iceConnectionState);
      
      if (peerConnection.iceConnectionState === "failed") {
        toast({
          title: "Connection Failed",
          description: "Video connection could not be established",
          variant: "destructive"
        });
      } else if (peerConnection.iceConnectionState === "disconnected") {
        toast({
          title: "Connection Issue",
          description: "Video connection temporarily disconnected",
          variant: "warning"
        });
      }
    };

    peerConnection.addEventListener("iceconnectionstatechange", handleIceConnectionStateChange);
    
    return () => {
      peerConnection.removeEventListener("iceconnectionstatechange", handleIceConnectionStateChange);
    };
  }, [peerConnection, toast]);

  // This component doesn't render anything visually
  return null;
};
