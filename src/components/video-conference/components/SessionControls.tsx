import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Settings, 
  Monitor, 
  MonitorOff,
  RotateCcw,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import DeviceSettings from './DeviceSettings';
import ConnectionQualityIndicator from './ConnectionQualityIndicator';
import { AdaptiveQualityControls } from './AdaptiveQualityControls';

interface SessionControlsProps {
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing?: boolean;
  onToggleVideo: () => Promise<boolean>;
  onToggleAudio: () => Promise<boolean>;
  onToggleScreenShare?: () => Promise<boolean>;
  onReconnect?: () => Promise<void>;
  connectionState: 'IDLE' | 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'FAILED';
  qualityMetrics?: any; // Connection quality metrics
  adaptationControls?: any; // Network adaptation controls
  disabled?: boolean;
  className?: string;
}

export const SessionControls: React.FC<SessionControlsProps> = ({
  isVideoEnabled,
  isAudioEnabled,
  isScreenSharing = false,
  onToggleVideo,
  onToggleAudio,
  onToggleScreenShare,
  onReconnect,
  connectionState,
  qualityMetrics,
  adaptationControls,
  disabled = false,
  className
}) => {
  const [isTogglingVideo, setIsTogglingVideo] = useState(false);
  const [isTogglingAudio, setIsTogglingAudio] = useState(false);
  const [isTogglingScreen, setIsTogglingScreen] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [showDeviceSettings, setShowDeviceSettings] = useState(false);

  const handleToggleVideo = async () => {
    if (isTogglingVideo || disabled) return;
    
    setIsTogglingVideo(true);
    try {
      await onToggleVideo();
    } finally {
      setIsTogglingVideo(false);
    }
  };

  const handleToggleAudio = async () => {
    if (isTogglingAudio || disabled) return;
    
    setIsTogglingAudio(true);
    try {
      await onToggleAudio();
    } finally {
      setIsTogglingAudio(false);
    }
  };

  const handleToggleScreenShare = async () => {
    if (!onToggleScreenShare || isTogglingScreen || disabled) return;
    
    setIsTogglingScreen(true);
    try {
      await onToggleScreenShare();
    } finally {
      setIsTogglingScreen(false);
    }
  };

  const handleReconnect = async () => {
    if (!onReconnect || isReconnecting) return;
    
    setIsReconnecting(true);
    try {
      await onReconnect();
    } finally {
      setIsReconnecting(false);
    }
  };

  const isConnected = connectionState === 'CONNECTED';
  const needsReconnection = connectionState === 'FAILED' || connectionState === 'DISCONNECTED';

  return (
    <>
      <div className={cn("flex items-center justify-center gap-2 flex-wrap", className)}>
        {/* Video Control */}
        <Button
          variant={isVideoEnabled ? "default" : "secondary"}
          size="sm"
          className={cn(
            "gap-2 min-w-[100px]",
            !isVideoEnabled && "bg-red-500/10 hover:bg-red-500/20 text-red-600"
          )}
          onClick={handleToggleVideo}
          disabled={disabled || isTogglingVideo || !isConnected}
        >
          {isTogglingVideo ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isVideoEnabled ? (
            <Video className="h-4 w-4" />
          ) : (
            <VideoOff className="h-4 w-4" />
          )}
          {isVideoEnabled ? 'Video On' : 'Video Off'}
        </Button>

        {/* Audio Control */}
        <Button
          variant={isAudioEnabled ? "default" : "secondary"}
          size="sm"
          className={cn(
            "gap-2 min-w-[100px]",
            !isAudioEnabled && "bg-red-500/10 hover:bg-red-500/20 text-red-600"
          )}
          onClick={handleToggleAudio}
          disabled={disabled || isTogglingAudio || !isConnected}
        >
          {isTogglingAudio ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isAudioEnabled ? (
            <Mic className="h-4 w-4" />
          ) : (
            <MicOff className="h-4 w-4" />
          )}
          {isAudioEnabled ? 'Mic On' : 'Mic Off'}
        </Button>

        {/* Screen Share Control */}
        {onToggleScreenShare && (
          <Button
            variant={isScreenSharing ? "default" : "outline"}
            size="sm"
            className="gap-2"
            onClick={handleToggleScreenShare}
            disabled={disabled || isTogglingScreen || !isConnected}
          >
            {isTogglingScreen ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isScreenSharing ? (
              <Monitor className="h-4 w-4" />
            ) : (
              <MonitorOff className="h-4 w-4" />
            )}
            {isScreenSharing ? 'Stop Share' : 'Share Screen'}
          </Button>
        )}

        {/* Device Settings */}
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setShowDeviceSettings(true)}
          disabled={disabled}
        >
          <Settings className="h-4 w-4" />
          Devices
        </Button>

        {/* Reconnection Control */}
        {needsReconnection && onReconnect && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
            onClick={handleReconnect}
            disabled={isReconnecting}
          >
            {isReconnecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
            Reconnect
          </Button>
        )}
      </div>

      {/* Connection Quality Badge */}
      <div className="flex justify-center mt-2 gap-2">
        {qualityMetrics && (
          <ConnectionQualityIndicator 
            quality={qualityMetrics}
            isConnected={connectionState === 'CONNECTED'}
            detailed
          />
        )}
        
        {adaptationControls && (
          <AdaptiveQualityControls {...adaptationControls} />
        )}
        
        <Badge 
          variant={
            connectionState === 'CONNECTED' ? 'default' :
            connectionState === 'CONNECTING' ? 'secondary' :
            connectionState === 'FAILED' ? 'destructive' :
            'outline'
          }
          className="text-xs"
        >
          {connectionState === 'CONNECTED' && 'Connected'}
          {connectionState === 'CONNECTING' && 'Connecting...'}
          {connectionState === 'FAILED' && 'Connection Failed'}
          {connectionState === 'DISCONNECTED' && 'Reconnecting...'}
          {connectionState === 'IDLE' && 'Ready'}
        </Badge>
      </div>

      {/* Device Settings Modal */}
      <DeviceSettings 
        open={showDeviceSettings}
        onOpenChange={setShowDeviceSettings}
      />
    </>
  );
};