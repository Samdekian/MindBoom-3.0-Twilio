
import React from "react";
import { VideoSessionProvider } from "@/contexts/VideoSessionContext";
import VideoConferenceContent from "./VideoConferenceContent";

interface VideoConferenceProps {
  appointmentId: string;
  appointmentDetails: {
    title: string;
    patient_id: string;
    therapist_id: string;
    recording_consent: boolean;
  };
}

const VideoConference: React.FC<VideoConferenceProps> = ({ 
  appointmentId, 
  appointmentDetails 
}) => {
  return (
    <VideoSessionProvider sessionId={appointmentId} sessionType="appointment">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <VideoConferenceContent />
      </div>
    </VideoSessionProvider>
  );
};

export default VideoConference;
