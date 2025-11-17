
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  UserMinus, 
  Crown, 
  User, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff,
  Volume2,
  VolumeX,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedParticipant {
  id: string;
  user_id?: string;
  participant_name: string;
  role: 'host' | 'participant';
  is_active: boolean;
  joined_at: string;
  left_at?: string;
  video_enabled: boolean;
  audio_enabled: boolean;
  connection_quality: 'excellent' | 'good' | 'poor' | 'disconnected';
  is_speaking?: boolean;
}

interface EnhancedParticipantsListProps {
  sessionId: string;
  currentUserId?: string;
  isHost: boolean;
  onRemoveParticipant: (participantId: string) => Promise<void>;
  onMuteParticipant?: (participantId: string) => Promise<void>;
  onMuteAll?: () => Promise<void>;
  maxParticipants?: number;
  className?: string;
}

const EnhancedParticipantsList: React.FC<EnhancedParticipantsListProps> = ({
  sessionId,
  currentUserId,
  isHost,
  onRemoveParticipant,
  onMuteParticipant,
  onMuteAll,
  maxParticipants = 15,
  className
}) => {
  const [participants, setParticipants] = useState<EnhancedParticipant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParticipants();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('participants-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'instant_session_participants',
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          fetchParticipants();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const fetchParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from('instant_session_participants')
        .select('*')
        .eq('session_id', sessionId)
        .order('joined_at', { ascending: true });

      if (error) throw error;

      // Transform data to match our interface
      const transformedParticipants: EnhancedParticipant[] = (data || []).map(p => ({
        id: p.id,
        user_id: p.user_id,
        participant_name: p.participant_name || 'Anonymous',
        role: p.role || 'participant',
        is_active: p.is_active,
        joined_at: p.joined_at,
        left_at: p.left_at,
        video_enabled: true, // Default values - would be updated by stream management
        audio_enabled: true,
        connection_quality: 'good' as const,
        is_speaking: false
      }));

      setParticipants(transformedParticipants);
    } catch (error) {
      console.error('Error fetching participants:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeParticipants = Array.isArray(participants) ? participants.filter(p => p?.is_active) : [];
  const isSessionFull = activeParticipants.length >= maxParticipants;

  const formatDuration = (joinedAt: string) => {
    const joinTime = new Date(joinedAt);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - joinTime.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just joined';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours}h ${diffMinutes % 60}m ago`;
  };

  const getParticipantIcon = (participant: EnhancedParticipant) => {
    if (participant.role === 'host') {
      return <Crown className="h-4 w-4 text-yellow-500" />;
    }
    return <User className="h-4 w-4 text-blue-500" />;
  };

  const getConnectionColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'poor': return 'text-yellow-500';
      case 'disconnected': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const isCurrentUser = (participant: EnhancedParticipant) => {
    return participant.user_id === currentUserId;
  };

  if (loading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            Participants
            <Badge variant={isSessionFull ? "destructive" : "secondary"}>
              {activeParticipants.length}/{maxParticipants}
            </Badge>
          </CardTitle>
          
          {isHost && activeParticipants.length > 1 && onMuteAll && (
            <Button
              variant="outline"
              size="sm"
              onClick={onMuteAll}
              className="text-xs"
            >
              <VolumeX className="h-3 w-3 mr-1" />
              Mute All
            </Button>
          )}
        </div>
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
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border transition-colors",
                isCurrentUser(participant) 
                  ? 'bg-primary/5 border-primary/20' 
                  : 'bg-muted/30 hover:bg-muted/50'
              )}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    getConnectionColor(participant.connection_quality)
                  )} />
                  {getParticipantIcon(participant)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {participant.participant_name}
                    </span>
                    {isCurrentUser(participant) && (
                      <Badge variant="outline" className="text-xs">
                        You
                      </Badge>
                    )}
                    {participant.role === 'host' && (
                      <Badge variant="secondary" className="text-xs">
                        Host
                      </Badge>
                    )}
                    {participant.is_speaking && (
                      <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-700">
                        Speaking
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDuration(participant.joined_at)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Media Status */}
                <div className="flex items-center gap-1">
                  {participant.video_enabled ? (
                    <Video className="h-3 w-3 text-green-500" />
                  ) : (
                    <VideoOff className="h-3 w-3 text-red-500" />
                  )}
                  {participant.audio_enabled ? (
                    <Mic className="h-3 w-3 text-green-500" />
                  ) : (
                    <MicOff className="h-3 w-3 text-red-500" />
                  )}
                </div>
                
                {/* Host Controls */}
                {isHost && !isCurrentUser(participant) && (
                  <div className="flex gap-1">
                    {onMuteParticipant && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMuteParticipant(participant.id)}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <MicOff className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveParticipant(participant.id)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <UserMinus className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        
        {isSessionFull && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <div>
                <p className="text-sm text-destructive font-medium">
                  Session is at maximum capacity
                </p>
                <p className="text-xs text-destructive/80 mt-1">
                  No new participants can join until someone leaves
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedParticipantsList;
