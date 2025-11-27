
import React, { useEffect } from 'react';
import { useVideoSession } from '@/contexts/VideoSessionContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SessionContainerProps {
  sessionId?: string;
}

const SessionContainer: React.FC<SessionContainerProps> = ({ sessionId }) => {
  const {
    localVideoRef,
    remoteVideoRef,
    videoState,
    isInSession,
    waitingRoomActive,
    toggleVideo,
    toggleAudio,
    leaveSession,
    joinSession,
    formatSessionDuration,
    sessionDuration,
    therapistInfo,
    patientInfo,
    isTherapist,
    // Debug states
    sessionStatus,
    cameraStatus,
    streamDebugInfo,
    deviceSwitching
  } = useVideoSession();

  // Initialize camera preview even before joining session
  useEffect(() => {
    const initCameraPreview = async () => {
      if (!isInSession && localVideoRef.current) {
        try {
          console.log('🎬 Initializing camera preview...');
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: false 
          });
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.muted = true;
          console.log('✅ Camera preview initialized');
        } catch (error) {
          console.log('🚫 Camera preview failed:', error);
        }
      }
    };

    initCameraPreview();
  }, [isInSession, localVideoRef]);

  if (!isInSession) {
    return (
      <Card className="w-full h-96 flex items-center justify-center">
        <CardContent className="text-center space-y-4">
          <div className="flex items-center gap-2 justify-center mb-4">
            <h3 className="text-lg font-semibold">Ready to join?</h3>
            {cameraStatus === 'requesting' && (
              <div className="animate-spin text-sm">⚡</div>
            )}
          </div>
          
          {/* Camera preview */}
          <div className="relative w-64 h-48 mx-auto bg-slate-900 rounded-lg overflow-hidden">
            {cameraStatus === 'granted' ? (
              <>
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  Camera Preview ✅
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white">
                  {cameraStatus === 'requesting' && (
                    <>
                      <div className="animate-pulse text-2xl mb-2">📹</div>
                      <p className="text-sm">Requesting camera access...</p>
                    </>
                  )}
                  {cameraStatus === 'denied' && (
                    <>
                      <div className="text-2xl mb-2">❌</div>
                      <p className="text-sm">Camera access denied</p>
                      <p className="text-xs opacity-80 mt-1">Please allow camera access</p>
                    </>
                  )}
                  {cameraStatus === 'idle' && (
                    <>
                      <div className="text-2xl mb-2">📹</div>
                      <p className="text-sm">Camera preview will appear here</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <Button 
            onClick={joinSession} 
            size="lg"
            disabled={sessionStatus === 'connecting' || sessionStatus === 'initializing'}
          >
            {sessionStatus === 'connecting' || sessionStatus === 'initializing' ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin">⚡</div>
                Connecting...
              </div>
            ) : (
              'Join Session'
            )}
          </Button>
          
          {cameraStatus === 'denied' && (
            <p className="text-sm text-red-500 mt-2">
              Camera access is required. Please refresh and allow permissions.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Main video area */}
      <div className="flex-1 relative bg-slate-900 rounded-lg overflow-hidden">
        {/* Remote video (main view) - Shows actual remote stream */}
        <div className="absolute inset-0">
          {sessionStatus === 'connected' ? (
            <>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 pointer-events-none">
                <div className="text-center text-white space-y-4">
                  <div className="text-6xl mb-4">👤</div>
                  <p className="text-xl font-medium">
                    {isTherapist ? patientInfo?.name : therapistInfo?.name}
                  </p>
                  <p className="text-sm opacity-80">
                    Remote participant video stream
                  </p>
                  <Badge className="bg-white/10 text-white border-white/20">
                    Demo: Using Local Camera as Remote
                  </Badge>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
              <div className="text-center text-white space-y-4">
                {sessionStatus === 'connecting' && (
                  <>
                    <div className="animate-spin text-4xl mb-4">⚡</div>
                    <p className="text-xl font-medium">Connecting...</p>
                    <p className="text-sm opacity-80">Setting up video connection</p>
                  </>
                )}
                {sessionStatus === 'failed' && (
                  <>
                    <div className="text-4xl mb-4">❌</div>
                    <p className="text-xl font-medium">Connection Failed</p>
                    <p className="text-sm opacity-80">Unable to establish video connection</p>
                  </>
                )}
                {sessionStatus === 'idle' && (
                  <>
                    <div className="text-4xl mb-4">📹</div>
                    <p className="text-xl font-medium">Ready to Connect</p>
                    <p className="text-sm opacity-80">Join the session to start video call</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Local video (picture-in-picture) */}
        <div className="absolute bottom-4 right-4 w-48 h-36 bg-slate-800 rounded-lg overflow-hidden border-2 border-white shadow-lg">
          {videoState.isVideoEnabled && streamDebugInfo.hasVideo ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-800">
              <div className="text-center text-white">
                {cameraStatus === 'requesting' && (
                  <div className="animate-pulse">
                    <Video className="h-6 w-6 mx-auto mb-1" />
                    <span className="text-xs">Starting...</span>
                  </div>
                )}
                {cameraStatus === 'denied' && (
                  <div>
                    <VideoOff className="h-6 w-6 mx-auto mb-1 text-red-400" />
                    <span className="text-xs">Access Denied</span>
                  </div>
                )}
                {(cameraStatus === 'granted' && !videoState.isVideoEnabled) && (
                  <div>
                    <VideoOff className="h-6 w-6 mx-auto mb-1 text-slate-400" />
                    <span className="text-xs">Video Off</span>
                  </div>
                )}
              </div>
            </div>
          )}
          <Badge className="absolute bottom-2 left-2 bg-black/50 text-white text-xs">
            You
          </Badge>
          {!videoState.isAudioEnabled && streamDebugInfo.hasAudio && (
            <div className="absolute top-2 left-2">
              <MicOff className="w-4 h-4 text-red-400" />
            </div>
          )}
        </div>

        {/* Session info overlay */}
        <div className="absolute top-4 left-4 space-y-2">
          <Badge variant="secondary" className="bg-black/50 text-white">
            {formatSessionDuration()}
          </Badge>
          <Badge className={cn(
            "block",
            sessionStatus === 'connected' && "bg-green-500/90 text-white",
            sessionStatus === 'connecting' && "bg-yellow-500/90 text-white",
            sessionStatus === 'failed' && "bg-red-500/90 text-white",
            sessionStatus === 'disconnecting' && "bg-orange-500/90 text-white"
          )}>
            {sessionStatus === 'connected' && 'Connected'}
            {sessionStatus === 'connecting' && 'Connecting...'}
            {sessionStatus === 'failed' && 'Connection Failed'}
            {sessionStatus === 'disconnecting' && 'Disconnecting...'}
          </Badge>
          
          {/* Debug info */}
          <div className="bg-black/70 text-white text-xs p-2 rounded max-w-xs">
            <div>Camera: {cameraStatus}</div>
            <div>Video: {streamDebugInfo.hasVideo ? '✅' : '❌'} ({streamDebugInfo.videoTrackCount})</div>
            <div>Audio: {streamDebugInfo.hasAudio ? '✅' : '❌'} ({streamDebugInfo.audioTrackCount})</div>
            {streamDebugInfo.lastUpdated && (
              <div>Updated: {streamDebugInfo.lastUpdated}</div>
            )}
            {deviceSwitching && <div className="text-yellow-300">⚡ Switching device...</div>}
          </div>
        </div>

        {/* Controls overlay */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-3 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
            <Button
              variant={videoState.isVideoEnabled && streamDebugInfo.hasVideo ? "default" : "destructive"}
              size="sm"
              onClick={() => {
                console.log('🎥 Video toggled:', !videoState.isVideoEnabled);
                toggleVideo();
              }}
              disabled={deviceSwitching || cameraStatus === 'requesting'}
              className="rounded-full"
            >
              {deviceSwitching ? (
                <div className="animate-spin h-4 w-4">⚡</div>
              ) : videoState.isVideoEnabled && streamDebugInfo.hasVideo ? (
                <Video className="h-4 w-4" />
              ) : (
                <VideoOff className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant={videoState.isAudioEnabled && streamDebugInfo.hasAudio ? "default" : "destructive"}
              size="sm"
              onClick={() => {
                console.log('🎤 Audio toggled:', !videoState.isAudioEnabled);
                toggleAudio();
              }}
              disabled={deviceSwitching || cameraStatus === 'requesting'}
              className="rounded-full"
            >
              {deviceSwitching ? (
                <div className="animate-spin h-4 w-4">⚡</div>
              ) : videoState.isAudioEnabled && streamDebugInfo.hasAudio ? (
                <Mic className="h-4 w-4" />
              ) : (
                <MicOff className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                console.log('📞 Leaving session...');
                leaveSession();
              }}
              disabled={sessionStatus === 'disconnecting'}
              className="rounded-full"
            >
              {sessionStatus === 'disconnecting' ? (
                <div className="animate-spin h-4 w-4">⚡</div>
              ) : (
                <PhoneOff className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionContainer;
