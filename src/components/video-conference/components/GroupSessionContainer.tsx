
import React, { useState, useEffect } from 'react';
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
import BreakoutRoomManager from '../breakout/BreakoutRoomManager';

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
    participants
  } = useVideoSession();

  // Enhanced device manager for better device detection and status
  const { deviceState } = useEnhancedDeviceManager();

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

  // Debug logging on component mount
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
  }, [sessionId, sessionType, connectionState, cameraStatus, isInSession, isTherapist, participants, joinSession]);

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
          <Button
            variant="destructive"
            size="sm"
            onClick={handleLeaveSession}
          >
            Leave Session
          </Button>
        </div>

        {/* Breakout Rooms Panel - Only for therapists */}
        {isTherapist && (
          <div className="px-4 py-3 border-b border-border bg-slate-50">
            <BreakoutRoomManager 
              sessionId={sessionId} 
              isTherapist={isTherapist} 
            />
          </div>
        )}

        {/* Video Grid Area */}
        <div className="flex-1 bg-slate-50 p-4">
          <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Local Video */}
            <Card className="relative overflow-hidden">
              <CardContent className="p-0 h-full min-h-[200px] bg-slate-900 flex items-center justify-center">
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
                    <span>Video Off</span>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
                  You {isTherapist ? '(Therapist)' : '(Patient)'}
                </div>
                <div className="absolute top-2 right-2 flex gap-1">
                  {!videoState.isVideoEnabled && <CameraOff className="h-4 w-4 text-red-400" />}
                  {!videoState.isAudioEnabled && <MicOff className="h-4 w-4 text-red-400" />}
                </div>
              </CardContent>
            </Card>

            {/* Remote Video / Participants */}
            <Card className="relative overflow-hidden">
              <CardContent className="p-0 h-full min-h-[200px] bg-slate-800 flex items-center justify-center">
                {(() => {
                  console.log('🎬 [GroupSessionContainer] Rendering remote video area:', {
                    remoteStreamsLength: remoteStreams.length,
                    remoteStreamIds: remoteStreams.map(s => s.id),
                    hasRemoteVideoRef: !!remoteVideoRef.current,
                    remoteVideoRefSrcObject: remoteVideoRef.current?.srcObject ? 'SET' : 'NOT SET'
                  });
                  return remoteStreams.length > 0 ? (
                    <video 
                      ref={remoteVideoRef}
                      autoPlay
                      playsInline
                      muted={false}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-white flex flex-col items-center gap-2">
                      <Users className="h-8 w-8" />
                      <span>Waiting for other participants...</span>
                      <div className="text-xs opacity-70 text-center">
                        {connectionState === 'CONNECTING' && 'Establishing connection...'}
                        {connectionState === 'CONNECTED' && remoteStreams.length === 0 && 'Connected - waiting for remote video'}
                        {connectionState === 'FAILED' && 'Connection failed - check your internet'}
                        {connectionState === 'DISCONNECTED' && 'Connection lost - attempting to reconnect'}
                        {connectionState === 'IDLE' && 'Ready to connect'}
                      </div>
                      {connectionState === 'CONNECTED' && (
                        <div className="text-xs opacity-50 mt-2">
                          Remote streams: {remoteStreams.length}
                        </div>
                      )}
                    </div>
                  );
                })()}
                <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
                  Remote Participant {remoteStreams.length > 0 ? '(Active)' : '(Waiting)'}
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
