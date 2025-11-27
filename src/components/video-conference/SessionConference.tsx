
import React from 'react';
import { Share2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useVideoSession } from '@/contexts/VideoSessionContext';
import { useUnifiedPermissionHandler } from '@/hooks/video-conference/use-unified-permission-handler';
import { useProductionErrorRecovery } from '@/hooks/video-conference/use-production-error-recovery';
import { Button } from '@/components/ui/button';
import SessionLayout from './layout/SessionLayout';
import MobileSessionInterface from './mobile/MobileSessionInterface';
import SessionPreparation from './SessionPreparation';
import { SessionShareDialog } from './SessionShareDialog';
import GroupSessionContainer from './components/GroupSessionContainer';
// ProductionHealthMonitor removed to eliminate console spam

interface SessionConferenceProps {
  appointmentId?: string;
  sessionId?: string;
  sessionType?: 'appointment' | 'instant';
  autoJoin?: boolean;
}

/**
 * Main session conference component that adapts between mobile and desktop experiences
 * Now supports group sessions with up to 15 participants
 */
const SessionConference: React.FC<SessionConferenceProps> = ({ 
  appointmentId, 
  sessionId, 
  sessionType = 'appointment',
  autoJoin = false
}) => {
  const isMobile = useIsMobile();
  const { permissionState, requestPermissions } = useUnifiedPermissionHandler();
  const errorRecovery = useProductionErrorRecovery();
  const {
    videoState,
    isInSession,
    therapistInfo,
    patientInfo,
    isTherapist,
    sessionDuration,
    joinSession,
    leaveSession,
    connectionState,
    reconnectSession,
    localVideoRef,
    remoteVideoRef,
    remoteStreams,
    toggleVideo,
    toggleAudio,
    toggleScreenSharing,
    toggleRecording
  } = useVideoSession();

  const [showPreparation, setShowPreparation] = React.useState(
    sessionType === 'appointment' && !isInSession
  );
  const [sessionStatus, setSessionStatus] = React.useState<'waiting' | 'connecting' | 'connected' | 'reconnecting' | 'ended'>('waiting');
  const [showShareDialog, setShowShareDialog] = React.useState(false);
  const [reconnectAttempts, setReconnectAttempts] = React.useState(0);
  const maxReconnectAttempts = 3;

  // Enhanced session status tracking with connection state
  React.useEffect(() => {
    switch (connectionState) {
      case 'CONNECTED':
        setSessionStatus('connected');
        setReconnectAttempts(0);
        break;
      case 'CONNECTING':
        setSessionStatus('connecting');
        break;
      case 'DISCONNECTED':
        if (isInSession) {
          setSessionStatus('reconnecting');
        } else {
          setSessionStatus('waiting');
        }
        break;
      case 'FAILED':
        setSessionStatus('ended');
        break;
      default:
        if (showPreparation) {
          setSessionStatus('waiting');
        }
    }
  }, [connectionState, isInSession, showPreparation]);

  const participantName = isTherapist ? patientInfo?.name : therapistInfo?.name;
  
  // Show share button for therapists in instant sessions
  const showShareButton = sessionType === 'instant' && isTherapist;

  const handleToggleVideoControl = React.useCallback(() => {
    toggleVideo?.().catch(err => console.error('[SessionConference] Failed to toggle video', err));
  }, [toggleVideo]);

  const handleToggleAudioControl = React.useCallback(() => {
    toggleAudio?.().catch(err => console.error('[SessionConference] Failed to toggle audio', err));
  }, [toggleAudio]);

  const handleToggleScreenShareControl = React.useCallback(() => {
    toggleScreenSharing?.().catch(err => console.error('[SessionConference] Screen share toggle failed', err));
  }, [toggleScreenSharing]);

  const handleToggleRecordingControl = React.useCallback(() => {
    toggleRecording?.().catch(err => console.error('[SessionConference] Recording toggle failed', err));
  }, [toggleRecording]);

  const handleJoinSession = async () => {
    console.log('🎯 [SessionConference] handleJoinSession called', {
      sessionType,
      sessionId,
      appointmentId,
      permissionState,
      isInSession,
      connectionState
    });
    
    try {
      setSessionStatus('connecting');
      console.log('🔄 [SessionConference] Set status to connecting');
      
      // Ensure permissions are granted before joining
      if (!permissionState.bothGranted) {
        console.log('⚠️ [SessionConference] Permissions not granted, requesting...');
        const granted = await requestPermissions();
        console.log('🔒 [SessionConference] Permission request result:', granted);
        if (!granted) {
          console.log('❌ [SessionConference] Permissions denied, ending session');
          setSessionStatus('ended');
          return;
        }
      }
      
      console.log('🚀 [SessionConference] Calling joinSession...');
      await joinSession();
      console.log('✅ [SessionConference] joinSession completed');
    } catch (error) {
      console.error('❌ [SessionConference] Failed to join session:', error);
      setSessionStatus('ended');
    }
  };

  // Auto-reconnection logic
  React.useEffect(() => {
    if (sessionStatus === 'reconnecting' && reconnectAttempts < maxReconnectAttempts) {
      const reconnectTimer = setTimeout(() => {
        console.log(`🔄 Attempting reconnection ${reconnectAttempts + 1}/${maxReconnectAttempts}`);
        setReconnectAttempts(prev => prev + 1);
        reconnectSession?.();
      }, Math.pow(2, reconnectAttempts) * 1000); // Exponential backoff

      return () => clearTimeout(reconnectTimer);
    }
  }, [sessionStatus, reconnectAttempts, maxReconnectAttempts, reconnectSession]);

  // Show preparation screen only for appointments
  if (showPreparation && !isInSession && sessionType === 'appointment' && appointmentId) {
    return (
      <SessionPreparation
        appointmentId={appointmentId}
        onComplete={(permissionsValidated) => {
          setShowPreparation(false);
          if (permissionsValidated) {
            handleJoinSession();
          }
        }}
      />
    );
  }

  // Auto-join instant sessions when autoJoin is true
  React.useEffect(() => {
    if (sessionType === 'instant' && autoJoin && !isInSession && !showPreparation) {
      console.log('🚀 Auto-joining session via shareable link');
      handleJoinSession();
    }
  }, [sessionType, autoJoin, isInSession, showPreparation]);

  // Mobile interface
  if (isMobile) {
    return (
      <MobileSessionInterface
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        remoteStreams={remoteStreams}
        isVideoEnabled={videoState.isVideoEnabled}
        isAudioEnabled={videoState.isAudioEnabled}
        isScreenSharing={videoState.isScreenSharing}
        isRecording={videoState.isRecording}
        connectionQuality={videoState.connectionQuality === 'fair' ? 'good' : videoState.connectionQuality}
        isConnected={isInSession}
        sessionStatus={sessionStatus}
        participantName={participantName}
        sessionDuration={sessionDuration ? parseInt(sessionDuration.split(':')[0]) * 60 + parseInt(sessionDuration.split(':')[1]) : 0}
        onToggleVideo={handleToggleVideoControl}
        onToggleAudio={handleToggleAudioControl}
        onToggleScreenShare={handleToggleScreenShareControl}
        onToggleRecording={handleToggleRecordingControl}
        onToggleChat={() => {}}
        onJoinSession={handleJoinSession}
        onLeaveSession={leaveSession}
        sessionType={sessionType}
        sessionId={sessionId}
        isTherapist={isTherapist}
        showShareButton={showShareButton}
      />
    );
  }

  // Desktop interface with new group session container
  return (
    <>
      <SessionLayout>
        <div className="col-span-full h-full">
          <GroupSessionContainer
            sessionId={sessionId || ''}
            sessionType={sessionType}
            className="h-full"
          />
        </div>
      </SessionLayout>
      
      {/* Share Dialog */}
      {showShareButton && sessionId && (
        <SessionShareDialog
          open={showShareDialog}
          onOpenChange={setShowShareDialog}
          sessionId={sessionId}
        />
      )}
    </>
  );
};

export default SessionConference;
