/**
 * GroupSessionContainer - Unified Twilio Video component
 * Uses Twilio Video for all sessions (main + breakout)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Video, Loader2, ArrowLeft } from 'lucide-react';
import { useVideoSession } from '@/contexts/TwilioVideoSessionContext';
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
import { useTherapistRoomSwitching } from '@/hooks/video-conference/use-therapist-room-switching';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import TwilioVideoGrid from '../breakout/TwilioVideoGrid';
import { getRoomManager } from '@/lib/twilio/room-manager';
import type { Room } from 'twilio-video';

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
    room,
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
    cameraStatus,
    twilioParticipants
  } = useVideoSession();

  // Enhanced device manager for better device detection and status
  const { deviceState } = useEnhancedDeviceManager();
  const { user } = useAuthRBAC();

  // For therapists: get current room from room switching hook
  const therapistRoomSwitching = useTherapistRoomSwitching({
    sessionId,
    therapistName: user?.email?.split('@')[0] || 'Therapist',
    isTherapist: isTherapist || false
  });

  // Track breakout Twilio room
  const [breakoutRoom, setBreakoutRoom] = useState<Room | null>(null);

  // Memoize callbacks to prevent re-renders
  const handleBreakoutAssignment = useCallback((assignment: any) => {
    console.log('📢 [GroupSessionContainer] Received breakout assignment:', assignment);
  }, []);

  const handleDisconnectFromMainSession = useCallback(async () => {
    console.log('🔌 [GroupSessionContainer] Switching to breakout room');
  }, []);

  // Listen for breakout room assignments
  const {
    isInBreakoutRoom: assignmentInBreakoutRoom,
    currentBreakoutRoom: assignmentBreakoutRoom,
    currentRoomId: assignmentRoomId,
    currentRoomName: assignmentRoomName,
    leaveBreakoutRoom: assignmentLeaveBreakoutRoom
  } = useBreakoutAssignmentListener({
    enabled: true,
    sessionId,
    onAssigned: handleBreakoutAssignment,
    disconnectFromMainSession: handleDisconnectFromMainSession
  });

  // Update breakout room when therapist switches rooms
  useEffect(() => {
    if (isTherapist && therapistRoomSwitching.currentRoomId) {
      const roomManager = getRoomManager();
      const rm = roomManager.getRoom();
      setBreakoutRoom(rm);
      console.log('🎥 [GroupSessionContainer] Therapist breakout room updated:', rm?.sid);
    } else if (assignmentBreakoutRoom) {
      setBreakoutRoom(assignmentBreakoutRoom);
    } else {
      setBreakoutRoom(null);
    }
  }, [isTherapist, therapistRoomSwitching.currentRoomId, assignmentBreakoutRoom]);

  // Determine breakout room state
  const isInBreakoutRoom = isTherapist 
    ? (therapistRoomSwitching.currentRoomId !== null || assignmentInBreakoutRoom)
    : assignmentInBreakoutRoom;
  
  const currentBreakoutRoom = isTherapist 
    ? (breakoutRoom || assignmentBreakoutRoom)
    : assignmentBreakoutRoom;
  
  const currentRoomName = isTherapist 
    ? (therapistRoomSwitching.currentRoomName || assignmentRoomName)
    : assignmentRoomName;

  // Function to leave breakout room
  const handleLeaveBreakoutRoom = async () => {
    if (isTherapist && therapistRoomSwitching.currentRoomId) {
      await therapistRoomSwitching.returnToMainSession();
    } else {
      await assignmentLeaveBreakoutRoom();
    }
    setBreakoutRoom(null);
  };

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

  const displayParticipants = React.useMemo<DisplayParticipant[]>(
    () => sessionParticipants,
    [sessionParticipants]
  );

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
      step: isJoining ? 'Establishing Twilio connection...' : undefined,
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
      hasRoom: !!room,
      participantCount: twilioParticipants?.length || 0
    });
  }, [sessionId]);

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
      connectionState
    });
    
    if (isJoining || isInSession) {
      console.log('⚠️ [GroupSessionContainer] Blocking join - already joining or in session');
      return;
    }
    
    try {
      setIsJoining(true);
      setConnectionError(null);
      console.log('🚀 [GroupSessionContainer] Calling joinSession (Twilio)...');
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
    
    // Determine which room to show
    const displayRoom = isInBreakoutRoom && currentBreakoutRoom ? currentBreakoutRoom : room;
    
    console.log('🎬 [GroupSessionContainer] Rendering video session:', {
      isInSession,
      hasRoom: !!room,
      hasDisplayRoom: !!displayRoom,
      isInBreakoutRoom,
      hasCurrentBreakoutRoom: !!currentBreakoutRoom,
      roomSid: room?.sid,
      displayRoomSid: displayRoom?.sid,
      connectionState
    });
    
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
            <Badge variant="outline" className="text-xs">Twilio Video</Badge>
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
                  <span className="inline sm:hidden">{twilioParticipants.length}</span>
                  <span className="hidden sm:inline">({twilioParticipants.length})</span>
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
          {/* Breakout Room Indicator */}
          {isInBreakoutRoom && currentRoomName && (
            <div className="mb-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-blue-900">
                  Breakout Room: {currentRoomName}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLeaveBreakoutRoom}
                className="gap-1"
              >
                <ArrowLeft className="h-3 w-3" />
                Return to Main
              </Button>
            </div>
          )}

          {/* Unified Twilio Video Grid - for both main and breakout sessions */}
          {displayRoom ? (
            <TwilioVideoGrid
              room={displayRoom}
              roomName={isInBreakoutRoom ? currentRoomName || undefined : 'Main Session'}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <Card className="max-w-md">
                <CardContent className="p-6 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                  <p className="text-lg font-medium mb-2">Waiting for video connection...</p>
                  <p className="text-sm text-muted-foreground">
                    {connectionState === 'CONNECTING' && 'Establishing Twilio connection...'}
                    {connectionState === 'CONNECTED' && 'Connected - waiting for video tracks'}
                    {connectionState === 'FAILED' && 'Connection failed - please try again'}
                  </p>
                  {connectionState === 'FAILED' && (
                    <Button onClick={reconnectSession} className="mt-4">
                      Retry Connection
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
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
                ? "Connecting to Twilio Video..."
                : isTherapist 
                  ? "Start your session when you're ready to begin."
                  : "Join the session when the therapist is ready."
              }
            </p>
            {connectionState !== 'IDLE' && (
              <ConnectionStatus 
                connectionState={connectionState} 
                className="justify-center mt-2" 
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
                Connecting to Twilio...
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
