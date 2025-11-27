
import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface VideoCanvasProps {
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  remoteAudioEnabled?: boolean;
  remoteVideoEnabled?: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
  localParticipantName?: string;
  remoteParticipantName?: string;
  className?: string;
}

/**
 * Enhanced video canvas with full-screen utilization and modern PiP design
 * Handles aspect ratios, connection status, and participant indicators
 */
const VideoCanvas: React.FC<VideoCanvasProps> = ({
  localVideoRef,
  remoteVideoRef,
  isVideoEnabled,
  isAudioEnabled,
  remoteAudioEnabled = true,
  remoteVideoEnabled = true,
  connectionQuality,
  localParticipantName = "You",
  remoteParticipantName = "Other Participant",
  className
}) => {
  const isMobile = useIsMobile();
  const [localVideoPosition, setLocalVideoPosition] = React.useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = React.useState(false);

  const getConnectionIcon = () => {
    switch (connectionQuality) {
      case 'excellent':
      case 'good':
        return <Wifi className="h-3 w-3 text-green-400" />;
      case 'poor':
        return <Wifi className="h-3 w-3 text-yellow-400" />;
      case 'disconnected':
        return <WifiOff className="h-3 w-3 text-red-400" />;
    }
  };

  return (
    <div className={cn(
      "relative w-full h-full bg-gray-900 overflow-hidden",
      "flex items-center justify-center",
      className
    )}>
      {/* Remote video (main) */}
      <div className="relative w-full h-full">
        {remoteVideoEnabled ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mb-4 mx-auto">
                <VideoOff className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-lg">{remoteParticipantName}</p>
              <p className="text-sm text-gray-400">Video is off</p>
            </div>
          </div>
        )}

        {/* Remote participant info */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <Badge variant="secondary" className="bg-black/50 text-white border-none">
            <span className="mr-2">{remoteParticipantName}</span>
            {getConnectionIcon()}
          </Badge>
          <div className="flex items-center gap-1">
            {!remoteAudioEnabled && (
              <Badge variant="destructive" className="bg-red-500/20 border-red-500">
                <MicOff className="h-3 w-3" />
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Local video (Picture-in-Picture) */}
      <div 
        className={cn(
          "absolute z-10 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600/50 shadow-lg",
          isMobile 
            ? "w-32 h-24 bottom-4 right-4" 
            : "w-48 h-36",
          isDragging && "cursor-grabbing",
          !isDragging && "cursor-grab"
        )}
        style={!isMobile ? { 
          left: localVideoPosition.x, 
          top: localVideoPosition.y 
        } : undefined}
      >
        {isVideoEnabled ? (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]" // Mirror effect for local video
          />
        ) : (
          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
            <VideoOff className={cn(
              "text-gray-400",
              isMobile ? "h-6 w-6" : "h-8 w-8"
            )} />
          </div>
        )}

        {/* Local participant info */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          <Badge variant="secondary" className="bg-black/50 text-white border-none text-xs">
            {localParticipantName}
          </Badge>
          <div className="flex items-center gap-1">
            {!isAudioEnabled && (
              <div className="bg-red-500 rounded p-1">
                <MicOff className="h-2 w-2 text-white" />
              </div>
            )}
            {!isVideoEnabled && (
              <div className="bg-red-500 rounded p-1">
                <VideoOff className="h-2 w-2 text-white" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Connection quality indicator */}
      {connectionQuality !== 'excellent' && (
        <div className="absolute top-4 right-4">
          <Badge 
            variant={connectionQuality === 'disconnected' ? 'destructive' : 'secondary'}
            className={cn(
              "bg-black/50 border-none",
              connectionQuality === 'poor' && "text-yellow-400",
              connectionQuality === 'disconnected' && "text-red-400"
            )}
          >
            {getConnectionIcon()}
            <span className="ml-1 capitalize">{connectionQuality}</span>
          </Badge>
        </div>
      )}
    </div>
  );
};

export default VideoCanvas;
