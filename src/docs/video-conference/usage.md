
# Video Conference Usage Guide

This guide provides instructions for using the video conference system in your application.

## Basic Setup

To add video conference functionality to a page, use the `VideoConference` component:

```tsx
import VideoConference from "@/components/video-conference/VideoConference";

const MyPage = () => {
  return (
    <VideoConference
      appointmentId="appointment-123"
      appointmentDetails={{
        title: "Therapy Session",
        patient_id: "patient-123",
        therapist_id: "therapist-456",
        recording_consent: true
      }}
    />
  );
};
```

## Accessing Context Values

If you need to access video conference state or functions in a custom component, use the `useVideoSessionContext` hook:

```tsx
import { useVideoSessionContext } from "@/hooks/video-conference/use-video-session-context";

const CustomControl = () => {
  const { 
    videoState,
    toggleVideo,
    toggleAudio
  } = useVideoSessionContext();
  
  return (
    <div className="custom-controls">
      <button onClick={toggleVideo}>
        {videoState.isVideoEnabled ? "Turn Off Camera" : "Turn On Camera"}
      </button>
      <button onClick={toggleAudio}>
        {videoState.isAudioEnabled ? "Mute" : "Unmute"}
      </button>
    </div>
  );
};
```

## Session Preparation

The session preparation workflow is handled automatically by the `VideoConferenceContent` component. If you need to customize this workflow, you can use the preparation components directly:

```tsx
import { useState } from "react";
import { useVideoSessionContext } from "@/hooks/video-conference/use-video-session-context";
import { usePreparationState } from "@/components/video-conference/preparation/usePreparationState";
import DeviceCheckSection from "@/components/video-conference/preparation/DeviceCheckSection";
import PreparationProgress from "@/components/video-conference/preparation/PreparationProgress";

const CustomPreparation = () => {
  const { testDevices, prepProgress } = useVideoSessionContext();
  const { deviceChecklist, updateDeviceChecklist } = usePreparationState();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleTestDevices = async () => {
    setIsLoading(true);
    await testDevices();
    setIsLoading(false);
  };
  
  return (
    <div className="custom-preparation">
      <PreparationProgress prepProgress={prepProgress} />
      <DeviceCheckSection 
        deviceChecklist={deviceChecklist}
        updateDeviceChecklist={updateDeviceChecklist}
        runDeviceTests={handleTestDevices}
        isLoading={isLoading}
      />
    </div>
  );
};
```

## Participant Information

The system automatically loads participant information for patients and therapists. To display this information:

```tsx
import { useVideoSessionContext } from "@/hooks/video-conference/use-video-session-context";

const ParticipantDisplay = () => {
  const { patientInfo, therapistInfo } = useVideoSessionContext();
  
  return (
    <div className="participants">
      {therapistInfo && (
        <div className="therapist">
          <h3>{therapistInfo.name}</h3>
          <p>{therapistInfo.title}</p>
        </div>
      )}
      {patientInfo && (
        <div className="patient">
          <h3>{patientInfo.name}</h3>
        </div>
      )}
    </div>
  );
};
```

## Chat and Whiteboard

The context also provides access to chat and whiteboard functionality:

```tsx
import { useVideoSessionContext } from "@/hooks/video-conference/use-video-session-context";

const CollaborationTools = () => {
  const { 
    chatOpen, 
    toggleChat, 
    whiteboardOpen, 
    openWhiteboard 
  } = useVideoSessionContext();
  
  return (
    <div className="tools">
      <button onClick={toggleChat}>
        {chatOpen ? "Close Chat" : "Open Chat"}
      </button>
      <button onClick={openWhiteboard}>
        Open Whiteboard
      </button>
    </div>
  );
};
```

## Video Effects

To use video effects like background blur:

```tsx
import { useVideoSessionContext } from "@/hooks/video-conference/use-video-session-context";

const VideoEffects = () => {
  const { 
    effects, 
    handleToggleBlur, 
    handleBlurAmountChange 
  } = useVideoSessionContext();
  
  return (
    <div className="effects">
      <label>
        <input
          type="checkbox"
          checked={effects.blur}
          onChange={handleToggleBlur}
        />
        Background Blur
      </label>
      
      {effects.blur && (
        <input
          type="range"
          min="1"
          max="10"
          value={effects.blurAmount}
          onChange={(e) => handleBlurAmountChange(Number(e.target.value))}
        />
      )}
    </div>
  );
};
```

## Best Practices

1. Always use the context rather than initializing hooks directly
2. Keep components small and focused
3. Use TypeScript interfaces for props
4. Follow the existing component hierarchy
5. Write tests for new components
