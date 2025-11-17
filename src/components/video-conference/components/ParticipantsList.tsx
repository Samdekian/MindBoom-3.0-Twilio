import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Users, UserMinus, Crown, User, Video, VideoOff, Mic, MicOff, Wifi, WifiOff, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { InstantSessionParticipant } from '@/hooks/video-conference/use-instant-session-participants';
import { cn } from '@/lib/utils';

type DisplayParticipant = InstantSessionParticipant & { isPlaceholder?: boolean };

interface ParticipantsListProps {
  participants: DisplayParticipant[];
  isTherapist: boolean;
  currentUserId?: string;
  onRemoveParticipant: (participantId: string) => Promise<void>;
  maxParticipants?: number;
}

const ParticipantsList: React.FC<ParticipantsListProps> = ({
  participants = [],
  isTherapist,
  currentUserId,
  onRemoveParticipant,
  maxParticipants = 10,
}) => {
  const [participantToRemove, setParticipantToRemove] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  // Safety check: ensure participants is an array
  const safeParticipants: DisplayParticipant[] = Array.isArray(participants) ? participants : [];
  const activeParticipants = safeParticipants.filter(p => p?.is_active);
  const isSessionFull = activeParticipants.length >= maxParticipants;

  const formatJoinTime = (joinedAt: string) => {
    const joinTime = new Date(joinedAt);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - joinTime.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just joined';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours}h ${diffMinutes % 60}m ago`;
  };

  const getParticipantIcon = (participant: DisplayParticipant) => {
    if (participant.role === 'therapist' || participant.role === 'admin') {
      return <Crown className="h-5 w-5 text-yellow-500" />;
    }
    return <User className="h-5 w-5 text-blue-500" />;
  };

  const isCurrentUser = (participant: DisplayParticipant) => {
    return participant.user_id === currentUserId;
  };

  const handleRemoveClick = (participantId: string, isPlaceholder?: boolean) => {
    if (isPlaceholder) return;
    setParticipantToRemove(participantId);
  };

  const confirmRemove = async () => {
    if (!participantToRemove) return;
    
    setIsRemoving(true);
    try {
      await onRemoveParticipant(participantToRemove);
    } catch (error) {
      console.error('Failed to remove participant:', error);
    } finally {
      setIsRemoving(false);
      setParticipantToRemove(null);
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Header Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg">{activeParticipants.length}</span>
                <span className="text-muted-foreground text-sm">
                  {activeParticipants.length === 1 ? 'participant' : 'participants'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {isSessionFull ? 'Session full' : `${maxParticipants - activeParticipants.length} spots available`}
              </p>
            </div>
          </div>
          <Badge 
            variant={isSessionFull ? "destructive" : "secondary"}
            className="h-6"
          >
            {activeParticipants.length}/{maxParticipants}
          </Badge>
        </div>

        <Separator />

        {/* Participants List */}
        <div className="space-y-2">
          {activeParticipants.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No participants yet</p>
              <p className="text-xs mt-1">Waiting for participants to join...</p>
            </div>
          ) : (
            activeParticipants.map((participant, index) => (
              <Card
                key={participant.id}
                className={cn(
                  "transition-all duration-200 hover:shadow-md",
                  isCurrentUser(participant) && "ring-2 ring-primary/20 bg-primary/5"
                )}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Avatar */}
                      <div className="relative">
                        <div className={cn(
                          "h-12 w-12 rounded-full flex items-center justify-center",
                          isCurrentUser(participant) 
                            ? "bg-gradient-to-br from-primary to-primary/80" 
                            : "bg-gradient-to-br from-slate-200 to-slate-300"
                        )}>
                          {getParticipantIcon(participant)}
                        </div>
                        {/* Online indicator */}
                        <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-green-500 border-2 border-white" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm truncate">
                            {participant.participant_name || 'Anonymous User'}
                          </span>
                          {isCurrentUser(participant) && (
                            <Badge variant="outline" className="text-xs px-1.5 py-0">
                              You
                            </Badge>
                          )}
                            {participant.isPlaceholder && (
                              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                                Connecting...
                              </Badge>
                            )}
                          {(participant.role === 'therapist' || participant.role === 'admin') && (
                            <Badge className="text-xs px-1.5 py-0 bg-gradient-to-r from-yellow-500 to-yellow-600">
                              {participant.role === 'therapist' ? 'Therapist' : 'Admin'}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span>
                              {participant.isPlaceholder ? 'Connecting…' : formatJoinTime(participant.joined_at)}
                            </span>
                        </div>

                        {/* Media Status Icons */}
                        <div className="flex items-center gap-2 mt-2">
                          <div className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded-md text-xs",
                            "bg-slate-100 text-slate-600"
                          )}>
                            <Video className="h-3 w-3" />
                              <span>{participant.isPlaceholder ? 'Pending' : 'On'}</span>
                          </div>
                          <div className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded-md text-xs",
                            "bg-slate-100 text-slate-600"
                          )}>
                            <Mic className="h-3 w-3" />
                              <span>{participant.isPlaceholder ? 'Pending' : 'On'}</span>
                          </div>
                          <div className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded-md text-xs",
                            "bg-green-100 text-green-600"
                          )}>
                            <Wifi className="h-3 w-3" />
                              <span>{participant.isPlaceholder ? 'Syncing' : 'Good'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                      {isTherapist && !isCurrentUser(participant) && !participant.isPlaceholder && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                              onClick={() => handleRemoveClick(participant.id, participant.isPlaceholder)}
                            className="text-destructive focus:text-destructive"
                          >
                            <UserMinus className="h-4 w-4 mr-2" />
                            Remove from session
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Session Full Warning */}
        {isSessionFull && (
          <Card className="border-destructive/50 bg-destructive/5">
            <div className="p-4">
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <Users className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm font-medium text-destructive">
                    Session at Maximum Capacity
                  </p>
                  <p className="text-xs text-destructive/80 mt-1">
                    No new participants can join until someone leaves the session.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Remove Participant Confirmation Dialog */}
      <AlertDialog open={!!participantToRemove} onOpenChange={() => setParticipantToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Participant?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the participant from the session. They will need a new invitation to rejoin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemove}
              disabled={isRemoving}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isRemoving ? 'Removing...' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ParticipantsList;