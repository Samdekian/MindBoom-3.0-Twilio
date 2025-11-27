
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export function useDeviceTesting(getLocalStream: (overrides?: any) => Promise<MediaStream | null>) {
  const { toast } = useToast();

  // Define testDevices function that returns a Promise<boolean>
  const testDevices = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await getLocalStream();
      if (stream) {
        toast({
          title: "Device Test",
          description: "Your camera and microphone are working properly",
        });
        return true;
      } else {
        toast({
          title: "Device Test Failed",
          description: "Unable to access your camera or microphone",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error testing devices:", error);
      toast({
        title: "Device Test Failed",
        description: "Unable to access your camera or microphone",
        variant: "destructive",
      });
      return false;
    }
  }, [getLocalStream, toast]);

  return { testDevices };
}
