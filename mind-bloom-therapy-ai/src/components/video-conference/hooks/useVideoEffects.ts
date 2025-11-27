
import { useState, useCallback } from 'react';
import { VideoBlurLevel, VideoEffects } from "@/types/video-conference";

/**
 * Enhanced hook for managing video effects such as background blur
 * with improved accessibility and mobile support
 */
export function useVideoEffects(): [VideoEffects, (blurEnabled: boolean) => Promise<boolean>, (blurLevel: number) => Promise<boolean>, string] {
  const [videoEffects, setVideoEffects] = useState<VideoEffects>({
    blurEnabled: false,
    blurLevel: 0 as VideoBlurLevel,
  });
  
  const [applyingEffect, setApplyingEffect] = useState<string>("");

  const toggleBlur = useCallback(async (blurEnabled: boolean): Promise<boolean> => {
    try {
      setApplyingEffect("blur");
      // Simulate processing delay for UI feedback
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setVideoEffects(prev => ({
        ...prev,
        blurEnabled: blurEnabled,
      }));
      
      setApplyingEffect("");
      return true;
    } catch (error) {
      console.error("Error toggling blur:", error);
      setApplyingEffect("");
      return false;
    }
  }, []);

  const updateBlurAmount = useCallback(async (blurLevel: number): Promise<boolean> => {
    try {
      // For slider interactions, we don't want to show the processing state
      // as it would make the slider feel unresponsive
      setVideoEffects(prev => ({
        ...prev,
        blurLevel: blurLevel as VideoBlurLevel,
      }));
      return true;
    } catch (error) {
      console.error("Error updating blur amount:", error);
      return false;
    }
  }, []);

  return [videoEffects, toggleBlur, updateBlurAmount, applyingEffect];
}
