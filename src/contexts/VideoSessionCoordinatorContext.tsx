import React, { createContext, useContext, ReactNode } from 'react';
import { useVideoSessionCoordinator } from '@/hooks/video-conference/use-video-session-coordinator';

type VideoSessionCoordinatorContextType = ReturnType<typeof useVideoSessionCoordinator> | null;

const VideoSessionCoordinatorContext = createContext<VideoSessionCoordinatorContextType>(null);

interface VideoSessionCoordinatorProviderProps {
  children: ReactNode;
  sessionId?: string;
}

export function VideoSessionCoordinatorProvider({ 
  children, 
  sessionId 
}: VideoSessionCoordinatorProviderProps) {
  const coordinator = useVideoSessionCoordinator(sessionId);

  return (
    <VideoSessionCoordinatorContext.Provider value={coordinator}>
      {children}
    </VideoSessionCoordinatorContext.Provider>
  );
}

export function useVideoSessionCoordinatorContext() {
  const context = useContext(VideoSessionCoordinatorContext);
  if (!context) {
    throw new Error(
      'useVideoSessionCoordinatorContext must be used within a VideoSessionCoordinatorProvider'
    );
  }
  return context;
}