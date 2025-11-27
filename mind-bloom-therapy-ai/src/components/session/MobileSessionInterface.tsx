
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
  WifiOff
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileSessionInterfaceProps {
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isConnected: boolean;
  otherParticipantConnected: boolean;
  participantName?: string;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onEndCall: () => void;
  onJoinCall: () => void;
  sessionStatus: 'waiting' | 'connecting' | 'connected' | 'ended';
}

const MobileSessionInterface: React.FC<MobileSessionInterfaceProps> = ({
  isVideoEnabled,
  isAudioEnabled,
  isConnected,
  otherParticipantConnected,
  participantName,
  onToggleVideo,
  onToggleAudio,
  onEndCall,
  onJoinCall,
  sessionStatus
}) => {
  const [sessionTime, setSessionTime] = useState(0);

  // Track session duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sessionStatus === 'connected') {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionStatus]);

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
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Connecting...</Badge>;
      case 'connected':
        return <Badge className="bg-green-500">Connected • {formatTime(sessionTime)}</Badge>;
      case 'ended':
        return <Badge variant="secondary">Session Ended</Badge>;
    }
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
            onClick={onJoinCall}
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
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 p-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Wifi className="h-4 w-4 text-green-400" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-400" />
          )}
          {getStatusBadge()}
        </div>
        {participantName && (
          <span className="text-sm">{participantName}</span>
        )}
      </div>

      {/* Video Area */}
      <div className="flex-1 relative bg-gray-900">
        {sessionStatus === 'connected' ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-white text-center">
              <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Video className="h-16 w-16 text-gray-400" />
              </div>
              <p className="text-lg">Video session active</p>
              <p className="text-sm text-gray-400">Camera: {isVideoEnabled ? 'On' : 'Off'}</p>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-white text-center">
              <div className="animate-pulse w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Video className="h-16 w-16 text-gray-400" />
              </div>
              <p className="text-lg">Connecting...</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-900 p-6">
        <div className="flex items-center justify-center gap-6">
          {/* Audio Toggle */}
          <Button
            size="lg"
            variant={isAudioEnabled ? "secondary" : "destructive"}
            className={cn(
              "h-16 w-16 rounded-full",
              isAudioEnabled ? "bg-gray-700 hover:bg-gray-600" : "bg-red-600 hover:bg-red-700"
            )}
            onClick={onToggleAudio}
          >
            {isAudioEnabled ? (
              <Mic className="h-6 w-6" />
            ) : (
              <MicOff className="h-6 w-6" />
            )}
          </Button>

          {/* End Call */}
          <Button
            size="lg"
            variant="destructive"
            className="h-16 w-16 rounded-full bg-red-600 hover:bg-red-700"
            onClick={onEndCall}
          >
            <PhoneOff className="h-6 w-6" />
          </Button>

          {/* Video Toggle */}
          <Button
            size="lg"
            variant={isVideoEnabled ? "secondary" : "destructive"}
            className={cn(
              "h-16 w-16 rounded-full",
              isVideoEnabled ? "bg-gray-700 hover:bg-gray-600" : "bg-red-600 hover:bg-red-700"
            )}
            onClick={onToggleVideo}
          >
            {isVideoEnabled ? (
              <Video className="h-6 w-6" />
            ) : (
              <VideoOff className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Connection Status */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-400">
            {otherParticipantConnected 
              ? "Both participants connected" 
              : "Waiting for other participant..."
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileSessionInterface;
