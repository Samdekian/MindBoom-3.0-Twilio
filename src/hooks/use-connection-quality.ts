
import { useEffect } from "react";
import { useToast } from "./use-toast";
import { VideoSessionState } from "@/contexts/VideoSessionContext";

// Simulate network quality check (in a real app, this would use WebRTC stats)
export const useConnectionQuality = (
  isInSession: boolean,
  setVideoState: React.Dispatch<React.SetStateAction<VideoSessionState>>
) => {
  const { toast } = useToast();
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!isInSession) {
        clearInterval(intervalId);
        return;
      }
      const rand = Math.random();
      let quality: VideoSessionState["connectionQuality"];
      if (rand < 0.7) {
        quality = "excellent";
      } else if (rand < 0.9) {
        quality = "good";
      } else if (rand < 0.98) {
        quality = "poor";
      } else {
        quality = "disconnected";
        toast({
          title: "Connection Lost",
          description: "Your connection to the session has been lost. Attempting to reconnect...",
          variant: "destructive",
        });
        setTimeout(() => {
          setVideoState(prev => ({ ...prev, connectionQuality: "poor" }));
          setTimeout(() => {
            setVideoState(prev => ({ ...prev, connectionQuality: "good" }));
            toast({
              title: "Reconnected",
              description: "Your connection has been restored",
            });
          }, 2000);
        }, 3000);
      }
      setVideoState(prev => ({ ...prev, connectionQuality: quality }));
    }, 10000);
    return () => clearInterval(intervalId);
  }, [isInSession, setVideoState, toast]);
};
