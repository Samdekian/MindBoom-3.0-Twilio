
# Video Conference Architecture Documentation

## Overview

The video conference system uses a context-based architecture to manage state and functionality across components. This approach centralizes state management and provides a consistent API for all video conference-related components.

## Key Components

### Core Structure

- **VideoSessionProvider**: The main provider that initializes all hooks and provides context to child components
- **VideoSessionContext**: The context that holds all state and functions for the video conference
- **VideoConference**: The top-level component that wraps the provider and content
- **SessionContainer**: The main container for the video conference UI
- **SessionPreparation**: The component for device and environment setup before joining

### Preparation Components

- **DeviceCheckSection**: Component for checking camera, microphone, and speakers
- **EnvironmentCheckSection**: Component for verifying network, lighting, and noise conditions
- **PreparationProgress**: Progress indicator for the preparation process
- **PreparationFooter**: Control buttons for the preparation workflow

### Custom Hooks

- **useVideoConference**: Main hook for video conference functionality
- **useSessionPreparation**: Hook for managing preparation state and stages
- **usePreparationState**: Hook for managing checklist state
- **useParticipantInfo**: Hook for loading participant information
- **useSessionNotes**: Hook for managing session notes
- **useSessionChat**: Hook for chat functionality
- **useSessionWhiteboard**: Hook for whiteboard functionality
- **useVideoEffectControls**: Hook for video effects like blur

## State Flow

The architecture follows a unidirectional data flow:

1. State is initialized in the VideoSessionProvider
2. State is passed to child components via context
3. Components consume context values instead of initializing their own state
4. Events trigger context functions that update state
5. Updated state flows back to components via context

## Usage Examples

### Accessing Video Context

```tsx
import { useVideoSessionContext } from "@/hooks/video-conference/use-video-session-context";

const MyComponent = () => {
  const { 
    videoState, 
    toggleVideo, 
    toggleAudio 
  } = useVideoSessionContext();
  
  return (
    <div>
      <button onClick={toggleVideo}>
        {videoState.isVideoEnabled ? "Disable Video" : "Enable Video"}
      </button>
    </div>
  );
};
```

### Session Preparation Workflow

1. SessionPreparation component is rendered
2. User completes device checks
3. User completes environment checks
4. User clicks "Continue to Session"
5. SessionPreparation calls onComplete callback
6. VideoConferenceContent shows main session UI

## Testing

The architecture includes several test files:

- **PreparationProgress.test.tsx**: Tests for the progress component
- **usePreparationState.test.tsx**: Tests for the preparation state hook

Run tests using:

```bash
npm test
```

## Type Definitions

The architecture uses TypeScript interfaces for all components and hooks:

- **PreparationProgressProps**: Props for the progress component
- **PreparationFooterProps**: Props for the footer component
- **DeviceChecklist**: Interface for device check state
- **EnvironmentChecklist**: Interface for environment check state
- **PrepStage**: Type for preparation stages
- **VideoSessionContextProps**: Props for the video session context

## Best Practices

1. Always use the context instead of initializing hooks directly in components
2. Ensure all components receive proper props with TypeScript interfaces
3. Follow the established component hierarchy
4. Use small, focused components instead of large monolithic ones
5. Write tests for new components and hooks
