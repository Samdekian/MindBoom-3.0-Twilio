import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff,
  Crown,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Participant {
  id: string;
  name: string;
  role: 'therapist' | 'patient' | 'participant';
  isActive: boolean;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  joinedAt: Date;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
}

interface ParticipantManagementProps {
  participants: Participant[];
  currentUserId: string;
  isTherapist: boolean;
  onAdmitParticipant: (participantId: string) => void;
  onRemoveParticipant: (participantId: string) => void;
  onMuteParticipant: (participantId: string) => void;
  waitingRoomParticipants: Participant[];
}

const ParticipantManagement: React.FC<ParticipantManagementProps> = ({
  participants,
  currentUserId,
  isTherapist,
  onAdmitParticipant,
  onRemoveParticipant,
  onMuteParticipant,
  waitingRoomParticipants
}) => {
  const getConnectionColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-yellow-500';
      case 'poor': return 'text-orange-500';
      case 'disconnected': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const formatDuration = (joinedAt: Date) => {
    const duration = Math.floor((Date.now() - joinedAt.getTime()) / 1000 / 60);
    return `${duration}m`;
  };

  return (
    <div className="space-y-4">
      {/* Active Participants */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4" />
            Active Participants ({participants.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {participants.map((participant) => (
            <div key={participant.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    getConnectionColor(participant.connectionQuality)
                  )} />
                  {participant.role === 'therapist' && (
                    <Crown className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500" />
                  )}
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {participant.id === currentUserId ? 'You' : participant.name}
                    </span>
                    <Badge variant={participant.role === 'therapist' ? 'default' : 'secondary'} className="text-xs">
                      {participant.role}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Connected for {formatDuration(participant.joinedAt)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {participant.isVideoEnabled ? (
                    <Video className="h-3 w-3 text-green-500" />
                  ) : (
                    <VideoOff className="h-3 w-3 text-red-500" />
                  )}
                  {participant.isAudioEnabled ? (
                    <Mic className="h-3 w-3 text-green-500" />
                  ) : (
                    <MicOff className="h-3 w-3 text-red-500" />
                  )}
                </div>
                
                {isTherapist && participant.id !== currentUserId && (
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onMuteParticipant(participant.id)}
                      className="h-6 w-6 p-0"
                    >
                      <MicOff className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => onRemoveParticipant(participant.id)}
                      className="h-6 w-6 p-0"
                    >
                      <UserX className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Waiting Room */}
      {waitingRoomParticipants.length > 0 && isTherapist && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4" />
              Waiting Room ({waitingRoomParticipants.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {waitingRoomParticipants.map((participant) => (
              <div key={participant.id} className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <div>
                    <span className="text-sm font-medium">{participant.name}</span>
                    <div className="text-xs text-muted-foreground">
                      Waiting to join
                    </div>
                  </div>
                </div>
                
                <Button 
                  size="sm"
                  onClick={() => onAdmitParticipant(participant.id)}
                  className="gap-1"
                >
                  <UserCheck className="h-3 w-3" />
                  Admit
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ParticipantManagement;