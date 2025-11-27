
import { useCallback, useState } from 'react';
import { useToast } from './use-toast';

export interface VideoEffectsOptions {
  blur: boolean;
  blurAmount: number;  // 0-10 scale
  virtualBackground: boolean;
  backgroundImage: string | null;
}

export const useVideoEffects = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const [effects, setEffects] = useState<VideoEffectsOptions>({
    blur: false,
    blurAmount: 5,
    virtualBackground: false,
    backgroundImage: null
  });
  
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  // Initialize canvas for processing
  const initCanvas = useCallback(() => {
    if (!canvas) {
      const newCanvas = document.createElement('canvas');
      const newCtx = newCanvas.getContext('2d', { willReadFrequently: true });
      
      if (newCtx) {
        setCanvas(newCanvas);
        setCtx(newCtx);
        return { canvas: newCanvas, ctx: newCtx };
      }
    }
    
    return { canvas, ctx };
  }, [canvas, ctx]);
  
  // Apply blur effect to video
  const applyBlur = useCallback((stream: MediaStream, amount: number = 5) => {
    if (!videoRef.current) return null;
    
    try {
      setIsProcessing(true);
      const { canvas: newCanvas, ctx: newCtx } = initCanvas();
      
      if (!newCanvas || !newCtx) {
        throw new Error("Failed to initialize canvas context");
      }
      
      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack) return null;
      
      // Get video dimensions
      const { width, height } = videoRef.current.getBoundingClientRect();
      newCanvas.width = width;
      newCanvas.height = height;
      
      // Simple CSS blur filter (more efficient than manual pixel manipulation)
      newCtx.filter = `blur(${amount}px)`;
      
      const processFrame = () => {
        if (!videoRef.current || !newCtx) return;
        
        newCtx.drawImage(videoRef.current, 0, 0, newCanvas.width, newCanvas.height);
        
        if (effects.blur) {
          requestAnimationFrame(processFrame);
        }
      };
      
      // Start processing frames
      requestAnimationFrame(processFrame);
      
      // Create output stream from canvas
      const outputStream = newCanvas.captureStream();
      
      setIsProcessing(false);
      return outputStream;
    } catch (error) {
      console.error("Error applying video effects:", error);
      toast({
        title: "Effect Error",
        description: "Failed to apply video effect",
        variant: "destructive",
      });
      setIsProcessing(false);
      return null;
    }
  }, [videoRef, effects.blur, initCanvas, toast]);
  
  // Toggle blur effect on/off
  const toggleBlur = useCallback(async (stream: MediaStream) => {
    setEffects(prev => ({ ...prev, blur: !prev.blur }));
    
    if (!effects.blur) {
      // Turning on blur
      return applyBlur(stream, effects.blurAmount);
    } else {
      // Turning off blur - return original stream
      return null;
    }
  }, [effects.blur, effects.blurAmount, applyBlur]);
  
  // Adjust blur amount
  const setBlurAmount = useCallback((amount: number, stream: MediaStream) => {
    setEffects(prev => ({ ...prev, blurAmount: amount }));
    
    if (effects.blur) {
      return applyBlur(stream, amount);
    }
    return null;
  }, [effects.blur, applyBlur]);
  
  return {
    effects,
    isProcessing,
    toggleBlur,
    setBlurAmount
  };
};
