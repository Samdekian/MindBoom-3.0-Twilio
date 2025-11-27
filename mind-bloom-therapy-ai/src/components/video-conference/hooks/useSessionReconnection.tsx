
import { useEffect, useState } from "react";
import type { VideoSessionState } from "@/types/video-session";
import { useToast } from "@/hooks/use-toast";

export function useSessionReconnection(
  isInSession: boolean,
  videoState: VideoSessionState,
  getLocalStream: () => Promise<MediaStream | null>,
  initiateCall: (stream: MediaStream) => Promise<boolean>,
  maxAttempts: number = 3
) {
  const [connectionAttempt, setConnectionAttempt] = useState(0);
  const { toast } = useToast();

  // Automatically try to reconnect if connection fails
  useEffect(() => {
    if (isInSession && videoState.connectionQuality === "disconnected" && connectionAttempt < maxAttempts) {
      const timer = setTimeout(async () => {
        console.log("Attempting to reconnect...", connectionAttempt + 1);
        setConnectionAttempt(prev => prev + 1);
        
        // Get the local stream before initiating call
        try {
          const stream = await getLocalStream();
          if (stream) {
            await initiateCall(stream);
          } else {
            console.error("Failed to get local stream for reconnection");
            toast({
              title: "Reconnection Failed",
              description: "Could not access camera or microphone for reconnection",
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error("Reconnection error:", error);
          toast({
            title: "Reconnection Error",
            description: "Failed to re-establish video connection",
            variant: "destructive"
          });
        }
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isInSession, videoState.connectionQuality, connectionAttempt, initiateCall, getLocalStream, maxAttempts, toast]);

  return { connectionAttempt };
}
