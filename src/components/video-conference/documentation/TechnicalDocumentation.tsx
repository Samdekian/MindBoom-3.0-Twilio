import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code } from "lucide-react";

const TechnicalDocumentation: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          <div>
            <CardTitle>Technical Documentation</CardTitle>
            <CardDescription>
              Developer reference for the video conferencing system
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="architecture">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
            <TabsTrigger value="hooks">Hooks</TabsTrigger>
          </TabsList>
          
          <TabsContent value="architecture">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">System Architecture</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  The video conferencing system is built on a layered architecture with clear separation of concerns.
                </p>
                
                <div className="border rounded-lg p-4 space-y-4">
                  <div>
                    <h4 className="font-medium">Core Layer</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Provides fundamental WebRTC functionality, media stream handling, and peer connections.
                      This layer is responsible for establishing connections, managing media streams,
                      and handling device selection.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Feature Layer</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Built on top of the core layer, implements specific features such as recording,
                      screen sharing, video effects, and quality adaptation. Each feature is implemented
                      as a separate React hook that can be composed together.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">UI Layer</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Provides the user interface components for the video conferencing system,
                      including controls, video displays, and participant information. This layer
                      is built with accessibility in mind and supports keyboard navigation, screen
                      readers, and high contrast mode.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Integration Layer</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Connects the video conferencing system to the rest of the application,
                      handling authentication, appointment data, and session management.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Data Flow</h3>
                
                <div className="border rounded-lg p-4">
                  <ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground">
                    <li>
                      <strong>Session Initialization:</strong> When a user joins a session,
                      the system first acquires local media streams based on device selection.
                    </li>
                    <li>
                      <strong>Signaling:</strong> The system establishes a signaling connection
                      and negotiates the WebRTC peer connection.
                    </li>
                    <li>
                      <strong>Media Exchange:</strong> Audio and video streams are exchanged
                      between peers using the established WebRTC connection.
                    </li>
                    <li>
                      <strong>Feature Processing:</strong> Enhanced features like recording,
                      screen sharing, and video effects are applied to the media streams as needed.
                    </li>
                    <li>
                      <strong>Quality Monitoring:</strong> The system continuously monitors
                      connection quality and adapts media parameters accordingly.
                    </li>
                    <li>
                      <strong>Session Termination:</strong> When a user leaves, the system
                      cleans up media streams, closes connections, and generates session data.
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="api">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Core API</h3>
                
                <div className="border rounded-lg p-4 space-y-4">
                  <div>
                    <h4 className="font-medium">VideoConference Component</h4>
                    <div className="bg-muted p-3 rounded-md my-2 text-xs font-mono overflow-x-auto">
                      {`<VideoConference
  appointmentId="string"
  appointmentDetails={{
    title: string;
    patient_id: string;
    therapist_id: string;
    recording_consent?: boolean | null;
  }}
/>`}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Main component that renders the video conferencing interface.
                      Requires an appointment ID and basic appointment details.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">useVideoConference Hook</h4>
                    <div className="bg-muted p-3 rounded-md my-2 text-xs font-mono overflow-x-auto">
                      {`const {
  videoState, // State of video, audio, screen sharing, etc.
  toggleVideo, // Toggle video on/off
  toggleAudio, // Toggle audio on/off
  toggleScreenSharing, // Toggle screen sharing
  toggleRecording, // Toggle recording
  toggleBlur, // Toggle background blur
  updateBlurAmount, // Adjust blur intensity
  connectionQuality, // Current connection quality
  isInSession, // Whether user is in an active session
  joinSession, // Join a video session
  leaveSession, // Leave the current session
  // ... other properties and methods
} = useVideoConference(appointmentId);`}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Main hook for controlling the video conference functionality.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Types & Interfaces</h3>
                
                <div className="border rounded-lg p-4 space-y-4">
                  <div>
                    <h4 className="font-medium">VideoSessionState</h4>
                    <div className="bg-muted p-3 rounded-md my-2 text-xs font-mono overflow-x-auto">
                      {`interface VideoSessionState {
  videoEnabled: boolean;
  audioEnabled: boolean;
  screenShareEnabled: boolean;
  recordingEnabled: boolean;
  connectionQuality: ConnectionQuality;
  videoQuality: VideoQuality;
}`}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">ConnectionQuality</h4>
                    <div className="bg-muted p-3 rounded-md my-2 text-xs font-mono overflow-x-auto">
                      {`type ConnectionQuality = 'excellent' | 'good' | 'poor' | 'disconnected';`}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">VideoQuality</h4>
                    <div className="bg-muted p-3 rounded-md my-2 text-xs font-mono overflow-x-auto">
                      {`type VideoQuality = 'high' | 'medium' | 'low';`}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">VideoEffects</h4>
                    <div className="bg-muted p-3 rounded-md my-2 text-xs font-mono overflow-x-auto">
                      {`interface VideoEffects {
  blurEnabled: boolean;
  blurLevel: VideoBlurLevel; // 0-10
}`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="hooks">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Core Hooks</h3>
                
                <div className="border rounded-lg p-4 space-y-4">
                  <div>
                    <h4 className="font-medium">useVideoConferenceCore</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Provides fundamental video conferencing functionality, including media
                      stream handling, device selection, and basic WebRTC connection management.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">useLocalMedia</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Manages local media streams, including camera and microphone access,
                      device selection, and stream constraints.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">usePeerConnection</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Handles WebRTC peer connection setup, negotiation, and ICE candidate exchange.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Feature Hooks</h3>
                
                <div className="border rounded-lg p-4 space-y-4">
                  <div>
                    <h4 className="font-medium">useVideoEffects</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Provides background blur and other video effects functionality.
                    </p>
                    <div className="bg-muted p-3 rounded-md my-2 text-xs font-mono overflow-x-auto">
                      {`const [videoEffects, toggleBlur, updateBlurAmount, applyingEffect] = useVideoEffects();`}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">useScreenSharing</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Handles screen sharing functionality, including permission requests
                      and stream management.
                    </p>
                    <div className="bg-muted p-3 rounded-md my-2 text-xs font-mono overflow-x-auto">
                      {`const { isScreenSharing, toggleScreenSharing } = useScreenSharing(peerConnection, videoRef, setVideoState);`}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">useEncryptedRecording</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Provides secure, encrypted recording functionality for video sessions.
                    </p>
                    <div className="bg-muted p-3 rounded-md my-2 text-xs font-mono overflow-x-auto">
                      {`const { isRecording, toggleRecording } = useEncryptedRecording(appointmentId);`}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">useConnectionStateMonitoring</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Monitors WebRTC connection quality and provides metrics for
                      analysis and adaptation.
                    </p>
                    <div className="bg-muted p-3 rounded-md my-2 text-xs font-mono overflow-x-auto">
                      {`const { connectionQuality, videoQuality, currentMetrics, metricsHistory } =
  useConnectionStateMonitoring(peerConnection, onQualityChange);`}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">useBandwidthAdaptation</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Dynamically adapts video quality based on available bandwidth
                      and device capabilities.
                    </p>
                    <div className="bg-muted p-3 rounded-md my-2 text-xs font-mono overflow-x-auto">
                      {`const { currentQualityTier, forceAdaptation } = 
  useBandwidthAdaptation(peerConnection, getLocalStream);`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TechnicalDocumentation;
