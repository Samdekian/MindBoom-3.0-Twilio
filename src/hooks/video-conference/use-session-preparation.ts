
import { useState, useCallback } from "react";
import { VideoDevices } from "./types";

export type PrepStage = "device-check" | "environment-check" | "ready";

export interface PrepStageDetails {
  title: string;
  description: string;
  completed: boolean;
  inProgress: boolean;
}

export function useSessionPreparation(
  getLocalStream: (overrides?: { video?: boolean; audio?: boolean }) => Promise<MediaStream | null>,
  devices: VideoDevices
) {
  const [prepStage, setPrepStage] = useState<PrepStage>("device-check");
  const [prepProgress, setPrepProgress] = useState(0);
  
  // Stage details for UI presentation
  const stageDetails: PrepStageDetails = {
    title: prepStage === "device-check" 
      ? "Device Testing" 
      : prepStage === "environment-check"
        ? "Environment Setup"
        : "Ready to Join",
    description: prepStage === "device-check"
      ? "Test your camera and microphone"
      : prepStage === "environment-check"
        ? "Make sure your environment is suitable for a video call"
        : "All checks complete, ready to join session",
    completed: prepStage === "ready",
    inProgress: prepStage !== "ready"
  };

  // Test devices by attempting to access them
  const testDevices = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await getLocalStream({ video: true, audio: true });
      if (stream) {
        // Stop tracks after testing
        stream.getTracks().forEach(track => track.stop());
        
        // Update progress
        setPrepProgress(prev => Math.min(prev + 30, 50));
        
        // Move to next stage if we're in device check
        if (prepStage === "device-check") {
          setPrepStage("environment-check");
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error testing devices:", error);
      return false;
    }
  }, [getLocalStream, prepStage]);

  // Test network connection
  const testNetworkConnection = useCallback(async (): Promise<boolean> => {
    try {
      // Simple network connection test
      const startTime = Date.now();
      const response = await fetch('https://www.google.com', { 
        mode: 'no-cors',
        cache: 'no-cache'
      });
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      const isGoodConnection = latency < 1000; // Less than 1 second
      
      // Update progress
      setPrepProgress(prev => Math.min(prev + 30, 80));
      
      return isGoodConnection;
    } catch (error) {
      console.error("Error testing network connection:", error);
      return false;
    }
  }, []);

  // Complete preparation process
  const completePreparation = useCallback((): boolean => {
    setPrepStage("ready");
    setPrepProgress(100);
    return true;
  }, []);

  return {
    prepStage,
    prepProgress,
    stageDetails,
    testDevices,
    testNetworkConnection,
    completePreparation
  };
}
