import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MonitorSpeaker, Monitor, StopCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useVideoSession } from '@/contexts/VideoSessionContext';

interface ScreenShareControlsProps {
  className?: string;
  onScreenShareStart?: () => void;
  onScreenShareStop?: () => void;
}

export const ScreenShareControls: React.FC<ScreenShareControlsProps> = ({
  className,
  onScreenShareStart,
  onScreenShareStop
}) => {
  const { videoState, toggleScreenShare } = useVideoSession();
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

  const handleStartScreenShare = useCallback(async () => {
    try {
      setIsStarting(true);
      
      // Check for screen capture API support
      if (!navigator.mediaDevices?.getDisplayMedia) {
        throw new Error('Screen sharing is not supported in this browser');
      }

      await toggleScreenShare();
      onScreenShareStart?.();
      
      toast.success('Screen sharing started');
    } catch (error) {
      console.error('Failed to start screen sharing:', error);
      
      let errorMessage = 'Failed to start screen sharing';
      if (error instanceof Error) {
        if (error.message.includes('Permission denied')) {
          errorMessage = 'Screen sharing permission denied';
        } else if (error.message.includes('not supported')) {
          errorMessage = 'Screen sharing not supported in this browser';
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsStarting(false);
    }
  }, [toggleScreenShare, onScreenShareStart]);

  const handleStopScreenShare = useCallback(async () => {
    try {
      setIsStopping(true);
      
      await toggleScreenShare();
      onScreenShareStop?.();
      
      toast.success('Screen sharing stopped');
    } catch (error) {
      console.error('Failed to stop screen sharing:', error);
      toast.error('Failed to stop screen sharing');
    } finally {
      setIsStopping(false);
    }
  }, [toggleScreenShare, onScreenShareStop]);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {videoState.isScreenSharing ? (
        <>
          <Badge variant="default" className="bg-green-500/20 text-green-300 border-green-500/50">
            <MonitorSpeaker className="h-3 w-3 mr-1" />
            Sharing Screen
          </Badge>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={handleStopScreenShare}
            disabled={isStopping}
            className="hover:bg-red-600"
          >
            {isStopping ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <StopCircle className="h-4 w-4 mr-1" />
            )}
            Stop Sharing
          </Button>
        </>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={handleStartScreenShare}
          disabled={isStarting}
          className="hover:bg-blue-600 hover:text-white"
        >
          {isStarting ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Monitor className="h-4 w-4 mr-1" />
          )}
          Share Screen
        </Button>
      )}
    </div>
  );
};