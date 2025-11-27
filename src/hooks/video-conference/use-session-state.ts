
import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface SessionState {
  isInSession: boolean;
  waitingRoomActive: boolean;
  connectionAttempt: number;
  sessionError: string | null;
  isReconnecting: boolean;
  lastActiveTime: number;
}

export function useSessionState() {
  const { toast } = useToast();
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  
  const [sessionState, setSessionState] = useState<SessionState>({
    isInSession: false,
    waitingRoomActive: false,
    connectionAttempt: 0,
    sessionError: null,
    isReconnecting: false,
    lastActiveTime: Date.now()
  });

  // Session heartbeat to detect inactive sessions
  const startHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
    }
    
    heartbeatRef.current = setInterval(() => {
      const now = Date.now();
      const timeSinceActive = now - sessionState.lastActiveTime;
      
      // If inactive for more than 30 minutes, show warning
      if (timeSinceActive > 30 * 60 * 1000 && sessionState.isInSession) {
        toast({
          title: "Session Inactive",
          description: "Your session has been inactive for 30 minutes. Please check your connection.",
          variant: "destructive",
        });
      }
    }, 60000); // Check every minute
  }, [sessionState.lastActiveTime, sessionState.isInSession, toast]);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  }, []);

  const updateLastActive = useCallback(() => {
    setSessionState(prev => ({
      ...prev,
      lastActiveTime: Date.now()
    }));
  }, []);

  const joinSession = useCallback(async (isTherapist: boolean, isPatient: boolean): Promise<void> => {
    try {
      setSessionState(prev => ({
        ...prev,
        connectionAttempt: prev.connectionAttempt + 1,
        sessionError: null,
        isReconnecting: false
      }));

      // Simulate session joining with proper error handling
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate occasional failures for testing
          if (Math.random() > 0.9) {
            reject(new Error("Connection timeout"));
          } else {
            resolve(void 0);
          }
        }, 1000);
      });

      setSessionState(prev => ({
        ...prev,
        isInSession: true,
        waitingRoomActive: isPatient,
        connectionAttempt: 0,
        sessionError: null,
        lastActiveTime: Date.now()
      }));

      startHeartbeat();
      
      toast({
        title: "Session Joined",
        description: isTherapist ? "Waiting for patient to join" : "Waiting for therapist to admit you",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to join session";
      
      setSessionState(prev => ({
        ...prev,
        sessionError: errorMessage,
        isReconnecting: false
      }));

      console.error("Failed to join session:", error);
      toast({
        title: "Failed to Join",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [toast, startHeartbeat]);

  const leaveSession = useCallback(async (): Promise<void> => {
    try {
      // Stop all timers
      stopHeartbeat();
      if (sessionTimerRef.current) {
        clearTimeout(sessionTimerRef.current);
        sessionTimerRef.current = null;
      }

      // Clean up session state
      setSessionState({
        isInSession: false,
        waitingRoomActive: false,
        connectionAttempt: 0,
        sessionError: null,
        isReconnecting: false,
        lastActiveTime: Date.now()
      });

      toast({
        title: "Session Left",
        description: "You have left the session",
      });
    } catch (error) {
      console.error("Error leaving session:", error);
      toast({
        title: "Error",
        description: "There was an issue leaving the session",
        variant: "destructive",
      });
    }
  }, [toast, stopHeartbeat]);

  const admitFromWaitingRoom = useCallback((isTherapist: boolean) => {
    if (isTherapist && sessionState.waitingRoomActive) {
      setSessionState(prev => ({
        ...prev,
        waitingRoomActive: false,
        lastActiveTime: Date.now()
      }));
      
      toast({
        title: "Patient Admitted",
        description: "Patient has been admitted to the session",
      });
    }
  }, [sessionState.waitingRoomActive, toast]);

  const retryConnection = useCallback(async () => {
    if (sessionState.connectionAttempt >= 3) {
      setSessionState(prev => ({
        ...prev,
        sessionError: "Maximum retry attempts reached. Please refresh and try again."
      }));
      return;
    }

    setSessionState(prev => ({
      ...prev,
      isReconnecting: true,
      sessionError: null
    }));

    try {
      // Simulate reconnection attempt
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSessionState(prev => ({
        ...prev,
        isReconnecting: false,
        connectionAttempt: prev.connectionAttempt + 1,
        lastActiveTime: Date.now()
      }));

      toast({
        title: "Reconnection Successful",
        description: "Your session has been restored",
      });
    } catch (error) {
      setSessionState(prev => ({
        ...prev,
        isReconnecting: false,
        sessionError: "Reconnection failed. Please try again."
      }));
    }
  }, [sessionState.connectionAttempt, toast]);

  const clearError = useCallback(() => {
    setSessionState(prev => ({
      ...prev,
      sessionError: null
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopHeartbeat();
      if (sessionTimerRef.current) {
        clearTimeout(sessionTimerRef.current);
      }
    };
  }, [stopHeartbeat]);

  return {
    sessionState,
    joinSession,
    leaveSession,
    admitFromWaitingRoom,
    retryConnection,
    clearError,
    updateLastActive,
    // Expose individual state properties for convenience
    ...sessionState
  };
}
