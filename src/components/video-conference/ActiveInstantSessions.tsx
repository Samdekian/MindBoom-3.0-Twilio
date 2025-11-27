import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Video, Users, Clock, Phone, AlertCircle, Trash2, Share2, Copy, QrCode } from 'lucide-react';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface InstantSession {
  id: string;
  session_name: string;
  therapist_id: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
  session_token: string;
  max_participants: number;
  participant_count?: number;
  therapist_name?: string;
}

const ActiveInstantSessions: React.FC = () => {
  const { user } = useAuthRBAC();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<InstantSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveSessions = async () => {
    try {
      setLoading(true);
      
      // Clean up expired sessions first
      await supabase.rpc('cleanup_expired_instant_sessions');
      
      // Fetch active instant sessions with participant counts
      const { data: sessionData, error: sessionError } = await supabase
        .from('instant_sessions')
        .select(`
          id,
          session_name,
          therapist_id,
          created_at,
          expires_at,
          is_active,
          session_token,
          max_participants
        `)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (sessionError) {
        console.error('Error fetching sessions:', sessionError);
        toast({
          title: "Error",
          description: "Failed to fetch active sessions",
          variant: "destructive"
        });
        return;
      }

      if (!sessionData || sessionData.length === 0) {
        setSessions([]);
        return;
      }

      // Get participant counts and therapist names for each session
      const enrichedSessions = await Promise.all(
        sessionData.map(async (session) => {
          // Get participant count
          const { count: participantCount } = await supabase
            .from('instant_session_participants')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', session.id)
            .eq('is_active', true);

          // Get therapist name
          const { data: therapistData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', session.therapist_id)
            .single();

          return {
            ...session,
            participant_count: participantCount || 0,
            therapist_name: therapistData?.full_name || 'Unknown Therapist'
          };
        })
      );

      setSessions(enrichedSessions);
    } catch (error) {
      console.error('Error in fetchActiveSessions:', error);
      toast({
        title: "Error",
        description: "Failed to load sessions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveSessions();

    // Set up real-time subscription for session updates
    const channel = supabase
      .channel('instant-sessions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'instant_sessions'
        },
        () => {
          fetchActiveSessions();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'instant_session_participants'
        },
        () => {
          fetchActiveSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleJoinSession = (sessionToken: string) => {
    console.log('Join button clicked for session token:', sessionToken);
    console.log('Navigating to:', `/session/instant/${sessionToken}`);
    // Navigate to session with token using React Router
    navigate(`/session/instant/${sessionToken}`);
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('instant_sessions')
        .update({ is_active: false })
        .eq('id', sessionId);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to end session",
          variant: "destructive"
        });
        return;
      }

      // Also mark all participants as inactive
      await supabase
        .from('instant_session_participants')
        .update({ 
          is_active: false,
          left_at: new Date().toISOString()
        })
        .eq('session_id', sessionId);

      toast({
        title: "Success",
        description: "Session ended successfully"
      });
    } catch (error) {
      console.error('Error ending session:', error);
      toast({
        title: "Error",
        description: "Failed to end session",
        variant: "destructive"
      });
    }
  };

  const handleCopyLink = (sessionToken: string) => {
    // Find session ID to generate proper link
    const session = sessions.find(s => s.session_token === sessionToken);
    const link = session 
      ? `${window.location.origin}/video-conference/${session.id}?join=true`
      : `${window.location.origin}/session/instant/${sessionToken}`;
    
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied",
      description: "Session link copied to clipboard"
    });
  };

  const generateShareableLink = (sessionToken: string) => {
    // Find session ID to generate proper link
    const session = sessions.find(s => s.session_token === sessionToken);
    return session 
      ? `${window.location.origin}/video-conference/${session.id}?join=true`
      : `${window.location.origin}/session/instant/${sessionToken}`;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Instant Sessions</CardTitle>
          <CardDescription>
            Join ongoing therapy sessions for immediate support.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center text-muted-foreground">
              Loading active sessions...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Instant Sessions</CardTitle>
        <CardDescription>
          Join ongoing therapy sessions for immediate support.
          <span className="block text-sm text-orange-600 mt-1 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            This displays real session data from the database
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">No active sessions at the moment</p>
            <p className="text-sm">Check back later or create a new instant session!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div 
                key={session.id} 
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage 
                      src={`https://avatar.vercel.sh/${session.session_name}.png`} 
                      alt={session.session_name} 
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {session.session_name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{session.session_name}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{session.participant_count || 0}/{session.max_participants} participants</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Started {formatTime(session.created_at)}</span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Hosted by {session.therapist_name}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={session.is_active ? "default" : "secondary"}
                    className="capitalize"
                  >
                    {session.is_active ? "Live" : "Inactive"}
                  </Badge>
                  
                  {/* Share Link Button */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Share Session Link</DialogTitle>
                        <DialogDescription>
                          Share this link with participants to join the session
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={generateShareableLink(session.session_token)}
                            readOnly
                            className="flex-1 px-3 py-2 border rounded-md bg-muted"
                          />
                          <Button 
                            size="sm" 
                            onClick={() => handleCopyLink(session.session_token)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                   {/* Join/Full Button */}
                   <Button 
                     variant="outline" 
                     size="sm"
                     onClick={() => handleJoinSession(session.session_token)}
                     disabled={!session.is_active || (session.participant_count || 0) >= session.max_participants}
                   >
                     <Video className="h-4 w-4 mr-2" />
                     {(session.participant_count || 0) >= session.max_participants 
                       ? `Full (${session.participant_count}/${session.max_participants})`
                       : `Join (${session.participant_count || 0}/${session.max_participants})`
                     }
                   </Button>

                  {/* End Session Button for Therapists */}
                  {user?.id === session.therapist_id && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteSession(session.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      End
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActiveInstantSessions;
