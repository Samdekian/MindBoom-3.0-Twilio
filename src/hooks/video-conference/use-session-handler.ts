
import { useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from "../use-toast";

export function useSessionHandler(
  appointmentId: string | undefined,
  localStream: MediaStream | null,
  remoteStream: MediaStream | null,
  startTimer: () => void,
  stopTimer: () => void,
  getLocalStream: (overrides?: { video?: boolean; audio?: boolean }) => Promise<MediaStream | null>,
  initiateCall: (stream: MediaStream) => Promise<boolean>
) {
  const { toast } = useToast();
  const [isInSession, setIsInSession] = useState(false);
  const [waitingRoomActive, setWaitingRoomActive] = useState(false);
  const [connectionAttempt, setConnectionAttempt] = useState(0);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  
  const cleanupRef = useRef<(() => void)[]>([]);
  const maxRetries = 3;
  const retryDelay = 3000;

  // Add cleanup function
  const addCleanup = useCallback((cleanupFn: () => void) => {
    cleanupRef.current.push(cleanupFn);
  }, []);

  // Execute all cleanup functions
  const executeCleanup = useCallback(() => {
    cleanupRef.current.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.error("Cleanup error:", error);
      }
    });
    cleanupRef.current = [];
  }, []);

  // Enhanced join session with better error handling
  const joinSession = useCallback(async (): Promise<void> => {
    try {
      setSessionError(null);
      setIsReconnecting(false);
      
      // Get local media stream with timeout
      const streamPromise = getLocalStream();
      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error("Media access timeout")), 10000);
      });
      
      const stream = await Promise.race([streamPromise, timeoutPromise]);
      
      if (!stream) {
        throw new Error("Failed to access camera or microphone. Please check your permissions.");
      }
      
      // Add stream cleanup
      addCleanup(() => {
        if (stream) {
          stream.getTracks().forEach(track => {
            track.stop();
          });
        }
      });
      
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
      
      setConnectionAttempt(0); // Reset on successful connection
      
      toast({
        title: "Session Joined",
        description: "Successfully connected to video session",
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to join video session";
      console.error("Error joining session:", error);
      
      setSessionError(errorMessage);
      setIsInSession(false);
      stopTimer();
      executeCleanup();
      
      toast({
        title: "Session Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error; // Re-throw for caller handling
    }
  }, [getLocalStream, initiateCall, startTimer, stopTimer, toast, addCleanup, executeCleanup]);

  // Enhanced leave session with proper cleanup
  const leaveSession = useCallback(async (): Promise<void> => {
    try {
      // Execute all cleanup functions
      executeCleanup();
      
      // Stop local streams
      if (localStream) {
        localStream.getTracks().forEach(track => {
          track.stop();
        });
      }
      
      // Reset all state
      setIsInSession(false);
      setWaitingRoomActive(false);
      setSessionError(null);
      setIsReconnecting(false);
      setConnectionAttempt(0);
      stopTimer();
      
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
  }, [localStream, stopTimer, toast, executeCleanup]);

  // Admit from waiting room
  const admitFromWaitingRoom = useCallback(() => {
    if (waitingRoomActive) {
      setWaitingRoomActive(false);
      toast({
        title: "Admitted to Session",
        description: "You can now begin your video session",
      });
    }
  }, [waitingRoomActive, toast]);

  // Enhanced reconnect with exponential backoff
  const handleReconnect = useCallback(async () => {
    if (!isInSession || isReconnecting) return;
    
    if (connectionAttempt >= maxRetries) {
      setSessionError("Maximum reconnection attempts reached. Please rejoin the session.");
      return;
    }
    
    setIsReconnecting(true);
    setConnectionAttempt(prev => prev + 1);
    
    try {
      // Wait with exponential backoff
      const delay = retryDelay * Math.pow(2, connectionAttempt);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      const stream = await getLocalStream();
      if (stream) {
        const success = await initiateCall(stream);
        if (success) {
          setIsReconnecting(false);
          setSessionError(null);
          toast({
            title: "Reconnected",
            description: "Successfully restored connection",
          });
        } else {
          throw new Error("Failed to re-establish call");
        }
      } else {
        throw new Error("Failed to get media stream for reconnection");
      }
    } catch (error) {
      console.error("Reconnect error:", error);
      setIsReconnecting(false);
      
      if (connectionAttempt + 1 >= maxRetries) {
        setSessionError("Unable to reconnect. Please rejoin the session.");
      } else {
        setSessionError(`Reconnection failed. Retry ${connectionAttempt + 1}/${maxRetries}`);
      }
    }
  }, [isInSession, isReconnecting, connectionAttempt, getLocalStream, initiateCall, toast]);

  // Clear error state
  const clearError = useCallback(() => {
    setSessionError(null);
  }, []);

  // Effect for handling remote stream connection
  useEffect(() => {
    if (remoteStream && waitingRoomActive) {
      // If we get a remote stream while in waiting room, exit waiting room
      setWaitingRoomActive(false);
      toast({
        title: "Participant Joined",
        description: "Another participant has joined the session",
      });
    }
  }, [remoteStream, waitingRoomActive, toast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      executeCleanup();
    };
  }, [executeCleanup]);

  return {
    isInSession,
    waitingRoomActive,
    connectionAttempt,
    sessionError,
    isReconnecting,
    joinSession,
    leaveSession,
    admitFromWaitingRoom,
    handleReconnect,
    clearError,
    addCleanup
  };
}
