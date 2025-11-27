import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ParticipantInfo } from "@/types/video-session";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  MoreVertical, 
  Crown, 
  UserX,
  Volume2,
  VolumeX
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ParticipantsListProps {
  participants: ParticipantInfo[];
  currentUserId: string;
  isHost?: boolean;
  onMuteParticipant?: (participantId: string) => void;
  onRemoveParticipant?: (participantId: string) => void;
  onMakeHost?: (participantId: string) => void;
  onPinParticipant?: (participantId: string) => void;
  pinnedParticipantId?: string;
  className?: string;
}

export const ParticipantsList: React.FC<ParticipantsListProps> = ({
  participants,
  currentUserId,
  isHost = false,
  onMuteParticipant,
  onRemoveParticipant,
  onMakeHost,
  onPinParticipant,
  pinnedParticipantId,
  className
}) => {
  const sortedParticipants = [...participants].sort((a, b) => {
    // Current user first, then host, then by name
    if (a.isCurrentUser) return -1;
    if (b.isCurrentUser) return 1;
    if (a.isHost && !b.isHost) return -1;
    if (b.isHost && !a.isHost) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className={cn("bg-background border rounded-lg", className)}>
      <div className="p-4 border-b">
        <h3 className="font-semibold flex items-center gap-2">
          Participants
          <Badge variant="secondary">{participants.length}</Badge>
        </h3>
      </div>
      
      <ScrollArea className="max-h-80">
        <div className="p-2">
          {sortedParticipants.map((participant) => (
            <ParticipantItem
              key={participant.id}
              participant={participant}
              currentUserId={currentUserId}
              isHost={isHost}
              isPinned={pinnedParticipantId === participant.id}
              onMute={() => onMuteParticipant?.(participant.id)}
              onRemove={() => onRemoveParticipant?.(participant.id)}
              onMakeHost={() => onMakeHost?.(participant.id)}
              onPin={() => onPinParticipant?.(participant.id)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

interface ParticipantItemProps {
  participant: ParticipantInfo;
  currentUserId: string;
  isHost: boolean;
  isPinned: boolean;
  onMute: () => void;
  onRemove: () => void;
  onMakeHost: () => void;
  onPin: () => void;
}

const ParticipantItem: React.FC<ParticipantItemProps> = ({
  participant,
  currentUserId,
  isHost,
  isPinned,
  onMute,
  onRemove,
  onMakeHost,
  onPin
}) => {
  const isCurrentUser = participant.id === currentUserId;
  const canControlParticipant = isHost && !isCurrentUser;

  return (
    <div className={cn(
      "flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors",
      isPinned && "bg-primary/10 border border-primary/20",
      participant.isSpeaking && "ring-2 ring-green-400/50"
    )}>
      {/* Avatar */}
      <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
        {participant.name.charAt(0).toUpperCase()}
      </div>
      
      {/* Participant info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            "font-medium truncate",
            isCurrentUser && "text-primary"
          )}>
            {participant.name}
          </span>
          
          {isCurrentUser && (
            <Badge variant="outline" className="text-xs">You</Badge>
          )}
          
          {participant.isHost && (
            <Crown className="w-4 h-4 text-amber-500" />
          )}
          
          {isPinned && (
            <Badge variant="secondary" className="text-xs">Pinned</Badge>
          )}
        </div>
        
        {participant.role && (
          <p className="text-xs text-muted-foreground capitalize">
            {participant.role}
          </p>
        )}
      </div>
      
      {/* Status indicators */}
      <div className="flex items-center gap-1">
        {participant.isAudioEnabled ? (
          <Mic className="w-4 h-4 text-green-500" />
        ) : (
          <MicOff className="w-4 h-4 text-red-500" />
        )}
        
        {participant.isVideoEnabled ? (
          <Video className="w-4 h-4 text-green-500" />
        ) : (
          <VideoOff className="w-4 h-4 text-red-500" />
        )}
        
        {/* Speaking indicator */}
        {participant.isSpeaking && (
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        )}
      </div>
      
      {/* Actions menu (only for host) */}
      {canControlParticipant && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onPin}>
              <Volume2 className="w-4 h-4 mr-2" />
              {isPinned ? 'Unpin' : 'Pin to main view'}
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={onMute}>
              {participant.isAudioEnabled ? (
                <>
                  <VolumeX className="w-4 h-4 mr-2" />
                  Mute participant
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 mr-2" />
                  Unmute participant
                </>
              )}
            </DropdownMenuItem>
            
            {!participant.isHost && (
              <DropdownMenuItem onClick={onMakeHost}>
                <Crown className="w-4 h-4 mr-2" />
                Make host
              </DropdownMenuItem>
            )}
            
            <DropdownMenuItem onClick={onRemove} className="text-red-600">
              <UserX className="w-4 h-4 mr-2" />
              Remove from call
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};