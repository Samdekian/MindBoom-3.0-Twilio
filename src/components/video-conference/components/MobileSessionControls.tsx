import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  Monitor,
  Square,
  MessageSquare,
  FileText,
  Users,
  MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileSessionControlsProps {
  videoState: {
    isVideoEnabled: boolean;
    isAudioEnabled: boolean;
    isScreenSharing: boolean;
    isRecording: boolean;
  };
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onToggleScreenShare: () => void;
  onToggleRecording: () => void;
  onToggleChat: () => void;
  onToggleNotes: () => void;
  onToggleParticipants: () => void;
  onLeaveSession: () => void;
  showChat: boolean;
  showNotes: boolean;
  showParticipants: boolean;
}

const MobileSessionControls: React.FC<MobileSessionControlsProps> = ({
  videoState,
  onToggleVideo,
  onToggleAudio,
  onToggleScreenShare,
  onToggleRecording,
  onToggleChat,
  onToggleNotes,
  onToggleParticipants,
  onLeaveSession,
  showChat,
  showNotes,
  showParticipants
}) => {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-50 safe-area-pb md:hidden">
      <div className="flex justify-center items-center gap-2 p-3">
        {/* Primary controls always visible */}
        <Button
          variant={videoState.isVideoEnabled ? "default" : "destructive"}
          size="lg"
          onClick={onToggleVideo}
          className="rounded-full w-14 h-14"
        >
          {videoState.isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
        </Button>
        
        <Button
          variant={videoState.isAudioEnabled ? "default" : "destructive"}
          size="lg"
          onClick={onToggleAudio}
          className="rounded-full w-14 h-14"
        >
          {videoState.isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
        </Button>

        {/* Expandable more controls */}
        {showMore && (
          <div className="flex gap-2 animate-fade-in">
            <Button
              variant={videoState.isScreenSharing ? "secondary" : "outline"}
              size="lg"
              onClick={onToggleScreenShare}
              className="rounded-full w-12 h-12"
            >
              <Monitor className="h-5 w-5" />
            </Button>
            
            <Button
              variant={showChat ? "secondary" : "outline"}
              size="lg"
              onClick={onToggleChat}
              className="rounded-full w-12 h-12"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>

            <Button
              variant={showNotes ? "secondary" : "outline"}
              size="lg"
              onClick={onToggleNotes}
              className="rounded-full w-12 h-12"
            >
              <FileText className="h-5 w-5" />
            </Button>
          </div>
        )}

        <Button
          variant="outline"
          size="lg"
          onClick={() => setShowMore(!showMore)}
          className="rounded-full w-12 h-12"
        >
          <MoreHorizontal className={cn(
            "h-5 w-5 transition-transform",
            showMore && "rotate-90"
          )} />
        </Button>
        
        <Button
          variant="destructive"
          size="lg"
          onClick={onLeaveSession}
          className="rounded-full w-14 h-14"
        >
          <Phone className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default MobileSessionControls;