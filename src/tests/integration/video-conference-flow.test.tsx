import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import VideoConferencePage from '@/pages/VideoConferencePage';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

// Mock components that aren't relevant to integration testing
vi.mock('@/components/video-conference/VideoSessionInterface', () => ({
  VideoSessionInterface: () => <div data-testid="video-session-interface">Video Interface</div>
}));

vi.mock('@/components/video-conference/PreSessionChecks', () => ({
  PreSessionChecks: ({ onReadyStateChange }: { onReadyStateChange: (ready: boolean) => void }) => (
    <div data-testid="pre-session-checks">
      <button onClick={() => onReadyStateChange(true)}>Ready</button>
    </div>
  )
}));

// Mock the context
const mockVideoSessionContext = {
  isInSession: false,
  joinSession: vi.fn(),
  leaveSession: vi.fn(),
  toggleVideo: vi.fn(),
  toggleAudio: vi.fn(),
  videoState: {
    isVideoEnabled: false,
    isAudioEnabled: false,
    connectionQuality: 'good' as const,
    sessionDuration: '0:00'
  },
  sessionStatus: 'waiting' as const,
  cameraStatus: 'available' as const,
  connectionState: 'IDLE' as const,
  localVideoRef: { current: null },
  remoteVideoRef: { current: null },
  localStream: null,
  remoteStreams: [],
  participants: [],
  therapistInfo: null,
  patientInfo: null,
  isTherapist: false,
  cameras: [],
  microphones: [],
  speakers: [],
  deviceSettingsOpen: false,
  setDeviceSettingsOpen: vi.fn(),
  waitingRoomActive: false,
  showSessionSummary: false,
  setShowSessionSummary: vi.fn(),
  deviceSwitching: false,
  changeDevice: vi.fn(),
  testDevices: vi.fn(),
  sessionDuration: '0:00',
  formatSessionDuration: vi.fn(() => '0:00'),
  reconnectSession: vi.fn(),
  toggleScreenSharing: vi.fn(),
  toggleScreenShare: vi.fn(),
  toggleRecording: vi.fn(),
  localVideoTrack: null,
  localAudioTrack: null,
  remoteVideoTracks: [],
  streamDebugInfo: {
    localStream: false,
    remoteStreams: 0,
    connectionState: 'IDLE',
    hasVideo: false,
    hasAudio: false,
    videoTrackCount: 0,
    audioTrackCount: 0,
    lastUpdated: new Date().toISOString()
  }
};

vi.mock('@/contexts/VideoSessionContext', () => ({
  useVideoSession: () => mockVideoSessionContext,
  VideoSessionProvider: ({ children }: { children: React.ReactNode }) => children
}));

// Mock router params
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ sessionId: 'test-session-id' }),
    useNavigate: () => vi.fn()
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <MemoryRouter>
      {component}
    </MemoryRouter>
  );
};

describe('Video Conference Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render pre-session checks initially', () => {
    renderWithRouter(<VideoConferencePage />);
    
    expect(screen.getByTestId('pre-session-checks')).toBeInTheDocument();
    expect(screen.queryByTestId('video-session-interface')).not.toBeInTheDocument();
  });

  it('should show video interface after passing pre-session checks', async () => {
    renderWithRouter(<VideoConferencePage />);
    
    const readyButton = screen.getByText('Ready');
    fireEvent.click(readyButton);

    await waitFor(() => {
      expect(screen.getByTestId('video-session-interface')).toBeInTheDocument();
    });
  });

  it('should handle session join flow', async () => {
    mockVideoSessionContext.isInSession = false;
    
    renderWithRouter(<VideoConferencePage />);
    
    // Go through pre-session checks
    fireEvent.click(screen.getByText('Ready'));
    
    await waitFor(() => {
      expect(screen.getByTestId('video-session-interface')).toBeInTheDocument();
    });

    // The VideoSessionInterface should be rendered
    expect(screen.getByTestId('video-session-interface')).toBeInTheDocument();
  });

  it('should show session interface when already in session', () => {
    mockVideoSessionContext.isInSession = true;
    
    renderWithRouter(<VideoConferencePage />);
    
    expect(screen.getByTestId('video-session-interface')).toBeInTheDocument();
  });

  it('should handle different session statuses', () => {
    // Create a new context object to avoid mutating the shared one
    const modifiedContext = {
      ...mockVideoSessionContext,
      sessionStatus: 'failed' as const
    };
    
    vi.mocked(require('@/contexts/VideoSessionContext').useVideoSession).mockReturnValueOnce(modifiedContext);
    
    renderWithRouter(<VideoConferencePage />);
    
    // Should still render the interface for failed state
    expect(screen.getByTestId('pre-session-checks')).toBeInTheDocument();
  });

  it('should display session ID in the page', () => {
    renderWithRouter(<VideoConferencePage />);
    
    // The session ID should be displayed or accessible in some way
    // This depends on the actual implementation of VideoConferencePage
    expect(document.body).toContainHTML('test-session-id');
  });
});