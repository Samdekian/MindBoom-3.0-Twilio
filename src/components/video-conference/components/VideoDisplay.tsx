
import React, { useState } from 'react';
import { AlertCircle, Wifi, WifiOff, Video, VideoOff, Mic, MicOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ConnectionQuality, VideoQuality } from '@/types/video-conference';

interface VideoDisplayProps {
  videoEnabled: boolean;
  audioEnabled: boolean;
  screenShareEnabled: boolean;
  connectionQuality: ConnectionQuality;
  videoQuality: VideoQuality;
  videoEffectProps: {
    blurEnabled: boolean;
    blurLevel: number;
    toggleBlur: () => Promise<boolean>;
    updateBlurAmount: (amount: number) => Promise<boolean>;
  };
}

const VideoDisplay: React.FC<VideoDisplayProps> = ({
  videoEnabled,
  audioEnabled,
  screenShareEnabled,
  connectionQuality,
  videoQuality,
  videoEffectProps
}) => {
  // State for responsive/mobile view
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  // Define connection quality indicator based on quality
  const getConnectionIndicator = () => {
    switch (connectionQuality) {
      case 'excellent':
        return (
          <Badge variant="outline" className="bg-green-700/20 text-green-500 border-green-500 flex items-center gap-1">
            <Wifi className="h-3 w-3" />
            <span>Excellent</span>
          </Badge>
        );
      case 'good':
        return (
          <Badge variant="outline" className="bg-blue-700/20 text-blue-500 border-blue-500 flex items-center gap-1">
            <Wifi className="h-3 w-3" />
            <span>Good</span>
          </Badge>
        );
      case 'poor':
        return (
          <Badge variant="outline" className="bg-amber-700/20 text-amber-500 border-amber-500 flex items-center gap-1">
            <Wifi className="h-3 w-3 opacity-70" />
            <span>Poor</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-red-700/20 text-red-500 border-red-500 flex items-center gap-1">
            <WifiOff className="h-3 w-3" />
            <span>Disconnected</span>
          </Badge>
        );
    }
  };
  
  // Handle touch events for mobile
  const handleVideoTap = () => {
    setShowControls(!showControls);
  };
  
  // Apply video quality class
  const getVideoQualityClass = () => {
    switch (videoQuality) {
      case 'high':
        return '';
      case 'medium':
        return 'saturate-75';
      case 'low':
        return 'saturate-50 contrast-75';
      default:
        return '';
    }
  };
  
  // Apply video effects class
  const getVideoEffectsClass = () => {
    if (videoEffectProps.blurEnabled) {
      // Apply blur based on level (0-10)
      const blurAmount = videoEffectProps.blurLevel * 2;
      return `backdrop-blur-[${blurAmount}px]`;
    }
    return '';
  };
  
  return (
    <div className="flex-grow relative bg-gray-900 overflow-hidden" onClick={handleVideoTap}>
      {/* Main video container with accessibility and responsive features */}
      <div 
        className={`w-full h-full relative ${getVideoQualityClass()}`}
        role="application"
        aria-label="Video conference display"
      >
        {/* Placeholder when video is disabled */}
        {!videoEnabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-center">
              <VideoOff className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-300">Video is turned off</p>
            </div>
          </div>
        )}
        
        {/* Video element would be here in a real implementation */}
        <div className="absolute inset-0 flex items-center justify-center">
          {videoEnabled ? (
            <div className="relative w-full h-full bg-gray-700 flex items-center justify-center">
              <span className="text-gray-400">Remote video stream</span>
              {/* Video effects overlay */}
              {videoEffectProps.blurEnabled && (
                <div className={`absolute inset-0 ${getVideoEffectsClass()}`} />
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full w-full">
              <p className="text-gray-400">Video is disabled</p>
            </div>
          )}
        </div>
        
        {/* Status indicators */}
        {showControls && (
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {getConnectionIndicator()}
            
            <Badge variant="outline" className="bg-gray-700/20 border-gray-500 text-gray-300">
              {videoQuality.charAt(0).toUpperCase() + videoQuality.slice(1)} Quality
            </Badge>
            
            {screenShareEnabled && (
              <Badge variant="outline" className="bg-purple-700/20 border-purple-500 text-purple-300">
                Screen Sharing
              </Badge>
            )}
          </div>
        )}
        
        {/* Audio indicator */}
        {showControls && !audioEnabled && (
          <div className="absolute bottom-4 left-4">
            <Badge variant="outline" className="bg-red-700/20 text-red-500 border-red-500 flex items-center gap-1">
              <MicOff className="h-3 w-3" />
              <span>Muted</span>
            </Badge>
          </div>
        )}
        
        {/* Connection warning for poor connection */}
        {connectionQuality === 'poor' && (
          <div 
            className="absolute bottom-4 right-4 bg-amber-900/80 text-amber-100 px-3 py-2 rounded-md flex items-center gap-2 max-w-xs"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 text-amber-300 flex-shrink-0" />
            <p className="text-sm">Poor connection detected. Video quality has been reduced.</p>
          </div>
        )}
        
        {/* Mobile-friendly controls overlay that shows/hides on tap */}
        {showControls && (
          <div className="md:hidden absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
            <div className="flex justify-center space-x-4">
              {/* Mobile control buttons would go here */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoDisplay;
