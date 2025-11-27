import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useVideoSession } from "@/contexts/TwilioVideoSessionContext";
import VideoSessionInfo from "./VideoSessionInfo";
import SessionPreparation from "./components/SessionPreparation";
import SessionErrorBoundary from "./components/SessionErrorBoundary";
import { SessionShareDialog } from "./SessionShareDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Users } from "lucide-react";
import GroupSessionContainer from "./components/GroupSessionContainer";
import BreakoutRoomManager from "./breakout/BreakoutRoomManager";

const VideoConferenceContent: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { 
    videoState,
    isInSession,
    waitingRoomActive,
    formatSessionDuration,
    deviceSettingsOpen,
    setDeviceSettingsOpen,
    showSessionSummary,
    setShowSessionSummary,
    sessionDuration,
    therapistInfo,
    patientInfo,
    isTherapist,
    cameras,
    microphones,
    speakers,
    changeDevice,
    testDevices,
    joinSession
  } = useVideoSession();
  
  const [showPreparation, setShowPreparation] = useState(!isInSession);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [autoJoinAttempted, setAutoJoinAttempted] = useState(false);

  // Auto-join session when component loads for instant sessions
  useEffect(() => {
    const attemptAutoJoin = async () => {
      if (!isInSession && !autoJoinAttempted && sessionId && therapistInfo) {
        console.log('🚀 Auto-joining session...');
        setAutoJoinAttempted(true);
        try {
          await joinSession();
          setShowPreparation(false);
        } catch (error) {
          console.error('Auto-join failed:', error);
          // Keep preparation screen open if auto-join fails
        }
      }
    };

    attemptAutoJoin();
  }, [isInSession, autoJoinAttempted, sessionId, therapistInfo, joinSession]);
  
  // Mock appointment details for components that need them
  const appointmentDetails = {
    title: "Group Therapy Session",
    patient_id: patientInfo?.id || "",
    therapist_id: therapistInfo?.id || "",
    recording_consent: true
  };
  
  return (
    <SessionErrorBoundary>
      <Card className="shadow-lg border-slate-200/60 bg-white/80 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          {showPreparation && !isInSession ? (
            <SessionPreparation 
              appointmentId="mock-appointment-id"
              onComplete={() => setShowPreparation(false)}
            />
          ) : (
            <div className="flex flex-col h-[calc(100vh-160px)] md:h-[calc(100vh-180px)]">
              {/* Session Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <VideoSessionInfo
                      appointmentDetails={appointmentDetails}
                      isInSession={isInSession}
                      waitingRoomActive={waitingRoomActive}
                      isRecording={videoState.isRecording}
                      deviceSettingsOpen={deviceSettingsOpen}
                      setDeviceSettingsOpen={setDeviceSettingsOpen}
                      videoState={videoState}
                      devices={{ cameras, microphones, speakers }}
                      changeDevice={changeDevice}
                      testDevices={testDevices}
                      formatSessionDuration={formatSessionDuration}
                    />
                  </div>
                  
                  {/* Share Button - only show for therapists */}
                  {isTherapist && sessionId && (
                    <div className="ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowShareDialog(true)}
                        className="gap-2"
                      >
                        <Share2 className="h-4 w-4" />
                        <Users className="h-4 w-4" />
                        Invite
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Breakout Rooms Panel - Only for therapists when in session */}
              {isTherapist && isInSession && sessionId && (
                <div className="p-4 border-b border-gray-200 bg-slate-50">
                  <BreakoutRoomManager 
                    sessionId={sessionId} 
                    isTherapist={isTherapist} 
                  />
                </div>
              )}
              
              {/* Main Session Content */}
              <div className="flex-1 overflow-hidden">
                {isInSession ? (
                  <GroupSessionContainer 
                    sessionId={sessionId || ''} 
                    sessionType="instant"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full bg-slate-50">
                    <div className="text-center">
                      <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <h2 className="text-2xl font-medium mb-2">
                        {isTherapist 
                          ? "Ready to start your group session" 
                          : "Waiting to join the session"}
                      </h2>
                      <p className="text-muted-foreground max-w-md">
                        {isTherapist 
                          ? "Your session is ready. Participants can join when you're ready to begin." 
                          : "Please wait while the host prepares the session."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Session Share Dialog */}
          {sessionId && (
            <SessionShareDialog
              open={showShareDialog}
              onOpenChange={setShowShareDialog}
              sessionId={sessionId}
            />
          )}
        </CardContent>
      </Card>
    </SessionErrorBoundary>
  );
};

export default VideoConferenceContent;
