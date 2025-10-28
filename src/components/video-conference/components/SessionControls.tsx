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
  Loader2,
  Users,
  Share2,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import DeviceSettings from './DeviceSettings';
import ConnectionQualityIndicator from './ConnectionQualityIndicator';
import { AdaptiveQualityControls } from './AdaptiveQualityControls';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import BreakoutRoomManager from '../breakout/BreakoutRoomManager';
import { useToast } from '@/hooks/use-toast';

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
  sessionId?: string;
  isTherapist?: boolean;
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
  className,
  sessionId,
  isTherapist = false
}) => {
  const [isTogglingVideo, setIsTogglingVideo] = useState(false);
  const [isTogglingAudio, setIsTogglingAudio] = useState(false);
  const [isTogglingScreen, setIsTogglingScreen] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [showDeviceSettings, setShowDeviceSettings] = useState(false);
  const [showBreakoutRooms, setShowBreakoutRooms] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const { toast } = useToast();

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

  const handleCopyShareLink = async () => {
    if (!sessionId) return;

    const shareUrl = `${window.location.origin}/video-conference/${sessionId}?join=true`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      toast({
        title: 'Link copied!',
        description: 'Session link copied to clipboard',
      });
      
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Please copy the link manually',
        variant: 'destructive'
      });
    }
  };

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

        {/* Share Link */}
        {sessionId && (
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "gap-2",
              linkCopied && "bg-green-50 border-green-300 text-green-700"
            )}
            onClick={handleCopyShareLink}
          >
            {linkCopied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4" />
                Share Link
              </>
            )}
          </Button>
        )}

        {/* Breakout Rooms - Therapists only */}
        {isTherapist && sessionId && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setShowBreakoutRooms(true)}
            disabled={disabled || !isConnected}
          >
            <Users className="h-4 w-4" />
            Breakout Rooms
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

      {/* Breakout Rooms Dialog */}
      {isTherapist && sessionId && (
        <Dialog open={showBreakoutRooms} onOpenChange={setShowBreakoutRooms}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <Users className="h-4 w-4 text-white" />
                </div>
                Breakout Rooms
              </DialogTitle>
              <DialogDescription>
                Create and manage breakout rooms for focused group discussions
              </DialogDescription>
            </DialogHeader>
            <BreakoutRoomManager 
              sessionId={sessionId} 
              isTherapist={isTherapist} 
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};