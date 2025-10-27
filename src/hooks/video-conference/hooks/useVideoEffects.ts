
import { useState, useCallback } from 'react';
import { VideoBlurLevel } from '@/types/video-conference/video-types';

interface VideoEffectsState {
  blurEnabled: boolean;
  blurLevel: VideoBlurLevel;
  virtualBackgroundEnabled: boolean;
  virtualBackgroundUrl: string | null;
}

export function useVideoEffects() {
  const [effects, setEffects] = useState<VideoEffectsState>({
    blurEnabled: false,
    blurLevel: 4, // Default blur level (must be VideoBlurLevel)
    virtualBackgroundEnabled: false,
    virtualBackgroundUrl: null
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleToggleBlur = useCallback(async (): Promise<boolean> => {
    try {
      setIsProcessing(true);
      
      // Toggle blur effect
      setEffects(prev => ({
        ...prev,
        blurEnabled: !prev.blurEnabled
      }));
      
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing
      setIsProcessing(false);
      return true;
    } catch (error) {
      setIsProcessing(false);
      console.error('Error toggling blur effect:', error);
      return false;
    }
  }, []);
  
  const handleBlurAmountChange = useCallback(async (amount: number): Promise<boolean> => {
    try {
      setIsProcessing(true);
      
      // Ensure amount is within VideoBlurLevel range
      const validAmount = Math.min(10, Math.max(0, amount)) as VideoBlurLevel;
      
      // Update blur level
      setEffects(prev => ({
        ...prev,
        blurLevel: validAmount
      }));
      
      await new Promise(resolve => setTimeout(resolve, 200)); // Simulate processing
      setIsProcessing(false);
      return true;
    } catch (error) {
      setIsProcessing(false);
      console.error('Error changing blur amount:', error);
      return false;
    }
  }, []);
  
  return {
    effects,
    isProcessing,
    handleToggleBlur,
    handleBlurAmountChange
  };
}
