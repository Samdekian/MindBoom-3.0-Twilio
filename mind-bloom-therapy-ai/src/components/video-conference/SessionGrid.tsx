import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import ResponsiveVideoGrid from "./components/ResponsiveVideoGrid";
import { ConnectionQuality, VideoSessionState } from '@/types/video-session';

interface SessionGridProps {
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  videoState: VideoSessionState;
  isTherapist: boolean;
  patientInfo: { name: string; email: string } | null;
  therapistInfo: { name: string; email: string } | null;
  emergencyContact: string | null;
  notes: string;
  setNotes: (v: string) => void;
  saveNotes: () => void;
  connectionState?: 'IDLE' | 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'FAILED';
  isInSession?: boolean;
  onRetryConnection?: () => void;
}

const SessionGrid: React.FC<SessionGridProps> = ({
  localVideoRef,
  remoteVideoRef,
  videoState,
  isTherapist,
  patientInfo,
  therapistInfo,
  emergencyContact,
  notes,
  setNotes,
  saveNotes,
  connectionState = 'CONNECTED',
  isInSession = true,
  onRetryConnection,
}) => {
  // Get the connection quality as a valid value
  const isScreenSharing = videoState.isScreenSharing || videoState.screenShareEnabled || false;
  const connectionQuality: "excellent" | "good" | "poor" | "disconnected" = 
    videoState.connectionQuality === 'fair' ? 'good' : 
    (videoState.connectionQuality || "good") as "excellent" | "good" | "poor" | "disconnected";

  return (
    <div className="h-full flex flex-col p-2 space-y-2">
      {/* Responsive video layout */}
      <div className="flex-1">
        <ResponsiveVideoGrid
          localVideoRef={localVideoRef}
          remoteVideoRef={remoteVideoRef}
          isScreenSharing={isScreenSharing}
          connectionQuality={connectionQuality}
          connectionState={connectionState}
          isInSession={isInSession}
          localLabel="You"
          remoteLabel={isTherapist ? patientInfo?.name : therapistInfo?.name}
          onRetryConnection={onRetryConnection}
        />
      </div>
      
      {/* Therapist tools */}
      {isTherapist && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Card className="p-3 text-sm">
            <h4 className="font-medium mb-1 flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Emergency Contact
            </h4>
            <p>{emergencyContact || "Not provided"}</p>
          </Card>
          <Card className="p-3 text-sm md:col-span-2">
            <h4 className="font-medium mb-1">Session Notes</h4>
            <div className="flex gap-2">
              <textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                className="flex-1 p-2 text-sm border rounded-md h-20"
                placeholder="Type your notes here..."
              />
              <Button size="sm" onClick={saveNotes} className="h-10">Save</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SessionGrid;
