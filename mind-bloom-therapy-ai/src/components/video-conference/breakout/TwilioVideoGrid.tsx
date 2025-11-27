/**
 * TwilioVideoGrid Component
 * Renders video tracks from a Twilio Video room
 */

import React, { useRef, useEffect } from 'react';
import type { Room, RemoteVideoTrack, LocalVideoTrack } from 'twilio-video';
import { Card, CardContent } from '@/components/ui/card';
import { VideoOff, MicOff, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTwilioVideoDisplay, type TwilioTrackInfo } from '@/hooks/video-conference/use-twilio-video-display';

interface TwilioVideoGridProps {
  room: Room | null;
  roomName?: string;
  className?: string;
}

/**
 * Individual video tile for a Twilio participant
 */
const TwilioVideoTile: React.FC<{
  trackInfo: TwilioTrackInfo;
  attachTrack: (track: RemoteVideoTrack | LocalVideoTrack, element: HTMLVideoElement) => void;
  detachTrack: (track: RemoteVideoTrack | LocalVideoTrack, element: HTMLVideoElement) => void;
  isDominantSpeaker?: boolean;
}> = ({ trackInfo, attachTrack, detachTrack, isDominantSpeaker }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Attach/detach video track when it changes
  useEffect(() => {
    const element = videoRef.current;
    const track = trackInfo.videoTrack;

    console.log('📹 [TwilioVideoTile] Effect triggered:', {
      participantIdentity: trackInfo.participantIdentity,
      hasElement: !!element,
      hasTrack: !!track,
      isVideoEnabled: trackInfo.isVideoEnabled,
      trackEnabled: track?.isEnabled
    });

    if (element && track) {
      const trackId = 'sid' in track ? track.sid : track.name || 'local';
      console.log('📹 [TwilioVideoTile] Attaching track for:', trackInfo.participantIdentity, {
        trackId,
        trackKind: track.kind,
        trackEnabled: track.isEnabled
      });
      attachTrack(track, element);

      return () => {
        console.log('📹 [TwilioVideoTile] Detaching track for:', trackInfo.participantIdentity);
        detachTrack(track, element);
      };
    } else {
      console.warn('⚠️ [TwilioVideoTile] Cannot attach track:', {
        hasElement: !!element,
        hasTrack: !!track,
        participantIdentity: trackInfo.participantIdentity
      });
    }
  }, [trackInfo.videoTrack, trackInfo.participantIdentity, trackInfo.isVideoEnabled, attachTrack, detachTrack]);

  // Get network quality indicator
  const getNetworkQualityColor = (quality: number | null) => {
    if (quality === null) return 'bg-gray-400';
    if (quality >= 4) return 'bg-green-400';
    if (quality >= 2) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  return (
    <Card className={cn(
      "relative overflow-hidden h-full min-h-[200px]",
      isDominantSpeaker && "ring-2 ring-green-500"
    )}>
      <CardContent className="p-0 h-full bg-slate-800 flex items-center justify-center">
        {trackInfo.isVideoEnabled && trackInfo.videoTrack ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={trackInfo.isLocal} // Mute local video to prevent feedback
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-white flex flex-col items-center gap-2">
            <VideoOff className="h-8 w-8" />
            <span className="text-sm">Video Off</span>
          </div>
        )}

        {/* Participant name label */}
        <div className="absolute bottom-2 left-2 text-xs text-white bg-black/70 px-2 py-1 rounded backdrop-blur-sm flex items-center gap-2">
          <span>{trackInfo.participantIdentity}</span>
          {trackInfo.isLocal && <span className="text-green-400">(You)</span>}
          {isDominantSpeaker && <span className="text-yellow-400">🎤</span>}
        </div>

        {/* Status indicators */}
        <div className="absolute top-2 right-2 flex gap-2">
          {/* Network quality */}
          <div className={cn(
            "h-2 w-2 rounded-full",
            getNetworkQualityColor(trackInfo.networkQuality)
          )} title={`Network: ${trackInfo.networkQuality ?? 'unknown'}/5`} />
          
          {/* Audio status */}
          {!trackInfo.isAudioEnabled && (
            <MicOff className="h-4 w-4 text-red-400" />
          )}
          
          {/* Video status */}
          {!trackInfo.isVideoEnabled && (
            <VideoOff className="h-4 w-4 text-red-400" />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Main Twilio Video Grid component
 */
export const TwilioVideoGrid: React.FC<TwilioVideoGridProps> = ({
  room,
  roomName,
  className
}) => {
  const {
    localTrackInfo,
    remoteTrackInfos,
    dominantSpeaker,
    attachTrackToElement,
    detachTrackFromElement
  } = useTwilioVideoDisplay({ room, enabled: !!room });

  const totalParticipants = (localTrackInfo ? 1 : 0) + remoteTrackInfos.length;

  // Determine grid layout based on participant count
  const gridClass = cn(
    "h-full gap-4",
    totalParticipants <= 1 ? "grid grid-cols-1 md:grid-cols-2" :
    totalParticipants === 2 ? "grid grid-cols-1 md:grid-cols-2" :
    totalParticipants <= 4 ? "grid grid-cols-2" :
    "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
  );

  if (!room) {
    return (
      <div className={cn("flex items-center justify-center h-full bg-slate-900", className)}>
        <div className="text-white text-center">
          <WifiOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Connecting to breakout room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex-1 bg-slate-50 p-4 overflow-y-auto", className)}>
      {/* Room header */}
      {roomName && (
        <div className="mb-4 flex items-center gap-2">
          <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-slate-600">
            Breakout Room: {roomName}
          </span>
          <span className="text-xs text-slate-400">
            ({totalParticipants} participant{totalParticipants !== 1 ? 's' : ''})
          </span>
        </div>
      )}

      <div className={gridClass}>
        {/* Local video (self) */}
        {localTrackInfo && (
          <TwilioVideoTile
            trackInfo={localTrackInfo}
            attachTrack={attachTrackToElement}
            detachTrack={detachTrackFromElement}
            isDominantSpeaker={dominantSpeaker === localTrackInfo.participantIdentity}
          />
        )}

        {/* Remote participants */}
        {remoteTrackInfos.map((trackInfo) => (
          <TwilioVideoTile
            key={trackInfo.participantSid}
            trackInfo={trackInfo}
            attachTrack={attachTrackToElement}
            detachTrack={detachTrackFromElement}
            isDominantSpeaker={dominantSpeaker === trackInfo.participantIdentity}
          />
        ))}

        {/* Empty state placeholder */}
        {totalParticipants <= 1 && (
          <Card className="relative overflow-hidden h-full min-h-[200px]">
            <CardContent className="p-0 h-full bg-slate-800 flex items-center justify-center">
              <div className="text-white flex flex-col items-center gap-2 p-4 text-center">
                <Wifi className="h-8 w-8 opacity-50" />
                <span className="text-sm font-medium">Waiting for others...</span>
                <span className="text-xs opacity-70">
                  Other participants will appear here when they join
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TwilioVideoGrid;

