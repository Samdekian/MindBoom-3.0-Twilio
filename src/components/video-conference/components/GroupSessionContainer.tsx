
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Video, VideoOff, Mic, MicOff, Loader2, Camera, CameraOff } from 'lucide-react';
import { useVideoSession } from '@/contexts/VideoSessionContext';
import { cn } from '@/lib/utils';
import { ConnectionStatus } from './ConnectionStatus';
import ConnectionStatusOverlay from './ConnectionStatusOverlay';
import { useEnhancedDeviceManager } from '@/hooks/video-conference/use-enhanced-device-manager';
import { SessionControls } from './SessionControls';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import ParticipantsList from './ParticipantsList';
import { useInstantSessionParticipants, type InstantSessionParticipant } from '@/hooks/video-conference/use-instant-session-participants';
import BreakoutRoomManager from '../breakout/BreakoutRoomManager';
import { useBreakoutAssignmentListener } from '@/hooks/video-conference/use-breakout-assignment-listener';

interface GroupSessionContainerProps {
  sessionId: string;
  sessionType: 'appointment' | 'instant';
  className?: string;
}

const GroupSessionContainer: React.FC<GroupSessionContainerProps> = ({
  sessionId,
  sessionType,
  className
}) => {
  const {
    videoState,
    isInSession,
    therapistInfo,
    patientInfo,
    isTherapist,
    joinSession,
    leaveSession,
    reconnectSession,
    toggleVideo,
    toggleAudio,
    toggleScreenShare,
    connectionState,
    sessionDuration,
    localVideoRef,
    remoteVideoRef,
    remoteStreams,
    sessionStatus,
    cameraStatus,
    participants,
    connectedPeers
  } = useVideoSession();

  // Enhanced device manager for better device detection and status
  const { deviceState } = useEnhancedDeviceManager();

  // Listen for breakout room assignments (for participants)
  useBreakoutAssignmentListener({
    enabled: !isTherapist && isInSession,
    onAssigned: (assignment) => {
      console.log('📢 [GroupSessionContainer] Received breakout assignment:', assignment);
    }
  });

  // Participants management
  const { 
    participants: sessionParticipantsRaw, 
    removeParticipant 
  } = useInstantSessionParticipants(sessionId);

  type DisplayParticipant = InstantSessionParticipant & { isPlaceholder?: boolean };

  const sessionParticipants = React.useMemo<InstantSessionParticipant[]>(
    () => Array.isArray(sessionParticipantsRaw) ? sessionParticipantsRaw : [],
    [sessionParticipantsRaw]
  );

  const placeholderParticipants = React.useMemo<DisplayParticipant[]>(() => {
    if (!connectedPeers || connectedPeers.length === 0) {
      return [];
    }

    const connectedIds = new Set(connectedPeers.filter(Boolean));
    const existingIds = new Set(sessionParticipants.map(p => p.user_id).filter(Boolean));
    const missingIds = Array.from(connectedIds).filter(id => !existingIds.has(id));

    return missingIds.map((peerId, index) => ({
      id: `peer-${peerId}-${index}`,
      session_id: sessionId,
      user_id: peerId,
      participant_name: `Participant ${sessionParticipants.length + index + 1}`,
      role: 'participant',
      joined_at: new Date().toISOString(),
      left_at: null,
      is_active: true,
      isPlaceholder: true
    }));
  }, [connectedPeers, sessionParticipants, sessionId]);

  const displayParticipants = React.useMemo<DisplayParticipant[]>(
    () => [...sessionParticipants, ...placeholderParticipants],
    [sessionParticipants, placeholderParticipants]
  );

  // Create refs for each remote video stream
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  // Update video elements when remote streams change
  useEffect(() => {
    remoteStreams.forEach((stream) => {
      const videoElement = remoteVideoRefs.current.get(stream.id);
      if (videoElement && videoElement.srcObject !== stream) {
        console.log('🎥 [GroupSessionContainer] Attaching stream', stream.id, 'to video element');
        videoElement.srcObject = stream;
      }
    });
  }, [remoteStreams]);

  // Create device status for overlay
  const getDeviceStatus = () => {
    if (deviceState.availability.loading) {
      return {
        camera: 'detecting' as const,
        microphone: 'detecting' as const,
        step: 'Detecting available devices...',
        progress: 25
      };
    }

    if (deviceState.permissions.camera === 'prompt' || deviceState.permissions.microphone === 'prompt') {
      return {
        camera: deviceState.permissions.camera === 'prompt' ? 'requesting' as const : 
                deviceState.permissions.camera === 'granted' ? 'granted' as const : 
                deviceState.permissions.camera === 'denied' ? 'denied' as const : 'unavailable' as const,
        microphone: deviceState.permissions.microphone === 'prompt' ? 'requesting' as const :
                   deviceState.permissions.microphone === 'granted' ? 'granted' as const :
                   deviceState.permissions.microphone === 'denied' ? 'denied' as const : 'unavailable' as const,
        step: 'Requesting device permissions...',
        progress: 50
      };
    }

    return {
      camera: deviceState.permissions.camera === 'granted' ? 'granted' as const :
             deviceState.permissions.camera === 'denied' ? 'denied' as const : 'unavailable' as const,
      microphone: deviceState.permissions.microphone === 'granted' ? 'granted' as const :
                 deviceState.permissions.microphone === 'denied' ? 'denied' as const : 'unavailable' as const,
      step: isJoining ? 'Establishing connection...' : undefined,
      progress: isJoining ? 75 : undefined
    };
  };

  // Debug logging on component mount (only log on initial mount and sessionId change)
  React.useEffect(() => {
    console.log('🔍 [GroupSessionContainer] Component mounted with:', {
      sessionId,
      sessionType,
      connectionState,
      cameraStatus,
      isInSession,
      isTherapist,
      participantCount: participants?.length || 0,
      joinSessionAvailable: typeof joinSession
    });
  }, [sessionId]); // Only re-run if sessionId changes to prevent excessive re-renders

  const [isJoining, setIsJoining] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Reset joining state when successfully in session
  useEffect(() => {
    if (isInSession && isJoining) {
      setIsJoining(false);
      setConnectionError(null);
    }
  }, [isInSession, isJoining]);

  // Handle connection errors
  useEffect(() => {
    if (connectionState === 'FAILED' && isJoining) {
      setIsJoining(false);
      setConnectionError('Failed to connect to the session. Please try again.');
    }
  }, [connectionState, isJoining]);

  const handleJoinSession = async () => {
    console.log('🎯 [GroupSessionContainer] Join button clicked', {
      isJoining,
      isInSession,
      sessionId,
      sessionType,
      connectionState,
      cameraStatus,
      joinSession: typeof joinSession
    });
    
    if (isJoining || isInSession) {
      console.log('⚠️ [GroupSessionContainer] Blocking join - already joining or in session');
      return;
    }
    
    if (!joinSession) {
      console.error('❌ [GroupSessionContainer] joinSession function not available');
      setConnectionError('Join function not available');
      return;
    }
    
    try {
      setIsJoining(true);
      setConnectionError(null);
      console.log('🚀 [GroupSessionContainer] Calling joinSession...');
      await joinSession();
      console.log('✅ [GroupSessionContainer] joinSession completed successfully');
    } catch (error) {
      console.error('❌ [GroupSessionContainer] joinSession failed:', error);
      setIsJoining(false);
      setConnectionError(error instanceof Error ? error.message : 'Failed to join session');
    }
  };

  const handleLeaveSession = async () => {
    try {
      await leaveSession();
      setIsJoining(false);
      setConnectionError(null);
    } catch (error) {
      console.error('Failed to leave session:', error);
    }
  };

  // Show session interface when connected
  if (isInSession) {
    const activeParticipantCount = displayParticipants.filter(p => p?.is_active).length;
    
    return (
      <div className={cn("h-full flex flex-col", className)}>
        {/* Session Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <ConnectionStatus 
              connectionState={connectionState}
              className="flex-shrink-0"
            />
            <span className="text-sm font-medium">
              Session Active {sessionDuration && `• ${sessionDuration}`}
            </span>
            {cameraStatus === 'permission-denied' && (
              <span className="text-xs text-destructive">Camera access denied</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Participants Drawer */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Participants</span>
                  <span className="inline sm:hidden">{activeParticipantCount}</span>
                  <span className="hidden sm:inline">({activeParticipantCount})</span>
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader className="mb-6">
                  <SheetTitle className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    Session Participants
                  </SheetTitle>
                  <SheetDescription>
                    View and manage participants in this session
                  </SheetDescription>
                </SheetHeader>
                
                {/* Breakout Room Manager - Therapist only */}
                {isTherapist && (
                  <div className="mb-6">
                    <BreakoutRoomManager
                      sessionId={sessionId}
                      isTherapist={isTherapist}
                    />
                  </div>
                )}
                
        {displayParticipants.length > 0 ? (
                  <ParticipantsList
            participants={displayParticipants}
                    isTherapist={isTherapist}
                    currentUserId={therapistInfo?.id || patientInfo?.id}
                    onRemoveParticipant={removeParticipant}
                    maxParticipants={10}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mb-4 opacity-30" />
                    <p className="text-sm">No participants data available</p>
                  </div>
                )}
              </SheetContent>
            </Sheet>

            <Button
              variant="destructive"
              size="sm"
              onClick={handleLeaveSession}
            >
              Leave Session
            </Button>
          </div>
        </div>


        {/* Video Grid Area */}
        <div className="flex-1 bg-slate-50 p-4 overflow-y-auto">
          <div className={cn(
            "h-full gap-4",
            remoteStreams.length === 0 ? "grid grid-cols-1 md:grid-cols-2" :
            remoteStreams.length === 1 ? "grid grid-cols-1 md:grid-cols-2" :
            remoteStreams.length === 2 ? "grid grid-cols-1 md:grid-cols-3" :
            "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          )}>
            {/* Local Video */}
            <Card className="relative overflow-hidden h-full min-h-[200px]">
              <CardContent className="p-0 h-full bg-slate-900 flex items-center justify-center">
                {videoState.isVideoEnabled ? (
                  <video 
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-white flex flex-col items-center gap-2">
                    <VideoOff className="h-8 w-8" />
                    <span className="text-sm">Video Off</span>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 text-xs text-white bg-black/70 px-2 py-1 rounded backdrop-blur-sm">
                  You {isTherapist ? '(Therapist)' : '(Patient)'}
                </div>
                <div className="absolute top-2 right-2 flex gap-1">
                  {!videoState.isVideoEnabled && <CameraOff className="h-4 w-4 text-red-400" />}
                  {!videoState.isAudioEnabled && <MicOff className="h-4 w-4 text-red-400" />}
                </div>
              </CardContent>
            </Card>

            {/* Remote Video Participants */}
            {remoteStreams.length > 0 ? (
              remoteStreams.map((stream, index) => {
                console.log('🎬 [GroupSessionContainer] Rendering remote stream:', {
                  streamId: stream.id,
                  streamIndex: index,
                  streamActive: stream.active
                });
                
                return (
                  <Card key={stream.id} className="relative overflow-hidden h-full min-h-[200px]">
                    <CardContent className="p-0 h-full bg-slate-800 flex items-center justify-center">
                      <video
                        ref={(el) => {
                          if (el) {
                            remoteVideoRefs.current.set(stream.id, el);
                            // Immediately attach the stream if it's not already attached
                            if (el.srcObject !== stream) {
                              el.srcObject = stream;
                            }
                          }
                        }}
                        autoPlay
                        playsInline
                        muted={false}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 text-xs text-white bg-black/70 px-2 py-1 rounded backdrop-blur-sm">
                        Participant {index + 1}
                      </div>
                      <div className="absolute top-2 right-2">
                        <div className={cn(
                          "h-2 w-2 rounded-full",
                          stream.active ? "bg-green-400" : "bg-red-400"
                        )} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card className="relative overflow-hidden h-full min-h-[200px]">
                <CardContent className="p-0 h-full bg-slate-800 flex items-center justify-center">
                  <div className="text-white flex flex-col items-center gap-2 p-4">
                    <Users className="h-8 w-8" />
                    <span className="text-sm font-medium">Waiting for participants...</span>
                    <div className="text-xs opacity-70 text-center">
                      {connectionState === 'CONNECTING' && 'Establishing connection...'}
                      {connectionState === 'CONNECTED' && remoteStreams.length === 0 && 'Connected - waiting for others to join'}
                      {connectionState === 'FAILED' && 'Connection failed - check your internet'}
                      {connectionState === 'DISCONNECTED' && 'Connection lost - attempting to reconnect'}
                      {connectionState === 'IDLE' && 'Ready to connect'}
                    </div>
                  </div>
                  {connectionState === 'FAILED' && (
                    <div className="absolute top-2 right-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={reconnectSession}
                        className="text-xs text-white border-white/20 hover:bg-white/10"
                      >
                        Retry
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Enhanced Controls */}
        <div className="p-4 border-t border-border">
          <SessionControls
            isVideoEnabled={videoState.isVideoEnabled}
            isAudioEnabled={videoState.isAudioEnabled}
            isScreenSharing={videoState.isScreenSharing}
            onToggleVideo={toggleVideo}
            onToggleAudio={toggleAudio}
            onToggleScreenShare={toggleScreenShare}
            onReconnect={reconnectSession}
            connectionState={connectionState}
            disabled={connectionState === 'CONNECTING'}
            sessionId={sessionId}
            isTherapist={isTherapist}
          />
        </div>
      </div>
    );
  }

  // Show join interface when not connected
  return (
    <div className={cn("h-full flex items-center justify-center p-4", className)}>
      <Card className="max-w-md w-full">
        <CardContent className="p-6 text-center space-y-6">
          {connectionError && (
            <Alert variant="destructive">
              <AlertDescription>{connectionError}</AlertDescription>
            </Alert>
          )}
          
          {cameraStatus === 'permission-denied' && (
            <Alert variant="destructive">
              <AlertDescription>
                Camera access denied. Please enable camera permissions in your browser settings and refresh the page.
              </AlertDescription>
            </Alert>
          )}

          {connectionState === 'FAILED' && (
            <Alert variant="destructive">
              <AlertDescription>
                Connection failed. Please check your internet connection and try again.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Video className="h-10 w-10 text-primary" />
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-semibold mb-2">
              {isJoining ? "Connecting..." : "Ready to join your session?"}
            </h3>
            <p className="text-muted-foreground">
              {isJoining 
                ? connectionState === 'CONNECTING' 
                  ? "Establishing WebRTC connection..."
                  : "Please wait while we connect you to the session..."
                : isTherapist 
                  ? "Start your session when you're ready to begin."
                  : "Join the session when the therapist is ready."
              }
            </p>
            {connectionState !== 'IDLE' && (
              <ConnectionStatus 
                connectionState={connectionState} 
                className="justify-center" 
              />
            )}
          </div>
          
          <Button 
            onClick={handleJoinSession} 
            size="lg" 
            disabled={
              isJoining || 
              cameraStatus === 'permission-denied' || 
              connectionState === 'FAILED'
            }
            className="px-6"
          >
            {isJoining ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {connectionState === 'CONNECTING' ? 'Connecting...' : 'Starting...'}
              </>
            ) : connectionState === 'FAILED' ? (
              <>Retry Connection</>
            ) : (
              <>Join Session</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Connection Status Overlay */}
      <ConnectionStatusOverlay
        connectionState={connectionState}
        isInSession={isInSession || isJoining}
        onRetry={handleJoinSession}
        deviceStatus={getDeviceStatus()}
      />
    </div>
  );
};

export default GroupSessionContainer;
