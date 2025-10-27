import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserMinus, Crown, User } from 'lucide-react';
import { InstantSessionParticipant } from '@/hooks/video-conference/use-instant-session-participants';

interface ParticipantsListProps {
  participants: InstantSessionParticipant[];
  isTherapist: boolean;
  currentUserId?: string;
  onRemoveParticipant: (participantId: string) => Promise<void>;
  maxParticipants?: number;
}

const ParticipantsList: React.FC<ParticipantsListProps> = ({
  participants,
  isTherapist,
  currentUserId,
  onRemoveParticipant,
  maxParticipants = 10,
}) => {
  const activeParticipants = participants.filter(p => p.is_active);
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

  const getParticipantIcon = (participant: InstantSessionParticipant) => {
    if (participant.role === 'therapist' || participant.role === 'admin') {
      return <Crown className="h-4 w-4 text-yellow-500" />;
    }
    return <User className="h-4 w-4 text-blue-500" />;
  };

  const isCurrentUser = (participant: InstantSessionParticipant) => {
    return participant.user_id === currentUserId;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5" />
          Participants
          <Badge variant={isSessionFull ? "destructive" : "secondary"}>
            {activeParticipants.length}/{maxParticipants}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {activeParticipants.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No participants in session</p>
          </div>
        ) : (
          activeParticipants.map((participant) => (
            <div
              key={participant.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                isCurrentUser(participant) 
                  ? 'bg-primary/5 border-primary/20' 
                  : 'bg-muted/30 hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-3">
                {getParticipantIcon(participant)}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {participant.participant_name || 'Anonymous User'}
                    </span>
                    {isCurrentUser(participant) && (
                      <Badge variant="outline" className="text-xs">
                        You
                      </Badge>
                    )}
                    {participant.role === 'therapist' && (
                      <Badge variant="secondary" className="text-xs">
                        Therapist
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatJoinTime(participant.joined_at)}
                  </p>
                </div>
              </div>
              
              {isTherapist && !isCurrentUser(participant) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveParticipant(participant.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <UserMinus className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))
        )}
        
        {isSessionFull && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive font-medium">
              Session is at maximum capacity
            </p>
            <p className="text-xs text-destructive/80 mt-1">
              No new participants can join until someone leaves
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ParticipantsList;