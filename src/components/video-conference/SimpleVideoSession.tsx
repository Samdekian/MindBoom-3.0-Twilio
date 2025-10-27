import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, VideoOff, Mic, MicOff, PhoneOff } from 'lucide-react';
import { useVideoSession } from '@/contexts/VideoSessionContext';

interface SimpleVideoSessionProps {
  sessionId: string;
  isTherapist?: boolean;
}

export const SimpleVideoSession: React.FC<SimpleVideoSessionProps> = ({
  sessionId,
  isTherapist = false
}) => {
  const {
    localVideoRef,
    remoteVideoRef,
    remoteStreams,
    isInSession,
    connectionState,
    isVideoEnabled,
    isAudioEnabled,
    sessionDuration,
    joinSession,
    leaveSession,
    toggleVideo,
    toggleAudio,
    participants
  } = useVideoSession();

  const formatDuration = (duration: string) => {
    const seconds = parseInt(duration) || 0;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = () => {
    switch (connectionState) {
      case 'CONNECTING':
        return <Badge variant="outline" className="animate-pulse">Connecting...</Badge>;
      case 'CONNECTED':
        return <Badge className="bg-green-500">Connected • {formatDuration(sessionDuration)}</Badge>;
      case 'DISCONNECTED':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Reconnecting...</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">Connection Failed</Badge>;
      default:
        return <Badge variant="outline">Ready</Badge>;
    }
  };

  if (!isInSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col items-center justify-center p-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Video Session</h1>
          <p className="text-gray-600 mb-4">Ready to join your therapy session</p>
          {getStatusBadge()}
        </div>
        
        <Button 
          size="lg" 
          onClick={joinSession}
          className="h-14 px-8 text-lg"
        >
          <Video className="h-5 w-5 mr-2" />
          Join Session
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 p-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold">Therapy Session</h1>
          {getStatusBadge()}
        </div>
        <div className="text-sm">
          {connectionState === 'CONNECTED' && remoteStreams.length > 0 
            ? `Connected • ${remoteStreams.length + 1} participants` 
            : 'Waiting for participants'}
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative bg-gray-900">
        {/* Remote Video (main) */}
        {connectionState === 'CONNECTED' && remoteStreams.length > 0 ? (
          <video
            ref={remoteVideoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Video className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-lg">{connectionState === 'CONNECTING' ? 'Connecting...' : 'Waiting for participant'}</p>
            </div>
          </div>
        )}
        
        {/* Local Video (PiP) */}
        <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden border-2 border-white/20">
          <video
            ref={localVideoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900 p-6 flex items-center justify-center gap-4">
        <Button
          size="lg"
          variant={isVideoEnabled ? "default" : "destructive"}
          onClick={toggleVideo}
          className="h-14 w-14 rounded-full p-0"
        >
          {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
        </Button>
        
        <Button
          size="lg"
          variant={isAudioEnabled ? "default" : "destructive"}
          onClick={toggleAudio}
          className="h-14 w-14 rounded-full p-0"
        >
          {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
        </Button>
        
        <Button
          size="lg"
          variant="destructive"
          onClick={leaveSession}
          className="h-14 w-14 rounded-full p-0"
        >
          <PhoneOff className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};