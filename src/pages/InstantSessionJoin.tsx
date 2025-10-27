import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Clock, Video, User, Calendar } from "lucide-react";
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useInstantSessionByToken } from '@/hooks/use-instant-session-by-token';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const InstantSessionJoin = () => {
  const { user, isInitialized, isAuthenticated } = useAuthRBAC();
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { sessionDetails, isLoading, error } = useInstantSessionByToken(token || '');
  const [isJoining, setIsJoining] = useState(false);

  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex items-center justify-center p-6">
            Loading session details...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 space-y-4">
            <Alert variant="destructive">
              <AlertDescription>You must be signed in to join this session.</AlertDescription>
            </Alert>
            <Button onClick={() => navigate('/login')}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!sessionDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6">
            <Alert variant="destructive">
              <AlertDescription>Session details not found.</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Helmet>
        <title>Join Session | Therapy Platform</title>
      </Helmet>
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              {sessionDetails.session_name}
            </CardTitle>
            <CardDescription>
              Join the session as {user?.user_metadata?.fullName || user?.user_metadata?.name || user?.user_metadata?.email || user?.email || 'User'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <span>Max Participants: {sessionDetails.max_participants}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span>Date: {format(new Date(), 'MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span>Expires: {format(new Date(sessionDetails.expires_at), 'h:mm a')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5 text-muted-foreground" />
              <span>Recording: {sessionDetails.recording_enabled ? 'Enabled' : 'Disabled'}</span>
            </div>
            <Badge variant="secondary">
              <Video className="h-4 w-4 mr-1" />
              Instant Session
            </Badge>
            <Button 
              onClick={async () => {
                console.log('🎯 [InstantSessionJoin] Join Video Session clicked', {
                  sessionDetails: sessionDetails?.id,
                  user: user?.id,
                  userName: user?.user_metadata?.name
                });
                
                setIsJoining(true);
                try {
                  // Create participant record when joining
                  console.log('📝 [InstantSessionJoin] Creating participant record...');
                  const { error: participantError } = await supabase
                    .from('instant_session_participants')
                    .upsert({
                      session_id: sessionDetails.id,
                      user_id: user?.id || null,
                      participant_name: user?.user_metadata?.fullName || user?.user_metadata?.name || user?.user_metadata?.email || user?.email || `User ${Date.now()}`,
                      role: 'participant',
                      is_active: true,
                      joined_at: new Date().toISOString()
                    }, {
                      onConflict: 'session_id,user_id'
                    });

                  if (participantError) {
                    console.error('❌ [InstantSessionJoin] Error creating participant record:', participantError);
                    toast({
                      title: 'Error',
                      description: 'Failed to join session',
                      variant: 'destructive'
                    });
                    return;
                  }

                  console.log('✅ [InstantSessionJoin] Participant record created successfully');
                  console.log('🚀 [InstantSessionJoin] Navigating to video conference:', `/video-conference/${sessionDetails.id}`);
                  
                  // Navigate to video conference
                  navigate(`/video-conference/${sessionDetails.id}`);
                } catch (error) {
                  console.error('Error joining session:', error);
                  toast({
                    title: 'Error',
                    description: 'Failed to join session',
                    variant: 'destructive'
                  });
                } finally {
                  setIsJoining(false);
                }
              }}
              disabled={isJoining}
            >
              {isJoining ? 'Joining...' : 'Join Video Session'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InstantSessionJoin;
