
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export function useSessionManagement(
  isInSession: boolean,
  setIsInSession: (value: boolean) => void,
  waitingRoomActive: boolean,
  setWaitingRoomActive: (value: boolean) => void,
  getLocalStream: () => Promise<MediaStream | null>,
  initiateCall: (stream: MediaStream) => Promise<boolean>,
  startTimer: () => void,
  stopTimer: () => void,
  cleanup: () => void
) {
  const { toast } = useToast();

  // Join session logic, updated to return Promise<void> instead of Promise<boolean>
  const joinSession = useCallback(async (): Promise<void> => {
    try {
      console.log("Joining video session");
      
      // Get local media stream
      const stream = await getLocalStream();
      if (!stream) {
        toast({
          title: "Media Error",
          description: "Failed to access camera or microphone",
          variant: "destructive",
        });
        return;
      }
      
      setIsInSession(true);
      startTimer();
      
      // Start in waiting room if first to join
      setWaitingRoomActive(true);
      
      // Initiate the call
      const callInitiated = await initiateCall(stream);
      
      if (!callInitiated) {
        toast({
          title: "Call Failed",
          description: "Could not initiate video call",
          variant: "destructive",
        });
        cleanup();
        setIsInSession(false);
        stopTimer();
        return;
      }
      
      return;
    } catch (error) {
      console.error("Error joining session:", error);
      toast({
        title: "Session Error",
        description: "Failed to join video session",
        variant: "destructive",
      });
      cleanup();
      setIsInSession(false);
    }
  }, [getLocalStream, initiateCall, setIsInSession, setWaitingRoomActive, startTimer, stopTimer, cleanup, toast]);

  // Leave session logic - updated to return Promise<void> instead of boolean
  const leaveSession = useCallback(async (): Promise<void> => {
    console.log("Leaving video session");
    
    setIsInSession(false);
    setWaitingRoomActive(false);
    stopTimer();
    cleanup();
    
    toast({
      title: "Session Ended",
      description: "You have left the video session",
    });
  }, [setIsInSession, setWaitingRoomActive, stopTimer, cleanup, toast]);

  // Function to admit someone from waiting room
  const admitFromWaitingRoom = useCallback(() => {
    console.log("Admitting from waiting room");
    setWaitingRoomActive(false);
  }, [setWaitingRoomActive]);

  return {
    joinSession,
    leaveSession,
    admitFromWaitingRoom
  };
}
