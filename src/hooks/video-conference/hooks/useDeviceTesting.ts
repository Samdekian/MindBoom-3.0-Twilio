
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook for testing devices
 */
export function useDeviceTesting(getLocalStream: () => Promise<MediaStream | null>) {
  const { toast } = useToast();
  
  const testDevices = useCallback(async () => {
    try {
      const stream = await getLocalStream();
      if (!stream) {
        toast({
          title: "Device Error",
          description: "Unable to access camera or microphone",
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Device Test",
        description: "Your camera and microphone are working properly"
      });
      
      return true;
    } catch (error) {
      console.error("Error testing devices:", error);
      toast({
        title: "Device Test Failed",
        description: "Unable to access your camera or microphone",
        variant: "destructive"
      });
      return false;
    }
  }, [getLocalStream, toast]);
  
  return { testDevices };
}
