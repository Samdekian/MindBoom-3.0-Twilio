import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VideoSessionProvider, useVideoSession } from '@/contexts/VideoSessionContext';
import { AuthRBACProvider } from '@/contexts/AuthRBACContext';
import React from 'react';

// Mock the auth context
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com'
};

const mockAuthContext = {
  user: mockUser,
  isTherapist: false,
  isPatient: true,
  isAdmin: false,
  loading: false,
  signOut: vi.fn()
};

vi.mock('@/contexts/AuthRBACContext', () => ({
  AuthRBACProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuthRBAC: () => mockAuthContext
}));

// Mock useWebRTCManager
const mockWebRTCManager = {
  isInitialized: false,
  connectionState: 'IDLE' as const,
  localStream: null,
  remoteStreams: {},
  initialize: vi.fn().mockResolvedValue(true),
  startSession: vi.fn().mockResolvedValue(true),
  toggleVideo: vi.fn().mockResolvedValue(true),
  toggleAudio: vi.fn().mockResolvedValue(true),
  destroy: vi.fn().mockResolvedValue(undefined),
  manager: null
};

vi.mock('@/hooks/webrtc/useWebRTCManager', () => ({
  useWebRTCManager: () => mockWebRTCManager
}));

// Mock other hooks
vi.mock('@/hooks/use-session-participants', () => ({
  useSessionParticipants: () => ({
    participants: []
  })
}));

vi.mock('@/hooks/webrtc/useMediaDevices', () => ({
  useMediaDevices: () => ({
    cameras: [],
    microphones: [],
    speakers: [],
    isLoading: false,
    error: null,
    enumerateDevices: vi.fn()
  })
}));

vi.mock('@/hooks/video-conference/use-unified-permission-handler', () => ({
  useUnifiedPermissionHandler: () => ({
    permissionState: {
      camera: 'granted',
      microphone: 'granted',
      bothGranted: true,
      isChecking: false,
      realCameraAccess: true,
      realMicrophoneAccess: true
    },
    requestPermissions: vi.fn().mockResolvedValue(true),
    checkPermissions: vi.fn()
  })
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthRBACProvider>
    <VideoSessionProvider sessionId="test-session">
      {children}
    </VideoSessionProvider>
  </AuthRBACProvider>
);

describe('VideoSessionContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useVideoSession(), { wrapper });

    expect(result.current.isInSession).toBe(false);
    expect(result.current.connectionState).toBe('IDLE');
    expect(result.current.videoState.isVideoEnabled).toBe(false);
    expect(result.current.videoState.isAudioEnabled).toBe(false);
    expect(result.current.sessionStatus).toBe('waiting');
  });

  it('should join session successfully', async () => {
    const { result } = renderHook(() => useVideoSession(), { wrapper });

    await act(async () => {
      await result.current.joinSession();
    });

    expect(mockWebRTCManager.initialize).toHaveBeenCalled();
    expect(mockWebRTCManager.startSession).toHaveBeenCalledWith({
      video: true,
      audio: true
    });
    expect(result.current.isInSession).toBe(true);
    expect(result.current.videoState.isVideoEnabled).toBe(true);
    expect(result.current.videoState.isAudioEnabled).toBe(true);
  });

  it('should leave session successfully', async () => {
    const { result } = renderHook(() => useVideoSession(), { wrapper });

    // First join the session
    await act(async () => {
      await result.current.joinSession();
    });

    expect(result.current.isInSession).toBe(true);

    // Then leave the session
    await act(async () => {
      await result.current.leaveSession();
    });

    expect(mockWebRTCManager.destroy).toHaveBeenCalled();
    expect(result.current.isInSession).toBe(false);
    expect(result.current.videoState.isVideoEnabled).toBe(false);
    expect(result.current.videoState.isAudioEnabled).toBe(false);
  });

  it('should toggle video successfully', async () => {
    const { result } = renderHook(() => useVideoSession(), { wrapper });

    await act(async () => {
      await result.current.joinSession();
    });

    await act(async () => {
      const enabled = await result.current.toggleVideo();
      expect(enabled).toBe(true);
    });

    expect(mockWebRTCManager.toggleVideo).toHaveBeenCalled();
  });

  it('should toggle audio successfully', async () => {
    const { result } = renderHook(() => useVideoSession(), { wrapper });

    await act(async () => {
      await result.current.joinSession();
    });

    await act(async () => {
      const enabled = await result.current.toggleAudio();
      expect(enabled).toBe(true);
    });

    expect(mockWebRTCManager.toggleAudio).toHaveBeenCalled();
  });

  it('should format session duration correctly', () => {
    const { result } = renderHook(() => useVideoSession(), { wrapper });

    expect(result.current.formatSessionDuration(0)).toBe('0:00');
    expect(result.current.formatSessionDuration(65)).toBe('1:05');
    expect(result.current.formatSessionDuration(3661)).toBe('61:01');
  });

  it('should handle join session error gracefully', async () => {
    mockWebRTCManager.initialize.mockResolvedValueOnce(false);

    const { result } = renderHook(() => useVideoSession(), { wrapper });

    await act(async () => {
      await result.current.joinSession();
    });

    expect(result.current.isInSession).toBe(false);
    expect(mockWebRTCManager.startSession).not.toHaveBeenCalled();
  });

  it('should calculate session status based on connection state', () => {
    const { result } = renderHook(() => useVideoSession(), { wrapper });

    expect(result.current.sessionStatus).toBe('waiting');
    expect(result.current.cameraStatus).toBe('available');
  });

  it('should provide correct participant info', () => {
    const { result } = renderHook(() => useVideoSession(), { wrapper });

    expect(result.current.participants).toEqual([]);
    expect(result.current.therapistInfo).toBeNull();
    expect(result.current.patientInfo).toBeNull();
    expect(result.current.isTherapist).toBe(false);
  });
});