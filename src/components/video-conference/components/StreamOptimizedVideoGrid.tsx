import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Grid, Users, Maximize2, Minimize2, LayoutGrid, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import ParticipantVideoTile from './ParticipantVideoTile';

interface Participant {
  id: string;
  participantId: string;
  name: string;
  role?: 'therapist' | 'patient' | 'participant';
  videoEnabled: boolean;
  audioEnabled: boolean;
  videoRef?: React.RefObject<HTMLVideoElement>;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
  isCurrentUser?: boolean;
  isActiveSpeaker?: boolean;
}

interface StreamOptimizedVideoGridProps {
  participants: Participant[];
  activeSpeakerId?: string;
  viewMode?: 'grid' | 'speaker';
  onViewModeChange?: (mode: 'grid' | 'speaker') => void;
  maxParticipants?: number;
  className?: string;
  onParticipantVisibilityChange?: (participantId: string, isVisible: boolean) => void;
  bandwidthMode?: 'auto' | 'low' | 'high';
  onBandwidthModeChange?: (mode: 'auto' | 'low' | 'high') => void;
  streamManager?: {
    optimizeStreamQuality: (agoraUid: number, isVisible: boolean) => Promise<void>;
    handleParticipantVisibilityChange: (participantId: string, isVisible: boolean) => void;
  };
}

const StreamOptimizedVideoGrid: React.FC<StreamOptimizedVideoGridProps> = ({
  participants,
  activeSpeakerId,
  viewMode = 'grid',
  onViewModeChange,
  maxParticipants = 15,
  className,
  onParticipantVisibilityChange,
  bandwidthMode = 'auto',
  onBandwidthModeChange,
  streamManager
}) => {
  const isMobile = useIsMobile();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [visibleParticipants, setVisibleParticipants] = useState<Set<string>>(new Set());

  const activeParticipants = participants.filter(p => p.connectionQuality !== 'disconnected');
  const participantCount = activeParticipants.length;

  // Determine which participants should be prioritized for high quality
  const prioritizedParticipants = useMemo(() => {
    const prioritized = new Set<string>();
    
    // Always prioritize active speaker
    if (activeSpeakerId) {
      prioritized.add(activeSpeakerId);
    }
    
    // In speaker view, prioritize the main speaker
    if (viewMode === 'speaker' && activeSpeakerId) {
      prioritized.add(activeSpeakerId);
    }
    
    // In grid view, prioritize visible participants
    if (viewMode === 'grid') {
      visibleParticipants.forEach(id => prioritized.add(id));
    }
    
    return prioritized;
  }, [activeSpeakerId, viewMode, visibleParticipants]);

  // Determine grid layout based on participant count
  const getGridLayout = () => {
    if (viewMode === 'speaker' && activeSpeakerId) {
      return { 
        columns: 'grid-cols-1', 
        mainArea: 'col-span-1',
        sideArea: 'hidden',
        tileSize: 'large' as const
      };
    }

    if (participantCount <= 1) {
      return { 
        columns: 'grid-cols-1', 
        mainArea: 'col-span-1',
        sideArea: 'hidden',
        tileSize: 'large' as const
      };
    } else if (participantCount <= 4) {
      return { 
        columns: 'grid-cols-2', 
        mainArea: 'col-span-2',
        sideArea: 'hidden',
        tileSize: 'medium' as const
      };
    } else if (participantCount <= 9) {
      return { 
        columns: 'grid-cols-3', 
        mainArea: 'col-span-3',
        sideArea: 'hidden',
        tileSize: 'medium' as const
      };
    } else {
      return { 
        columns: 'grid-cols-4', 
        mainArea: 'col-span-4',
        sideArea: 'hidden',
        tileSize: 'small' as const
      };
    }
  };

  const layout = getGridLayout();

  // Intersection Observer for visibility tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const participantId = entry.target.getAttribute('data-participant-id');
          if (participantId) {
            const isVisible = entry.isIntersecting;
            
            setVisibleParticipants(prev => {
              const newVisible = new Set(prev);
              if (isVisible) {
                newVisible.add(participantId);
              } else {
                newVisible.delete(participantId);
              }
              return newVisible;
            });
            
            onParticipantVisibilityChange?.(participantId, isVisible);
            streamManager?.handleParticipantVisibilityChange(participantId, isVisible);
          }
        });
      },
      {
        threshold: 0.1, // Trigger when 10% of the element is visible
        rootMargin: '50px' // Add some margin for preloading
      }
    );

    // Observe all participant tiles
    const tiles = document.querySelectorAll('[data-participant-id]');
    tiles.forEach(tile => observer.observe(tile));

    return () => {
      tiles.forEach(tile => observer.unobserve(tile));
    };
  }, [participants, onParticipantVisibilityChange]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleTileClick = (participantId: string) => {
    if (viewMode === 'speaker') {
      // Switch active speaker
      // This would typically update the activeSpeakerId
    }
  };

  const getConnectionIcon = (quality: string) => {
    switch (quality) {
      case 'excellent':
      case 'good':
        return <Wifi className="h-3 w-3 text-green-400" />;
      case 'poor':
        return <Wifi className="h-3 w-3 text-yellow-400" />;
      case 'disconnected':
        return <Wifi className="h-3 w-3 text-red-400" />;
      default:
        return <Wifi className="h-3 w-3 text-gray-400" />;
    }
  };

  const renderSpeakerView = () => {
    const activeSpeaker = activeParticipants.find(p => p.id === activeSpeakerId) || activeParticipants[0];
    const otherParticipants = activeParticipants.filter(p => p.id !== activeSpeaker?.id);

    return (
      <div className="h-full flex flex-col">
        {/* Main Speaker */}
        <div className="flex-1 p-2">
          {activeSpeaker && (
            <div data-participant-id={activeSpeaker.id}>
              <ParticipantVideoTile
                {...activeSpeaker}
                tileSize="large"
                isActiveSpeaker={true}
                className="h-full"
              />
            </div>
          )}
        </div>

        {/* Other Participants Strip */}
        {otherParticipants.length > 0 && (
          <div className="h-32 border-t border-gray-700 p-2">
            <div className="flex gap-2 overflow-x-auto h-full">
              {otherParticipants.map((participant) => (
                <div 
                  key={participant.id} 
                  className="flex-shrink-0 w-24"
                  data-participant-id={participant.id}
                >
                  <ParticipantVideoTile
                    {...participant}
                    tileSize="small"
                    onTileClick={() => handleTileClick(participant.id)}
                    className="h-full"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderGridView = () => {
    return (
      <div className={cn(
        "grid gap-2 p-2 h-full",
        layout.columns,
        isMobile && "grid-cols-1"
      )}>
        {activeParticipants.map((participant) => (
          <div 
            key={participant.id}
            data-participant-id={participant.id}
          >
            <ParticipantVideoTile
              {...participant}
              tileSize={isMobile ? 'medium' : layout.tileSize}
              onTileClick={() => handleTileClick(participant.id)}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={cn(
      "relative bg-gray-900 rounded-lg overflow-hidden",
      "flex flex-col h-full",
      className
    )} data-testid="video-grid">
      {/* Header Controls */}
      <div className="flex items-center justify-between p-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-400" />
          <Badge variant="secondary" className="bg-gray-700 text-white">
            {participantCount}/{maxParticipants}
          </Badge>
          {participantCount >= maxParticipants && (
            <Badge variant="destructive" className="text-xs">
              Full
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Bandwidth Mode Toggle */}
          <div className="flex rounded-lg border border-gray-600 overflow-hidden">
            <Button
              variant={bandwidthMode === 'low' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onBandwidthModeChange?.('low')}
              className="rounded-none px-2 py-1 text-xs"
            >
              Low
            </Button>
            <Button
              variant={bandwidthMode === 'auto' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onBandwidthModeChange?.('auto')}
              className="rounded-none px-2 py-1 text-xs"
            >
              Auto
            </Button>
            <Button
              variant={bandwidthMode === 'high' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onBandwidthModeChange?.('high')}
              className="rounded-none px-2 py-1 text-xs"
            >
              HD
            </Button>
          </div>

          {/* View Mode Toggle */}
          {!isMobile && participantCount > 1 && (
            <div className="flex rounded-lg border border-gray-600 overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange?.('grid')}
                className="rounded-none px-3 py-1"
              >
                <LayoutGrid className="h-3 w-3" />
              </Button>
              <Button
                variant={viewMode === 'speaker' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange?.('speaker')}
                className="rounded-none px-3 py-1"
              >
                <Grid className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Fullscreen Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="text-gray-400 hover:text-white"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Video Grid Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'speaker' && !isMobile ? renderSpeakerView() : renderGridView()}
      </div>

      {/* Bandwidth Optimization Info */}
      {bandwidthMode === 'low' && (
        <div className="absolute bottom-4 left-4">
          <Badge variant="secondary" className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-300">
            Low bandwidth mode active
          </Badge>
        </div>
      )}

      {/* Participant Overflow Warning */}
      {participantCount > maxParticipants && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-2">
            <p className="text-red-300 text-sm text-center">
              Session at maximum capacity. Some participants may experience performance issues.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreamOptimizedVideoGrid;
