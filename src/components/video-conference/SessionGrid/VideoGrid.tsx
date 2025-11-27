
import React from "react";
import { cn } from "@/lib/utils";

interface VideoGridProps {
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  videoState: any;
  isTherapist: boolean;
  patientInfo: { name: string; email: string } | null;
  therapistInfo: { name: string; email: string } | null;
  emergencyContact: string | null;
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
  saveNotes: () => Promise<void>;
  className?: string;
}

const VideoGrid: React.FC<VideoGridProps> = ({
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
  className
}) => {
  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 h-full", className)}>
      {/* Local video */}
      <div className="relative bg-muted rounded-lg overflow-hidden shadow-md">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
          You {videoState.isVideoEnabled ? "" : "(Video off)"}
        </div>
        {videoState.connectionQuality !== "excellent" && (
          <div className="absolute top-2 right-2 bg-yellow-500/80 text-white px-2 py-1 rounded text-xs">
            Connection: {videoState.connectionQuality}
          </div>
        )}
      </div>

      {/* Remote video */}
      <div className="relative bg-muted rounded-lg overflow-hidden shadow-md">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
          {isTherapist ? patientInfo?.name || "Patient" : therapistInfo?.name || "Therapist"}
        </div>
      </div>

      {/* Session info and notes (conditionally rendered for therapists) */}
      {isTherapist && (
        <div className="lg:col-span-2 bg-card rounded-lg p-4 shadow-md">
          <h3 className="text-lg font-medium mb-2">Session Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full h-32 p-2 border rounded-md mb-2"
            placeholder="Enter session notes here..."
          />
          <button
            onClick={saveNotes}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Save Notes
          </button>
          
          {emergencyContact && (
            <div className="mt-4">
              <h4 className="font-medium">Emergency Contact:</h4>
              <p className="text-sm">{emergencyContact}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoGrid;
