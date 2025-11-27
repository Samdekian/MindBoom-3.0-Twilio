import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useInstantSession } from '@/contexts/InstantSessionContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  Users, 
  Clock,
  AlertCircle 
} from 'lucide-react';

const InstantSessionVideo: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const {
    state,
    localVideoRef,
    remoteVideoRef,
    sessionDetails,
    isTherapist,
    participants,
    participantCount,
    joinSession,
    leaveSession,
    toggleVideo,
    toggleAudio,
    getMediaAccess
  } = useInstantSession();
  
  const [sessionTimer, setSessionTimer] = useState(0);
  const [autoJoinAttempted, setAutoJoinAttempted] = useState(false);
  
  // Auto-join session when component loads
  useEffect(() => {
    const attemptAutoJoin = async () => {
      if (!state.isInSession && !autoJoinAttempted && sessionDetails?.session_token) {
        console.log('🚀 Auto-joining instant session...');
        setAutoJoinAttempted(true);
        try {
          await joinSession(sessionDetails.session_token);
        } catch (error) {
          console.error('Auto-join failed:', error);
        }
      }
    };
    
    attemptAutoJoin();
  }, [state.isInSession, autoJoinAttempted, sessionDetails, joinSession]);
  
  // Timer for session duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.isInSession) {
      interval = setInterval(() => {
        setSessionTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state.isInSession]);
  
  // Format session duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Loading state
  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex items-center justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
            Joining session...
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Error state
  if (state.error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
            <div className="mt-4 space-y-2">
              <Button 
                onClick={() => getMediaAccess()} 
                className="w-full"
                variant="outline"
              >
                Try Camera Access Again
              </Button>
              {sessionDetails?.session_token && (
                <Button 
                  onClick={() => joinSession(sessionDetails.session_token)}
                  className="w-full"
                >
                  Retry Join
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {sessionDetails?.session_name || 'Instant Session'}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="secondary" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(sessionTimer)}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Users className="h-3 w-3" />
                  {participantCount} participants
                </Badge>
                {state.isInSession && (
                  <Badge variant="default">In Session</Badge>
                )}
              </div>
            </div>
            
            {/* Leave button */}
            <Button 
              onClick={leaveSession}
              variant="destructive" 
              size="sm"
              className="gap-2"
            >
              <Phone className="h-4 w-4" />
              Leave
            </Button>
          </div>
        </div>
        
        {/* Video Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          {/* Main Video Area */}
          <div className="lg:col-span-3">
            <Card className="h-[500px] overflow-hidden">
              <CardContent className="p-0 h-full relative">
                {/* Remote Video */}
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                
                {/* Local Video (Picture-in-Picture) */}
                <div className="absolute top-4 right-4 w-48 h-36 rounded-lg overflow-hidden shadow-lg">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Local video overlay */}
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="secondary" className="text-xs">
                      You {isTherapist ? '(Therapist)' : '(Participant)'}
                    </Badge>
                  </div>
                </div>
                
                {/* No video message */}
                {!state.localStream && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
                    <div className="text-center text-white">
                      <VideoOff className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Camera not accessible</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mt-4">
              <Button
                onClick={toggleVideo}
                variant={state.isVideoEnabled ? "default" : "destructive"}
                size="lg"
                className="rounded-full w-12 h-12 p-0"
              >
                {state.isVideoEnabled ? (
                  <Video className="h-5 w-5" />
                ) : (
                  <VideoOff className="h-5 w-5" />
                )}
              </Button>
              
              <Button
                onClick={toggleAudio}
                variant={state.isAudioEnabled ? "default" : "destructive"}
                size="lg"
                className="rounded-full w-12 h-12 p-0"
              >
                {state.isAudioEnabled ? (
                  <Mic className="h-5 w-5" />
                ) : (
                  <MicOff className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
          
          {/* Participants Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Participants ({participantCount})
                </h3>
                
                <div className="space-y-3">
                  {participants.map((participant) => (
                    <div 
                      key={participant.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {participant.participant_name}
                        </p>
                        <p className="text-xs text-slate-500 capitalize">
                          {participant.role}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {participant.is_active && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Connection Status */}
                <div className="mt-4 p-2 rounded-lg bg-slate-100">
                  <p className="text-xs text-slate-600">
                    Connection: <span className="capitalize">{state.connectionState}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Debug Info - only show in development */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="bg-slate-900 text-white">
            <CardContent className="p-4">
              <h4 className="font-mono text-sm mb-2">Debug Info:</h4>
              <div className="text-xs font-mono space-y-1">
                <p>Session ID: {sessionId}</p>
                <p>Local Stream: {state.localStream ? 'Active' : 'None'}</p>
                <p>Video Tracks: {state.localStream?.getVideoTracks().length || 0}</p>
                <p>Audio Tracks: {state.localStream?.getAudioTracks().length || 0}</p>
                <p>WebRTC State: {state.connectionState}</p>
                <p>Participants: {participants.length}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InstantSessionVideo;