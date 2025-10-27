
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Wifi, 
  WifiOff,
  Crown,
  User,
  Volume2,
  VolumeX
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ParticipantVideoTileProps {
  participantId: string;
  name: string;
  role?: 'therapist' | 'patient' | 'participant';
  videoEnabled: boolean;
  audioEnabled: boolean;
  videoRef?: React.RefObject<HTMLVideoElement>;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
  isCurrentUser?: boolean;
  isActiveSpeaker?: boolean;
  tileSize: 'small' | 'medium' | 'large';
  onTileClick?: () => void;
  className?: string;
}

const ParticipantVideoTile: React.FC<ParticipantVideoTileProps> = ({
  participantId,
  name,
  role = 'participant',
  videoEnabled,
  audioEnabled,
  videoRef,
  connectionQuality,
  isCurrentUser = false,
  isActiveSpeaker = false,
  tileSize = 'medium',
  onTileClick,
  className
}) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getTileHeight = () => {
    switch (tileSize) {
      case 'small': return 'h-24 md:h-32';
      case 'medium': return 'h-32 md:h-48';
      case 'large': return 'h-48 md:h-64 lg:h-80';
      default: return 'h-32 md:h-48';
    }
  };

  const getConnectionIcon = () => {
    switch (connectionQuality) {
      case 'excellent':
        return <Wifi className="h-3 w-3 text-green-400" />;
      case 'good':
        return <Wifi className="h-3 w-3 text-blue-400" />;
      case 'poor':
        return <Wifi className="h-3 w-3 text-yellow-400" />;
      case 'disconnected':
        return <WifiOff className="h-3 w-3 text-red-400" />;
    }
  };

  const getRoleIcon = () => {
    if (role === 'therapist') {
      return <Crown className="h-3 w-3 text-yellow-500" />;
    }
    return <User className="h-3 w-3 text-blue-500" />;
  };

  return (
    <div
      className={cn(
        "relative bg-gray-900 rounded-lg overflow-hidden border-2 transition-all duration-200",
        getTileHeight(),
        isActiveSpeaker && "border-green-500 ring-2 ring-green-500/20",
        !isActiveSpeaker && "border-gray-700",
        isCurrentUser && "border-blue-500",
        connectionQuality === 'disconnected' && "opacity-50",
        onTileClick && "cursor-pointer hover:border-gray-500",
        className
      )}
      onClick={onTileClick}
    >
      {/* Video or Avatar */}
      {videoEnabled && videoRef ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isCurrentUser}
          className={cn(
            "w-full h-full object-cover",
            isCurrentUser && "scale-x-[-1]" // Mirror effect for current user
          )}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <Avatar className={cn(
            tileSize === 'small' && "h-8 w-8",
            tileSize === 'medium' && "h-12 w-12",
            tileSize === 'large' && "h-16 w-16"
          )}>
            <AvatarImage src={`/avatars/${participantId}.jpg`} />
            <AvatarFallback className="bg-gray-700 text-white">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      {/* Connection Quality Indicator */}
      <div className="absolute top-2 right-2">
        <Badge 
          variant="secondary" 
          className={cn(
            "bg-black/50 text-white border-none p-1",
            tileSize === 'small' && "text-xs px-1"
          )}
        >
          {getConnectionIcon()}
        </Badge>
      </div>

      {/* Participant Info */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Badge 
              variant="secondary" 
              className={cn(
                "bg-black/50 text-white border-none",
                tileSize === 'small' && "text-xs px-1"
              )}
            >
              {getRoleIcon()}
              <span className="ml-1">
                {isCurrentUser ? 'You' : name}
              </span>
            </Badge>
          </div>
          
          <div className="flex items-center gap-1">
            {/* Audio Status */}
            <div className={cn(
              "p-1 rounded",
              audioEnabled ? "bg-green-500/20" : "bg-red-500/20"
            )}>
              {audioEnabled ? (
                <Volume2 className="h-3 w-3 text-green-400" />
              ) : (
                <VolumeX className="h-3 w-3 text-red-400" />
              )}
            </div>
            
            {/* Video Status */}
            <div className={cn(
              "p-1 rounded",
              videoEnabled ? "bg-green-500/20" : "bg-red-500/20"
            )}>
              {videoEnabled ? (
                <Video className="h-3 w-3 text-green-400" />
              ) : (
                <VideoOff className="h-3 w-3 text-red-400" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Active Speaker Indicator */}
      {isActiveSpeaker && (
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="bg-green-500 text-white animate-pulse">
            <Volume2 className="h-3 w-3 mr-1" />
            Speaking
          </Badge>
        </div>
      )}

      {/* Loading State */}
      {connectionQuality === 'disconnected' && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
            <p className="text-xs">Reconnecting...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantVideoTile;
