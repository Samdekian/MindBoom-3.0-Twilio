import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Grid, Users, Maximize2, Minimize2, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import ParticipantVideoTile from './ParticipantVideoTile';

interface Participant {
  id: string;
  name: string;
  role?: 'therapist' | 'patient' | 'participant';
  videoEnabled: boolean;
  audioEnabled: boolean;
  videoRef?: React.RefObject<HTMLVideoElement>;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
  isCurrentUser?: boolean;
  isActiveSpeaker?: boolean;
}

interface GroupVideoGridProps {
  participants: Participant[];
  activeSpeakerId?: string;
  viewMode?: 'grid' | 'speaker';
  onViewModeChange?: (mode: 'grid' | 'speaker') => void;
  maxParticipants?: number;
  className?: string;
}

const GroupVideoGrid: React.FC<GroupVideoGridProps> = ({
  participants,
  activeSpeakerId,
  viewMode = 'grid',
  onViewModeChange,
  maxParticipants = 15,
  className
}) => {
  const isMobile = useIsMobile();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeParticipantId, setActiveParticipantId] = useState<string | null>(null);

  const activeParticipants = participants.filter(p => p.connectionQuality !== 'disconnected');
  const participantCount = activeParticipants.length;

  // Determine grid layout based on participant count
  const getGridLayout = () => {
    if (viewMode === 'speaker' && activeSpeakerId) {
      return { 
        columns: 'grid-cols-1', 
        mainArea: 'col-span-1',
        sideArea: 'hidden', // Hide sidebar in speaker mode for simplicity
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
      setActiveParticipantId(participantId);
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
            <ParticipantVideoTile
              {...activeSpeaker}
              participantId={activeSpeaker.id}
              tileSize="large"
              isActiveSpeaker={true}
              className="h-full"
            />
          )}
        </div>

        {/* Other Participants Strip */}
        {otherParticipants.length > 0 && (
          <div className="h-32 border-t border-gray-700 p-2">
            <div className="flex gap-2 overflow-x-auto h-full">
              {otherParticipants.map((participant) => (
                <div key={participant.id} className="flex-shrink-0 w-24">
                  <ParticipantVideoTile
                    {...participant}
                    participantId={participant.id}
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
          <ParticipantVideoTile
            key={participant.id}
            {...participant}
            participantId={participant.id}
            tileSize={isMobile ? 'medium' : layout.tileSize}
            onTileClick={() => handleTileClick(participant.id)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={cn(
      "relative bg-gray-900 rounded-lg overflow-hidden",
      "flex flex-col h-full",
      className
    )}>
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

export default GroupVideoGrid;
