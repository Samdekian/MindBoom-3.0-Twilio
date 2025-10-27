
import { useCallback, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export interface SessionManagementProps {
  isInSession: boolean;
  setIsInSession: (value: boolean) => void;
  waitingRoomActive: boolean;
  setWaitingRoomActive: (value: boolean) => void;
  getLocalStream: () => Promise<MediaStream | null>;
  initiateCall: (stream: MediaStream) => Promise<boolean>;
  startTimer: () => void;
  stopTimer: () => void;
  cleanup: () => void;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
}

export function useSessionManagement({
  isInSession,
  setIsInSession,
  waitingRoomActive,
  setWaitingRoomActive,
  getLocalStream,
  initiateCall,
  startTimer,
  stopTimer,
  cleanup,
  connectionQuality
}: SessionManagementProps) {
  const { toast } = useToast();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3;

  // Enhanced join session with better error handling
  const joinSession = useCallback(async (): Promise<void> => {
    try {
      console.log("Joining video session");
      
      // Get local media stream with timeout
      const streamPromise = getLocalStream();
      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error("Media access timeout")), 10000);
      });
      
      const stream = await Promise.race([streamPromise, timeoutPromise]);
      
      if (!stream) {
        throw new Error("Failed to access camera or microphone. Please check your permissions.");
      }
      
      setIsInSession(true);
      startTimer();
      
      // Start in waiting room until another participant joins
      setWaitingRoomActive(true);
      
      // Initiate the call with timeout
      const callPromise = initiateCall(stream);
      const callTimeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => reject(new Error("Call initiation timeout")), 15000);
      });
      
      const callInitiated = await Promise.race([callPromise, callTimeoutPromise]);
      
      if (!callInitiated) {
        throw new Error("Could not initiate video call. Please check your internet connection.");
      }
      
      reconnectAttempts.current = 0; // Reset on successful connection
      
      toast({
        title: "Session Joined",
        description: "Successfully connected to video session",
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to join video session";
      console.error("Error joining session:", error);
      
      cleanup();
      setIsInSession(false);
      stopTimer();
      
      toast({
        title: "Session Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    }
  }, [getLocalStream, initiateCall, setIsInSession, setWaitingRoomActive, startTimer, stopTimer, cleanup, toast]);

  // Enhanced leave session with proper cleanup
  const leaveSession = useCallback(async (): Promise<void> => {
    try {
      console.log("Leaving video session");
      
      // Clear any pending reconnection attempts
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      // Execute cleanup
      cleanup();
      
      // Reset all state
      setIsInSession(false);
      setWaitingRoomActive(false);
      stopTimer();
      reconnectAttempts.current = 0;
      
      toast({
        title: "Session Ended",
        description: "You have left the video session",
      });
      
    } catch (error) {
      console.error("Error leaving session:", error);
      toast({
        title: "Warning",
        description: "Session ended but some cleanup may have failed",
        variant: "destructive",
      });
    }
  }, [cleanup, setIsInSession, setWaitingRoomActive, stopTimer, toast]);

  // Admit from waiting room
  const admitFromWaitingRoom = useCallback(() => {
    if (waitingRoomActive) {
      setWaitingRoomActive(false);
      toast({
        title: "Admitted to Session",
        description: "You can now begin your video session",
      });
    }
  }, [waitingRoomActive, setWaitingRoomActive, toast]);

  // Automatic reconnection with exponential backoff
  const attemptReconnection = useCallback(async () => {
    if (!isInSession || reconnectAttempts.current >= maxReconnectAttempts) {
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        toast({
          title: "Connection Lost",
          description: "Unable to reconnect. Please rejoin the session.",
          variant: "destructive"
        });
      }
      return;
    }

    reconnectAttempts.current += 1;
    const delay = Math.pow(2, reconnectAttempts.current - 1) * 2000; // Exponential backoff

    toast({
      title: "Reconnecting",
      description: `Attempting to reconnect... (${reconnectAttempts.current}/${maxReconnectAttempts})`
    });

    reconnectTimeoutRef.current = setTimeout(async () => {
      try {
        const stream = await getLocalStream();
        if (stream) {
          const success = await initiateCall(stream);
          if (success) {
            reconnectAttempts.current = 0;
            toast({
              title: "Reconnected",
              description: "Connection restored successfully"
            });
          } else {
            attemptReconnection(); // Try again
          }
        } else {
          attemptReconnection(); // Try again
        }
      } catch (error) {
        console.error("Reconnection failed:", error);
        attemptReconnection(); // Try again
      }
    }, delay);
  }, [isInSession, getLocalStream, initiateCall, toast]);

  // Monitor connection quality for automatic reconnection
  useEffect(() => {
    if (isInSession && connectionQuality === 'disconnected') {
      attemptReconnection();
    }
  }, [isInSession, connectionQuality, attemptReconnection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    joinSession,
    leaveSession,
    admitFromWaitingRoom,
    reconnectAttempts: reconnectAttempts.current,
    maxReconnectAttempts
  };
}
