
import { useState, useCallback } from 'react';
import { VideoBlurLevel } from '@/hooks/video-conference/types';

interface VideoEffects {
  blurEnabled: boolean;
  blurLevel: VideoBlurLevel;
}

export function useVideoEffects() {
  const [videoEffects, setVideoEffects] = useState<VideoEffects>({
    blurEnabled: false,
    blurLevel: 0 as VideoBlurLevel
  });
  
  const toggleBlur = useCallback(async (): Promise<boolean> => {
    try {
      setVideoEffects(prev => ({
        ...prev,
        blurEnabled: !prev.blurEnabled
      }));
      return true;
    } catch (error) {
      console.error('Failed to toggle blur:', error);
      return false;
    }
  }, []);
  
  const updateBlurAmount = useCallback(async (amount: number): Promise<boolean> => {
    try {
      setVideoEffects(prev => ({
        ...prev,
        blurLevel: amount as VideoBlurLevel
      }));
      return true;
    } catch (error) {
      console.error('Failed to update blur amount:', error);
      return false;
    }
  }, []);
  
  return {
    videoEffects,
    toggleBlur,
    updateBlurAmount
  };
}
