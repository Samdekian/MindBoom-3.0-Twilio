
import { useState, useCallback } from 'react';
import { VideoBlurLevel, VideoEffects } from './types';

export interface UseVideoEffectControlsReturn {
  effects: VideoEffects;
  toggleBlur: () => void;
  setBlurLevel: (level: VideoBlurLevel) => void;
  toggleBackgroundReplacement: () => void;
  toggleNoiseReduction: () => void;
  resetEffects: () => void;
}

export function useVideoEffectControls(): UseVideoEffectControlsReturn {
  const [effects, setEffects] = useState<VideoEffects>({
    blur: 0,
    backgroundReplacement: false,
    noiseReduction: false,
  });

  const toggleBlur = useCallback(() => {
    setEffects(prev => ({ 
      ...prev, 
      blur: prev.blur > 0 ? 0 : 3 as VideoBlurLevel 
    }));
  }, []);

  const setBlurLevel = useCallback((level: VideoBlurLevel) => {
    setEffects(prev => ({ ...prev, blur: level }));
  }, []);

  const toggleBackgroundReplacement = useCallback(() => {
    setEffects(prev => ({ ...prev, backgroundReplacement: !prev.backgroundReplacement }));
  }, []);

  const toggleNoiseReduction = useCallback(() => {
    setEffects(prev => ({ ...prev, noiseReduction: !prev.noiseReduction }));
  }, []);

  const resetEffects = useCallback(() => {
    setEffects({
      blur: 0,
      backgroundReplacement: false,
      noiseReduction: false,
    });
  }, []);

  return {
    effects,
    toggleBlur,
    setBlurLevel,
    toggleBackgroundReplacement,
    toggleNoiseReduction,
    resetEffects,
  };
}
