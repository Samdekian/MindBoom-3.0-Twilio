
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone,
  PhoneOff,
  Users,
  Wifi,
  WifiOff,
  Share2,
  MoreVertical,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGestureControls } from "@/hooks/video-conference/use-gesture-controls";
import { useHapticFeedback } from "@/hooks/video-conference/use-haptic-feedback";
import { usePullToRefresh } from "@/hooks/video-conference/use-pull-to-refresh";
import { useUnifiedPermissionHandler } from "@/hooks/video-conference/use-unified-permission-handler";
import { useEnhancedDeviceManager } from "@/hooks/video-conference/use-enhanced-device-manager";
import { useStreamValidator } from "@/hooks/video-conference/use-stream-validator";
import { useEnhancedConnectionManager } from "@/hooks/video-conference/use-enhanced-connection-manager";
import { SessionShareDialog } from "../SessionShareDialog";
import ConnectionStatusOverlay from "../components/ConnectionStatusOverlay";
import MobileConnectionGuide from "../components/MobileConnectionGuide";

interface MobileSessionInterfaceProps {
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  remoteStreams?: MediaStream[];
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  isRecording: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
  isConnected: boolean;
  sessionStatus: 'waiting' | 'connecting' | 'connected' | 'reconnecting' | 'ended';
  participantName?: string;
  sessionDuration: number;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onToggleScreenShare: () => void;
  onToggleRecording: () => void;
  onToggleChat: () => void;
  onJoinSession: () => Promise<void>;
  onLeaveSession: () => Promise<void>;
  sessionType?: 'appointment' | 'instant';
  sessionId?: string;
  isTherapist?: boolean;
  showShareButton?: boolean;
}

const MobileSessionInterface: React.FC<MobileSessionInterfaceProps> = ({
  localVideoRef,
  remoteVideoRef,
  remoteStreams = [],
  isVideoEnabled,
  isAudioEnabled,
  isScreenSharing,
  isRecording,
  connectionQuality,
  isConnected,
  sessionStatus,
  participantName,
  sessionDuration,
  onToggleVideo,
  onToggleAudio,
  onToggleScreenShare,
  onToggleRecording,
  onToggleChat,
  onJoinSession,
  onLeaveSession,
  sessionType,
  sessionId,
  isTherapist,
  showShareButton = false
}) => {
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showConnectionGuide, setShowConnectionGuide] = useState(false);
  const { vibrate } = useHapticFeedback();
      const { 
        permissionState, 
        requestPermissions, 
        checkPermissions 
      } = useUnifiedPermissionHandler();
  const { deviceState, enumerateDevices, testDevice, requestPermissions: requestDevicePermissions } = useEnhancedDeviceManager();
  const { validateStream, validateVideoElement } = useStreamValidator();

  // Assign first remote stream to video ref when streams change
  useEffect(() => {
    if (remoteVideoRef.current && remoteStreams.length > 0) {
      const firstStream = remoteStreams[0];
      if (remoteVideoRef.current.srcObject !== firstStream) {
        console.log('📱 [MobileSessionInterface] Assigning stream to video element:', firstStream.id);
        remoteVideoRef.current.srcObject = firstStream;
        
        // Ensure video plays
        remoteVideoRef.current.play().catch(err => {
          console.warn('⚠️ [MobileSessionInterface] Video autoplay blocked:', err);
          remoteVideoRef.current.muted = true;
          remoteVideoRef.current.play().catch(e => console.error('❌ [MobileSessionInterface] Failed to play even when muted:', e));
        });
      }
    } else if (remoteVideoRef.current && remoteStreams.length === 0 && remoteVideoRef.current.srcObject) {
      console.log('📱 [MobileSessionInterface] Clearing video element - no streams');
      remoteVideoRef.current.srcObject = null;
    }
  }, [remoteStreams, remoteVideoRef]);

  // Enhanced connection recovery
  const { 
    isRecovering, 
    recoveryAttempt, 
    maxRetries, 
    startRecovery,
    handleConnectionFailure
  } = useEnhancedConnectionManager(onJoinSession, onLeaveSession, {
    maxRetries: 3,
    retryDelay: 2000,
    exponentialBackoff: true,
    onRetryAttempt: (attempt, maxRetries) => {
      console.log(`🔄 [Mobile] Recovery attempt ${attempt}/${maxRetries}`);
    }
  });

  // Enhanced connection and device status detection
  const hasConnectionIssues = connectionQuality === 'disconnected' || sessionStatus === 'ended';
  const hasPermissionIssues = permissionState.camera === 'denied' || permissionState.microphone === 'denied';
  const hasDeviceIssues = !deviceState.availability.hasCameras && !deviceState.availability.hasMicrophones;
  
  // Media stream validation with enhanced detection
  const [streamValidation, setStreamValidation] = React.useState<{
    isValid: boolean;
    hasActiveVideo: boolean;
    hasActiveAudio: boolean;
    localElementValid: boolean;
    remoteElementValid: boolean;
  } | null>(null);

  // Memoized validation functions to prevent dependency loops
  const memoizedValidateStream = React.useCallback(validateStream, []);
  const memoizedValidateVideoElement = React.useCallback(validateVideoElement, []);
  
  // Debounced stream validation ref to prevent loops
  const validationTimeoutRef = React.useRef<NodeJS.Timeout>();
  
  // Simple validation - only check if we're truly connected
  React.useEffect(() => {
    if (sessionStatus === 'connected') {
      // Simple check every 30 seconds
      const interval = setInterval(() => {
        const hasLocal = localVideoRef.current?.srcObject;
        const hasRemote = remoteVideoRef.current?.srcObject;
        
        setStreamValidation({
          isValid: !!(hasLocal || hasRemote),
          hasActiveVideo: true,
          hasActiveAudio: true,
          localElementValid: !!hasLocal,
          remoteElementValid: !!hasRemote
        });
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [sessionStatus]);

  // Gesture controls for swipe actions
  const { elementRef: gestureRef } = useGestureControls({
    onSwipeLeft: () => {
      vibrate('light');
      onToggleVideo();
    },
    onSwipeRight: () => {
      vibrate('light');
      onToggleAudio();
    },
    onSwipeUp: () => {
      vibrate('medium');
      onToggleChat();
    }
  }, sessionStatus === 'connected');

  // Pull to refresh for connection recovery
  const { elementRef: refreshRef, pullDistance, isRefreshing } = usePullToRefresh({
    onRefresh: async () => {
      vibrate('success');
      try {
        await onJoinSession();
      } catch (error) {
        console.error('Failed to reconnect:', error);
      }
    },
    enabled: connectionQuality === 'poor' || connectionQuality === 'disconnected'
  });

  // Auto-show connection guide for various mobile issues
  useEffect(() => {
    if (hasConnectionIssues || hasPermissionIssues || hasDeviceIssues) {
      const timer = setTimeout(() => {
        setShowConnectionGuide(true);
      }, 5000); // Show after 5 seconds of connection issues
      
      return () => clearTimeout(timer);
    }
  }, [hasConnectionIssues, hasPermissionIssues, hasDeviceIssues]);

  const handleRetryConnection = async () => {
    setShowConnectionGuide(false);
    
    // Use the enhanced connection recovery system
    if (isRecovering) {
      console.log('🔄 [Mobile] Recovery already in progress');
      return;
    }
    
    try {
      await startRecovery();
    } catch (error) {
      console.error('❌ [Mobile] Manual retry failed:', error);
      setShowConnectionGuide(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = () => {
    switch (sessionStatus) {
      case 'waiting':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Waiting for participant</Badge>;
      case 'connecting':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 animate-pulse">
          {isRecovering ? `Reconnecting (${recoveryAttempt}/${maxRetries})` : 'Connecting...'}
        </Badge>;
      case 'connected':
        // Enhanced connected status with comprehensive stream validation
        const hasValidStreams = streamValidation?.isValid && 
          (streamValidation?.localElementValid || streamValidation?.remoteElementValid);
        
        let statusText = `Connected • ${formatTime(sessionDuration)}`;
        let statusClass = "bg-green-500";
        
        if (!hasValidStreams) {
          statusText = `Connected (No Media) • ${formatTime(sessionDuration)}`;
          statusClass = "bg-yellow-500";
        }
        
        return <Badge className={statusClass}>{statusText}</Badge>;
      case 'reconnecting':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 animate-pulse">
          {isRecovering ? `Recovering (${recoveryAttempt}/${maxRetries})` : 'Reconnecting...'}
        </Badge>;
      case 'ended':
        return <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200">Session Ended</Badge>;
    }
  };

  const handleButtonPress = (action: () => void, hapticType: 'light' | 'medium' | 'heavy' = 'medium') => {
    vibrate(hapticType);
    action();
  };

  if (sessionStatus === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm p-4 border-b">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">Therapy Session</h1>
            {getStatusBadge()}
          </div>
          {participantName && (
            <p className="text-sm text-gray-600 mt-1">With {participantName}</p>
          )}
        </div>

        {/* Waiting Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <Users className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Ready to Join</h2>
          <p className="text-gray-600 mb-8 max-w-sm">
            Tap the button below to join your therapy session. We'll connect you as soon as both participants are ready.
          </p>
          
          <Button 
            size="lg" 
            onClick={() => handleButtonPress(onJoinSession, 'heavy')}
            className="h-14 px-8 text-lg bg-green-600 hover:bg-green-700"
          >
            <Video className="h-5 w-5 mr-2" />
            Join Session
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={(el) => {
        // Fix TypeScript error by properly typing the ref
        if (gestureRef) {
          (gestureRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
        }
        if (refreshRef) {
          (refreshRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
        }
      }}
      className="min-h-screen bg-black flex flex-col relative overflow-hidden"
      style={{
        transform: pullDistance > 0 ? `translateY(${Math.min(pullDistance, 100)}px)` : undefined,
        transition: isRefreshing ? 'transform 0.3s ease-out' : undefined
      }}
    >
      {/* Pull to refresh indicator */}
      {pullDistance > 0 && (
        <div className="absolute top-0 left-0 right-0 z-50 flex justify-center pt-4">
          <div className={cn(
            "bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium",
            pullDistance > 60 ? "text-green-600" : "text-gray-600"
          )}>
            {isRefreshing ? "Reconnecting..." : pullDistance > 60 ? "Release to reconnect" : "Pull to reconnect"}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gray-900 p-4 flex items-center justify-between text-white relative z-40">
        <div className="flex items-center gap-2">
          {connectionQuality === 'excellent' || connectionQuality === 'good' ? (
            <Wifi className="h-4 w-4 text-green-400" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-400" />
          )}
          {getStatusBadge()}
        </div>
        <div className="flex items-center gap-2">
          {participantName && (
            <span className="text-sm">{participantName}</span>
          )}
          {showShareButton && sessionId && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowShareDialog(true)}
              className="h-8 w-8 p-0 text-white hover:bg-gray-800"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Video Area with Gesture Support */}
      <div className="flex-1 relative bg-gray-900">
        {/* Enhanced Connection Status Overlay with Device Status */}
        <ConnectionStatusOverlay 
          connectionState={
            sessionStatus === 'connecting' ? 'CONNECTING' :
            sessionStatus === 'connected' ? 'CONNECTED' :
            sessionStatus === 'reconnecting' ? 'DISCONNECTED' :
            sessionStatus === 'ended' ? 'FAILED' : 'IDLE'
          }
          isInSession={isConnected}
          onRetry={handleRetryConnection}
          deviceStatus={{
            camera: deviceState.availability.hasCameras 
              ? (permissionState.camera === 'granted' ? 'granted' : 
                 permissionState.camera === 'denied' ? 'denied' : 'requesting')
              : 'unavailable',
            microphone: deviceState.availability.hasMicrophones
              ? (permissionState.microphone === 'granted' ? 'granted' :
                 permissionState.microphone === 'denied' ? 'denied' : 'requesting')  
              : 'unavailable',
            step: sessionStatus === 'connecting' ? 'Establishing video connection...' : undefined,
            progress: sessionStatus === 'connecting' ? 75 : undefined
          }}
        />

        {/* Enhanced device/permission warning overlay */}
        {(hasPermissionIssues || hasDeviceIssues) && (
          <div className="absolute top-4 left-4 right-4 z-40 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <AlertTriangle className="h-4 w-4" />
              <p className="text-sm font-medium">
                {hasDeviceIssues 
                  ? 'No Camera/Microphone Found'
                  : 'Camera/Microphone Access Needed'}
              </p>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              {hasDeviceIssues 
                ? 'Please connect a camera or microphone to join the session'
                : 'Please allow access to your camera and microphone'}
            </p>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setShowConnectionGuide(true)}
              className="mt-2 text-xs"
            >
              {hasDeviceIssues ? 'Troubleshoot' : 'Fix Permissions'}
            </Button>
          </div>
        )}

        {/* Gesture hint overlay for first-time users */}
        {sessionStatus === 'connected' && (
          <div className="absolute bottom-20 left-4 right-4 text-white/60 text-center text-xs">
            <p>Swipe left: Camera • Swipe right: Mic • Swipe up: Chat</p>
          </div>
        )}

        <div className="h-full flex flex-col p-2 gap-2 overflow-y-auto">
          {/* Multi-participant grid */}
          {sessionStatus === 'connected' ? (
            <>
              {/* Remote participants grid */}
              <div className={cn(
                "flex-1 gap-2",
                remoteStreams.length === 0 ? "flex items-center justify-center" :
                remoteStreams.length === 1 ? "grid grid-cols-1" :
                "grid grid-cols-2"
              )}>
                {remoteStreams.length > 0 ? (
                  remoteStreams.map((stream, index) => (
                    <div key={stream.id} className="relative bg-gray-800 rounded-lg overflow-hidden min-h-[200px]">
                      <video
                        ref={(el) => {
                          if (el && el.srcObject !== stream) {
                            el.srcObject = stream;
                            el.play().catch(err => {
                              console.warn('⚠️ [Mobile] Video autoplay blocked:', err);
                              el.muted = true;
                              el.play().catch(e => console.error('❌ [Mobile] Failed to play even when muted:', e));
                            });
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
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center text-white/60">
                    <Users className="h-12 w-12 mb-2 opacity-50" />
                    <p className="text-sm">Waiting for participants...</p>
                  </div>
                )}
              </div>
              
              {/* Local video - bottom bar */}
              <div className="h-32 bg-gray-900 rounded-lg overflow-hidden relative flex-shrink-0">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 text-xs text-white bg-black/70 px-2 py-1 rounded backdrop-blur-sm">
                  You {isTherapist ? '(Therapist)' : '(Patient)'}
                </div>
                {!isVideoEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <VideoOff className="h-8 w-8 text-white/50" />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              {/* Hidden video elements for refs */}
              <video ref={remoteVideoRef} style={{ display: 'none' }} />
              <div style={{ display: 'none' }}>
                <video ref={localVideoRef} />
              </div>
            </div>
          )}
          
          {/* Connecting state overlay */}
          {sessionStatus !== 'connected' && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-white text-center">
                <div className="animate-pulse w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Video className="h-16 w-16 text-gray-400" />
                </div>
                <p className="text-lg">Connecting...</p>
              </div>
            </div>
          )}
          
          {/* No remote streams message */}
          {sessionStatus === 'connected' && remoteStreams.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-white text-center">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Waiting for participants...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900 p-6 relative z-40">
        <div className="flex items-center justify-center gap-6">
          {/* Audio Toggle with Label */}
          <div className="flex flex-col items-center gap-2">
            <Button
              size="lg"
              variant={isAudioEnabled ? "secondary" : "destructive"}
              className={cn(
                "h-16 w-16 rounded-full transition-all duration-200",
                isAudioEnabled ? "bg-gray-700 hover:bg-gray-600 shadow-lg" : "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/25"
              )}
              onClick={() => handleButtonPress(onToggleAudio)}
            >
              {isAudioEnabled ? (
                <Mic className="h-6 w-6" />
              ) : (
                <MicOff className="h-6 w-6" />
              )}
            </Button>
            <span className="text-xs text-white/80 font-medium">
              {isAudioEnabled ? 'Mute' : 'Unmute'}
            </span>
          </div>

          {/* End Call with Label */}
          <div className="flex flex-col items-center gap-2">
            <Button
              size="lg"
              variant="destructive"
              className="h-16 w-16 rounded-full bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/25 transition-all duration-200"
              onClick={() => handleButtonPress(onLeaveSession, 'heavy')}
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
            <span className="text-xs text-white/80 font-medium">End Call</span>
          </div>

          {/* Video Toggle with Label */}
          <div className="flex flex-col items-center gap-2">
            <Button
              size="lg"
              variant={isVideoEnabled ? "secondary" : "destructive"}
              className={cn(
                "h-16 w-16 rounded-full transition-all duration-200",
                isVideoEnabled ? "bg-gray-700 hover:bg-gray-600 shadow-lg" : "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/25"
              )}
              onClick={() => handleButtonPress(onToggleVideo)}
            >
              {isVideoEnabled ? (
                <Video className="h-6 w-6" />
              ) : (
                <VideoOff className="h-6 w-6" />
              )}
            </Button>
            <span className="text-xs text-white/80 font-medium">
              {isVideoEnabled ? 'Camera Off' : 'Camera On'}
            </span>
          </div>
        </div>

        {/* Enhanced Connection Status with more detail */}
        <div className="text-center mt-4 space-y-2">
          <p className="text-sm text-gray-400">
            {sessionStatus === 'connected' 
              ? (streamValidation?.isValid 
                  ? `🟢 Connected • Quality: ${connectionQuality}` 
                  : `🟡 Connected (Media Issues) • Quality: ${connectionQuality}`)
              : sessionStatus === 'connecting'
              ? "🔵 Connecting..."
              : sessionStatus === 'reconnecting'
              ? "🟡 Reconnecting..."
              : "⚫ Disconnected"
            }
          </p>
          {/* Enhanced Media status indicators */}
          {sessionStatus === 'connected' && (
            <div className="flex justify-center items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  isVideoEnabled && streamValidation?.hasActiveVideo 
                    ? "bg-green-500 animate-pulse" 
                    : isVideoEnabled 
                    ? "bg-yellow-500" 
                    : "bg-gray-500"
                )} />
                <span>Video {isVideoEnabled ? 'On' : 'Off'}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  isAudioEnabled && streamValidation?.hasActiveAudio 
                    ? "bg-green-500 animate-pulse" 
                    : isAudioEnabled 
                    ? "bg-yellow-500" 
                    : "bg-gray-500"
                )} />
                <span>Audio {isAudioEnabled ? 'On' : 'Off'}</span>
              </div>
            </div>
          )}
          {/* Device availability indicators */}
          {deviceState.availability && !deviceState.availability.loading && (
            <div className="flex justify-center items-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  deviceState.availability.hasCameras ? "bg-blue-400" : "bg-gray-400"
                )} />
                <span>{deviceState.availability.cameraCount} Camera(s)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  deviceState.availability.hasMicrophones ? "bg-blue-400" : "bg-gray-400"
                )} />
                <span>{deviceState.availability.microphoneCount} Mic(s)</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Share Dialog */}
      {showShareButton && sessionId && (
        <SessionShareDialog
          open={showShareDialog}
          onOpenChange={setShowShareDialog}
          sessionId={sessionId}
        />
      )}

      {/* Mobile Connection Guide */}
      {showConnectionGuide && (
        <MobileConnectionGuide
          onClose={() => setShowConnectionGuide(false)}
          onRetry={handleRetryConnection}
          permissionState={permissionState}
        />
      )}
    </div>
  );
};

export default MobileSessionInterface;
