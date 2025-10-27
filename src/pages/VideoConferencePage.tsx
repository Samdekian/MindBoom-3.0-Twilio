
import React from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useInstantSession } from '@/hooks/use-instant-session';
import { VideoSessionProvider, useVideoSession } from '@/contexts/VideoSessionContext';
import SessionConference from '@/components/video-conference/SessionConference';

const VideoConferencePageContent: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const urlParams = new URLSearchParams(window.location.search);
  const shouldAutoJoin = urlParams.get('join') === 'true';
  const isGuestJoin = urlParams.has('join'); // Anyone accessing with join param
  const { user } = useAuthRBAC();
  const { sessionDetails, isLoading, error } = useInstantSession(sessionId || '');
  
  // Get config for any future diagnostics (simplified for now)

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6">
            <Alert variant="destructive">
              <AlertDescription>No session ID provided.</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-center">
              Loading session details...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 space-y-4">
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
          <CardContent className="p-6 space-y-4">
            <Alert variant="destructive">
              <AlertDescription>Session not found or has expired.</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{sessionDetails.session_name} | Video Conference</title>
      </Helmet>
      
      <SessionConference 
        sessionId={sessionId}
        sessionType="instant"
        autoJoin={shouldAutoJoin || isGuestJoin}
      />
    </>
  );
};

const VideoConferencePage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  
  return (
    <VideoSessionProvider sessionId={sessionId} sessionType="instant">
      <VideoConferencePageContent />
    </VideoSessionProvider>
  );
};

export default VideoConferencePage;
