import React, { useEffect, useRef } from "react";
import { MultiParticipantVideoGrid } from "./MultiParticipantVideoGrid";
import { ParticipantsList } from "./ParticipantsList";
import { LayoutControls } from "./LayoutControls";
import { useMultiParticipantSession } from "@/hooks/multi-participant/useMultiParticipantSession";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Users, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MultiParticipantContainerProps {
  sessionId: string;
  currentUserId: string;
  currentUserName: string;
  isHost?: boolean;
  localStream: MediaStream | null;
  remoteStreams: Record<string, MediaStream>;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  onParticipantAction?: (action: string, participantId: string) => void;
  className?: string;
}

export const MultiParticipantContainer: React.FC<MultiParticipantContainerProps> = ({
  sessionId,
  currentUserId,
  currentUserName,
  isHost = false,
  localStream,
  remoteStreams,
  localVideoRef,
  onParticipantAction,
  className
}) => {
  const {
    participants,
    layout,
    dominantSpeaker,
    pinnedParticipant,
    isFullscreen,
    addParticipant,
    removeParticipant,
    muteParticipant,
    makeHost,
    pinParticipant,
    setLayout,
    toggleFullscreen,
    getVideoRef,
    getRemoteVideoRefs,
    participantCount,
    attachAudioStream
  } = useMultiParticipantSession({
    sessionId,
    currentUserId,
    currentUserName,
    isHost,
    maxParticipants: 12
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Attach audio streams for speaking detection
  useEffect(() => {
    Object.entries(remoteStreams).forEach(([participantId, stream]) => {
      attachAudioStream(participantId, stream);
    });
  }, [remoteStreams, attachAudioStream]);

  // Handle fullscreen events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      if (isCurrentlyFullscreen !== isFullscreen) {
        // Sync state with actual fullscreen status
        setLayout(isCurrentlyFullscreen ? layout : "grid");
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isFullscreen, layout]);

  const handleParticipantAction = (action: string, participantId: string) => {
    switch (action) {
      case 'mute':
        muteParticipant(participantId);
        break;
      case 'remove':
        removeParticipant(participantId);
        break;
      case 'makeHost':
        makeHost(participantId);
        break;
      case 'pin':
        pinParticipant(participantId);
        break;
      default:
        onParticipantAction?.(action, participantId);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative w-full h-full bg-black rounded-lg overflow-hidden",
        className
      )}
    >
      {/* Main video grid */}
      <div className="h-full p-4">
        <MultiParticipantVideoGrid
          participants={participants}
          localVideoRef={localVideoRef}
          remoteVideoRefs={getRemoteVideoRefs()}
          localStream={localStream}
          remoteStreams={remoteStreams}
          layout={layout}
          speakerId={dominantSpeaker || undefined}
          isScreenSharing={false} // TODO: Implement screen sharing detection
          onLayoutChange={setLayout}
          onParticipantClick={(participantId) => {
            if (layout === "grid") {
              pinParticipant(participantId);
              setLayout("speaker");
            }
          }}
        />
      </div>

      {/* Control bar */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-black/50 backdrop-blur-sm rounded-lg p-3">
        {/* Layout controls */}
        <LayoutControls
          currentLayout={layout}
          onLayoutChange={setLayout}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          participantCount={participantCount}
        />

        {/* Participants list trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="bg-white/10 hover:bg-white/20 border-white/20">
              <Users className="w-4 h-4 mr-2" />
              Participants
              <Badge variant="secondary" className="ml-2">
                {participantCount}
              </Badge>
            </Button>
          </SheetTrigger>
          
          <SheetContent side="right" className="w-80">
            <ParticipantsList
              participants={participants}
              currentUserId={currentUserId}
              isHost={isHost}
              onMuteParticipant={(id) => handleParticipantAction('mute', id)}
              onRemoveParticipant={(id) => handleParticipantAction('remove', id)}
              onMakeHost={(id) => handleParticipantAction('makeHost', id)}
              onPinParticipant={(id) => handleParticipantAction('pin', id)}
              pinnedParticipantId={pinnedParticipant}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Speaking indicator overlay (for current layout) */}
      {dominantSpeaker && layout === "speaker" && (
        <div className="absolute top-4 left-4 bg-green-500/80 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          {participants.find(p => p.id === dominantSpeaker)?.name || 'Speaking'}
        </div>
      )}

      {/* Pinned participant indicator */}
      {pinnedParticipant && (
        <div className="absolute top-4 right-4 bg-blue-500/80 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
          <Settings className="w-3 h-3" />
          Pinned: {participants.find(p => p.id === pinnedParticipant)?.name}
        </div>
      )}
    </div>
  );
};