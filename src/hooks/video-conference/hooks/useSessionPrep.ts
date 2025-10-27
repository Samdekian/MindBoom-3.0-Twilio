
import { useState } from "react";
import { VideoDevices } from "../types";

export type PrepStage = "device-check" | "environment-check" | "ready";

/**
 * Hook for managing session preparation stages
 */
export function useSessionPrep(
  getLocalStream: () => Promise<MediaStream | null>,
  devices: VideoDevices
) {
  const [prepStage, setPrepStage] = useState<PrepStage>("device-check");
  const [prepProgress, setPrepProgress] = useState(0);
  
  // Stage details for UI
  const stageDetails = {
    "device-check": {
      title: "Check Your Devices",
      description: "Ensure your camera and microphone are working properly",
      icon: "video"
    },
    "environment-check": {
      title: "Check Your Environment",
      description: "Test your network connection and ensure you're in a quiet space",
      icon: "wifi"
    },
    "ready": {
      title: "Ready to Join",
      description: "You're all set to begin your session",
      icon: "check-circle"
    }
  };
  
  // Function to test network connection
  const testNetworkConnection = async (): Promise<boolean> => {
    try {
      // Simple ping test
      const startTime = Date.now();
      const response = await fetch('/api/ping', { method: 'GET' });
      const endTime = Date.now();
      
      if (!response.ok) {
        return false;
      }
      
      // Calculate network latency
      const latency = endTime - startTime;
      
      // Update progress and move to next stage if connection is good
      if (latency < 500) {
        setPrepProgress(75);
        setPrepStage("ready");
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Network test error:", error);
      return false;
    }
  };
  
  // Completion function
  const completePreparation = (): boolean => {
    setPrepProgress(100);
    setPrepStage("ready");
    return true;
  };
  
  return {
    prepStage,
    prepProgress,
    stageDetails,
    testNetworkConnection,
    completePreparation
  };
}
