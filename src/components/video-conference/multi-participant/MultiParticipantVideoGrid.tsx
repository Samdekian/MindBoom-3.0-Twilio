import React, { useMemo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { ParticipantInfo } from "@/types/video-session";

interface MultiParticipantVideoGridProps {
  participants: ParticipantInfo[];
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRefs: React.RefObject<HTMLVideoElement>[];
  localStream: MediaStream | null;
  remoteStreams: Record<string, MediaStream>;
  layout: "grid" | "speaker" | "sidebar";
  speakerId?: string;
  isScreenSharing?: boolean;
  onLayoutChange?: (layout: "grid" | "speaker" | "sidebar") => void;
  onParticipantClick?: (participantId: string) => void;
  className?: string;
}

export const MultiParticipantVideoGrid: React.FC<MultiParticipantVideoGridProps> = ({
  participants,
  localVideoRef,
  remoteVideoRefs,
  localStream,
  remoteStreams,
  layout,
  speakerId,
  isScreenSharing = false,
  onLayoutChange,
  onParticipantClick,
  className
}) => {
  const isMobile = useIsMobile();
  
  const currentUser = participants.find(p => p.isCurrentUser);
  const otherParticipants = participants.filter(p => !p.isCurrentUser);
  const totalParticipants = participants.length;

  // Calculate grid dimensions based on participant count
  const gridLayout = useMemo(() => {
    if (totalParticipants <= 2) return "grid-cols-1 md:grid-cols-2";
    if (totalParticipants <= 4) return "grid-cols-2";
    if (totalParticipants <= 6) return "grid-cols-2 md:grid-cols-3";
    if (totalParticipants <= 9) return "grid-cols-3";
    return "grid-cols-3 md:grid-cols-4";
  }, [totalParticipants]);

  // Speaker view - main speaker takes most space, others in sidebar
  const renderSpeakerView = () => {
    const speaker = participants.find(p => p.id === speakerId) || participants[0];
    const sidebarParticipants = participants.filter(p => p.id !== speaker?.id);
    
    return (
      <div className="flex h-full gap-2">
        {/* Main speaker area */}
        <div className="flex-1 relative">
          <ParticipantVideo
            participant={speaker}
            videoRef={speaker?.isCurrentUser ? localVideoRef : remoteVideoRefs[0]}
            stream={speaker?.isCurrentUser ? localStream : remoteStreams[speaker?.id || '']}
            isMainView={true}
            onClick={() => onParticipantClick?.(speaker?.id || '')}
          />
        </div>
        
        {/* Sidebar with other participants */}
        {sidebarParticipants.length > 0 && (
          <div className={cn(
            "flex flex-col gap-2",
            isMobile ? "w-20" : "w-32"
          )}>
            {sidebarParticipants.slice(0, 6).map((participant, index) => (
              <div key={participant.id} className="aspect-video">
                <ParticipantVideo
                  participant={participant}
                  videoRef={participant.isCurrentUser ? localVideoRef : remoteVideoRefs[index]}
                  stream={participant.isCurrentUser ? localStream : remoteStreams[participant.id]}
                  isMainView={false}
                  onClick={() => onParticipantClick?.(participant.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Grid view - all participants in equal-sized grid
  const renderGridView = () => {
    return (
      <div className={cn(
        "grid gap-2 h-full",
        gridLayout
      )}>
        {participants.map((participant, index) => (
          <ParticipantVideo
            key={participant.id}
            participant={participant}
            videoRef={participant.isCurrentUser ? localVideoRef : remoteVideoRefs[index]}
            stream={participant.isCurrentUser ? localStream : remoteStreams[participant.id]}
            isMainView={false}
            onClick={() => onParticipantClick?.(participant.id)}
          />
        ))}
      </div>
    );
  };

  // Sidebar view - one main participant, others in sidebar
  const renderSidebarView = () => {
    const mainParticipant = participants.find(p => !p.isCurrentUser) || participants[0];
    const sidebarParticipants = participants.filter(p => p.id !== mainParticipant?.id);
    
    return (
      <div className="flex h-full gap-2">
        <div className="flex-1">
          <ParticipantVideo
            participant={mainParticipant}
            videoRef={mainParticipant?.isCurrentUser ? localVideoRef : remoteVideoRefs[0]}
            stream={mainParticipant?.isCurrentUser ? localStream : remoteStreams[mainParticipant?.id || '']}
            isMainView={true}
            onClick={() => onParticipantClick?.(mainParticipant?.id || '')}
          />
        </div>
        
        {sidebarParticipants.length > 0 && (
          <div className={cn(
            "flex flex-col gap-2",
            isMobile ? "w-24" : "w-40"
          )}>
            {sidebarParticipants.map((participant, index) => (
              <div key={participant.id} className="aspect-video">
                <ParticipantVideo
                  participant={participant}
                  videoRef={participant.isCurrentUser ? localVideoRef : remoteVideoRefs[index]}
                  stream={participant.isCurrentUser ? localStream : remoteStreams[participant.id]}
                  isMainView={false}
                  onClick={() => onParticipantClick?.(participant.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("w-full h-full", className)}>
      {layout === "speaker" && renderSpeakerView()}
      {layout === "grid" && renderGridView()}
      {layout === "sidebar" && renderSidebarView()}
    </div>
  );
};

// Individual participant video component
interface ParticipantVideoProps {
  participant?: ParticipantInfo;
  videoRef?: React.RefObject<HTMLVideoElement>;
  stream?: MediaStream | null;
  isMainView: boolean;
  onClick?: () => void;
}

const ParticipantVideo: React.FC<ParticipantVideoProps> = ({
  participant,
  videoRef,
  stream,
  isMainView,
  onClick
}) => {
  if (!participant) return null;

  return (
    <div 
      className={cn(
        "relative bg-slate-900 rounded-lg overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-primary/50",
        isMainView ? "h-full" : "aspect-video"
      )}
      onClick={onClick}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={participant.isCurrentUser}
        className="w-full h-full object-cover"
      />
      
      {/* Participant info overlay */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
        <div className="bg-black/70 text-white text-sm px-2 py-1 rounded flex items-center gap-2">
          <span>{participant.name}</span>
          {!participant.isAudioEnabled && (
            <span className="text-red-400">🔇</span>
          )}
        </div>
        
        {/* Video status */}
        {!participant.isVideoEnabled && (
          <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-600 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl">{participant.name.charAt(0).toUpperCase()}</span>
              </div>
              <p className="text-white text-sm">{participant.name}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Speaking indicator */}
      <div className={cn(
        "absolute top-2 right-2 w-3 h-3 rounded-full transition-all",
        participant.isSpeaking ? "bg-green-400 animate-pulse" : "bg-gray-600"
      )} />
    </div>
  );
};