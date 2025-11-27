
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CircleUser, Video, VideoOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SessionMainProps {
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  patientInfo?: any;
  therapistInfo?: any;
  videoEnabled: boolean;
  patientName?: string;
  therapistName?: string;
  status?: string;
  localVideo?: React.RefObject<HTMLVideoElement>;
  remoteVideo?: React.RefObject<HTMLVideoElement>;
}

/**
 * SessionMain Component
 * 
 * Displays the main video content for the session, including:
 * - Remote participant's video stream (large)
 * - Local participant's video stream (small overlay)
 * - Status indicators and participant names
 * - Fallback UI when video is disabled
 * 
 * Handles different video states and provides visual feedback.
 */
const SessionMain: React.FC<SessionMainProps> = ({
  localVideoRef,
  remoteVideoRef,
  patientInfo,
  therapistInfo,
  videoEnabled,
  patientName,
  therapistName,
  status,
  // Handle compatibility with older usage
  localVideo,
  remoteVideo
}) => {
  // Use either provided refs or fallback to compatibility refs
  const localRef = localVideoRef || localVideo;
  const remoteRef = remoteVideoRef || remoteVideo;
  
  // Use either provided names or extract from info objects
  const pName = patientName || (patientInfo?.name || 'Patient');
  const tName = therapistName || (therapistInfo?.name || 'Therapist');

  return (
    <div className="flex-grow flex flex-col md:flex-row overflow-hidden bg-slate-900/5 relative">
      {/* Remote video (large) */}
      <div className="flex-grow relative bg-slate-900 rounded-lg m-2 overflow-hidden shadow-lg">
        {videoEnabled ? (
          <video 
            ref={remoteRef} 
            className="w-full h-full object-cover"
            autoPlay 
            playsInline
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-800">
            <div className="text-center text-white">
              <VideoOff className="mx-auto h-12 w-12 mb-2" />
              <p>Video is disabled</p>
            </div>
          </div>
        )}
        
        <Badge className="absolute top-4 right-4 bg-black/50 text-white">
          {tName}
        </Badge>
      </div>
      
      {/* Local video (small overlay) */}
      <div className="absolute bottom-6 right-6 w-48 h-36 bg-slate-800 rounded-lg overflow-hidden shadow-lg border-2 border-slate-700/50">
        <video 
          ref={localRef} 
          className={cn(
            "w-full h-full object-cover",
            !videoEnabled && "hidden"
          )}
          autoPlay 
          playsInline
          muted
        />
        {!videoEnabled && (
          <div className="w-full h-full flex items-center justify-center">
            <CircleUser className="h-16 w-16 text-slate-400" />
          </div>
        )}
        <Badge className="absolute bottom-2 right-2 bg-black/50 text-white">
          You
        </Badge>
      </div>
    </div>
  );
};

export default SessionMain;
