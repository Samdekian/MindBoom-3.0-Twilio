
import { useCallback } from "react";
import { useVideoEffects } from "@/hooks/use-video-effects";
import { useToast } from "@/hooks/use-toast";

export function useVideoEffectControls(
  localVideoRef: React.RefObject<HTMLVideoElement>,
  getLocalStream: () => Promise<MediaStream | null>
) {
  const { toast } = useToast();
  
  // Initialize video effects
  const {
    effects,
    toggleBlur,
    setBlurAmount,
    isProcessing
  } = useVideoEffects(localVideoRef);
  
  // Handle video blur effect
  const handleToggleBlur = useCallback(async () => {
    if (!localVideoRef.current) return;
    
    // Get a fresh local stream
    const stream = await getLocalStream();
    if (!stream) return;
    
    // Apply blur effect and get processed stream
    const processedStream = await toggleBlur(stream);
    if (processedStream) {
      // Use the processed stream instead
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = processedStream;
      }
    }
  }, [localVideoRef, getLocalStream, toggleBlur]);
  
  // Handle blur amount change
  const handleBlurAmountChange = useCallback(async (amount: number) => {
    if (!localVideoRef.current) return;
    
    // Get a fresh local stream
    const stream = await getLocalStream();
    if (!stream) return;
    
    // Apply updated blur amount
    const processedStream = await setBlurAmount(amount, stream);
    if (processedStream) {
      // Use the processed stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = processedStream;
      }
    }
  }, [localVideoRef, getLocalStream, setBlurAmount]);

  return {
    effects,
    isProcessing,
    handleToggleBlur,
    handleBlurAmountChange
  };
}
