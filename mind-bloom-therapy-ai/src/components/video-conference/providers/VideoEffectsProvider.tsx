
import React, { useState, createContext, useContext } from "react";

interface VideoEffectsState {
  blur: boolean;
  blurAmount: number;
  virtualBackground: boolean;
  backgroundImage: string;
}

interface VideoEffectsContextValue {
  effects: VideoEffectsState;
  toggleBlur: () => Promise<boolean>;
  setBlurAmount: (amount: number) => Promise<boolean>;
  toggleVirtualBackground: () => Promise<boolean>;
  setBackgroundImage: (imageUrl: string) => Promise<boolean>;
}

const VideoEffectsContext = createContext<VideoEffectsContextValue | null>(null);

interface VideoEffectsProviderProps {
  children: React.ReactNode;
  applyEffectsToStream?: (stream: MediaStream, effects: VideoEffectsState) => Promise<MediaStream>;
  getLocalStream?: () => Promise<MediaStream | null>;
}

export const VideoEffectsProvider: React.FC<VideoEffectsProviderProps> = ({
  children,
  applyEffectsToStream,
  getLocalStream
}) => {
  const [effects, setEffects] = useState<VideoEffectsState>({
    blur: false,
    blurAmount: 5,
    virtualBackground: false,
    backgroundImage: ""
  });

  const toggleBlur = async (): Promise<boolean> => {
    try {
      const newBlurState = !effects.blur;
      
      // If we have a function to apply effects to a stream, use it
      if (applyEffectsToStream && getLocalStream) {
        const stream = await getLocalStream();
        if (stream) {
          await applyEffectsToStream(stream, {
            ...effects,
            blur: newBlurState
          });
        }
      }
      
      // Update state
      setEffects(prev => ({
        ...prev,
        blur: newBlurState
      }));
      
      return true;
    } catch (error) {
      console.error("Error toggling blur effect:", error);
      return false;
    }
  };

  const setBlurAmount = async (amount: number): Promise<boolean> => {
    try {
      // If blur is enabled and we have stream functions, apply the new amount
      if (effects.blur && applyEffectsToStream && getLocalStream) {
        const stream = await getLocalStream();
        if (stream) {
          await applyEffectsToStream(stream, {
            ...effects,
            blurAmount: amount
          });
        }
      }
      
      // Update state
      setEffects(prev => ({
        ...prev,
        blurAmount: amount
      }));
      
      return true;
    } catch (error) {
      console.error("Error changing blur amount:", error);
      return false;
    }
  };

  const toggleVirtualBackground = async (): Promise<boolean> => {
    try {
      const newState = !effects.virtualBackground;
      
      // Apply to stream if possible
      if (applyEffectsToStream && getLocalStream) {
        const stream = await getLocalStream();
        if (stream) {
          await applyEffectsToStream(stream, {
            ...effects,
            virtualBackground: newState
          });
        }
      }
      
      // Update state
      setEffects(prev => ({
        ...prev,
        virtualBackground: newState,
        // Disable blur when enabling virtual background
        blur: newState ? false : prev.blur
      }));
      
      return true;
    } catch (error) {
      console.error("Error toggling virtual background:", error);
      return false;
    }
  };

  const setBackgroundImage = async (imageUrl: string): Promise<boolean> => {
    try {
      // Apply to stream if possible
      if (applyEffectsToStream && getLocalStream && effects.virtualBackground) {
        const stream = await getLocalStream();
        if (stream) {
          await applyEffectsToStream(stream, {
            ...effects,
            backgroundImage: imageUrl
          });
        }
      }
      
      // Update state
      setEffects(prev => ({
        ...prev,
        backgroundImage: imageUrl
      }));
      
      return true;
    } catch (error) {
      console.error("Error setting background image:", error);
      return false;
    }
  };

  return (
    <VideoEffectsContext.Provider value={{
      effects,
      toggleBlur,
      setBlurAmount,
      toggleVirtualBackground,
      setBackgroundImage
    }}>
      {children}
    </VideoEffectsContext.Provider>
  );
};

export const useVideoEffects = () => {
  const context = useContext(VideoEffectsContext);
  if (!context) {
    throw new Error("useVideoEffects must be used within a VideoEffectsProvider");
  }
  return context;
};
