
import { useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";

export function useReconnectionStrategy(
  peerConnection: RTCPeerConnection | null,
  isInSession: boolean,
  getLocalStream: () => Promise<MediaStream | null>,
  initiateCall: (stream: MediaStream) => Promise<boolean>
) {
  const [reconnecting, setReconnecting] = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const { toast } = useToast();
  
  const maxReconnectAttempts = 5;
  const reconnectDelayMs = 2000;
  
  const reconnectTimeoutRef = useRef<number | null>(null);
  const connectionMonitorRef = useRef<number | null>(null);
  
  // Attempt reconnection
  const attemptReconnect = useCallback(async () => {
    if (!isInSession) return false;
    
    try {
      setReconnecting(true);
      setReconnectAttempt(prev => prev + 1);
      
      // Get local stream
      const stream = await getLocalStream();
      if (!stream) {
        throw new Error("Failed to get local stream for reconnection");
      }
      
      // Attempt to initiate call
      const success = await initiateCall(stream);
      
      if (success) {
        toast({
          title: "Reconnected",
          description: "Your connection has been restored"
        });
        
        setReconnecting(false);
        setReconnectAttempt(0);
        return true;
      } else {
        throw new Error("Failed to reconnect");
      }
    } catch (err) {
      console.error("Reconnection attempt failed:", err);
      
      // Check if we've reached max attempts
      if (reconnectAttempt >= maxReconnectAttempts) {
        toast({
          title: "Connection Failed",
          description: "Unable to reconnect after multiple attempts",
          variant: "destructive",
        });
        setReconnecting(false);
        return false;
      }
      
      // Schedule another attempt
      if (reconnectTimeoutRef.current !== null) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
      
      reconnectTimeoutRef.current = window.setTimeout(() => {
        attemptReconnect();
      }, reconnectDelayMs);
      
      return false;
    }
  }, [isInSession, getLocalStream, initiateCall, reconnectAttempt, toast]);
  
  // Manual reconnect function that can be called by user
  const manualReconnect = useCallback(async () => {
    // Reset previous attempts
    setReconnectAttempt(0);
    return attemptReconnect();
  }, [attemptReconnect]);
  
  // Monitor connection state for automatic reconnection
  useEffect(() => {
    if (!peerConnection || !isInSession) return;
    
    // Clear previous monitor
    if (connectionMonitorRef.current !== null) {
      window.clearInterval(connectionMonitorRef.current);
    }
    
    connectionMonitorRef.current = window.setInterval(() => {
      // Check connection state
      if (peerConnection.connectionState === 'failed' || 
          peerConnection.connectionState === 'disconnected') {
        // Only attempt reconnect if we're not already trying
        if (!reconnecting && reconnectAttempt < maxReconnectAttempts) {
          console.log("Connection lost, attempting to reconnect...");
          toast({
            title: "Connection Lost",
            description: "Attempting to reconnect..."
          });
          attemptReconnect();
        }
      }
    }, 5000); // Check every 5 seconds
    
    return () => {
      if (connectionMonitorRef.current !== null) {
        window.clearInterval(connectionMonitorRef.current);
      }
      
      if (reconnectTimeoutRef.current !== null) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [peerConnection, isInSession, reconnecting, reconnectAttempt, attemptReconnect, toast]);
  
  return {
    reconnecting,
    reconnectAttempt,
    manualReconnect
  };
}
