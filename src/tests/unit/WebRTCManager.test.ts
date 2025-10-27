import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WebRTCManager } from '@/lib/webrtc/webrtc-manager';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({ error: null })),
      upsert: vi.fn(() => ({ error: null })),
      delete: vi.fn(() => ({ error: null })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({ data: null, error: { code: 'PGRST116' } }))
        }))
      }))
    }))
  }
}));

vi.mock('@/lib/webrtc/signaling-client', () => ({
  SignalingClient: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockResolvedValue(true),
    disconnect: vi.fn(),
    sendOffer: vi.fn(),
    sendAnswer: vi.fn(),
    sendIceCandidate: vi.fn()
  }))
}));

vi.mock('@/lib/webrtc/ice-server-config', () => ({
  iceServerManager: {
    getConfig: vi.fn(() => ({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    })),
    initializeTurnCredentials: vi.fn(),
    getServerHealth: vi.fn().mockResolvedValue([
      { serverUrl: 'stun:stun.l.google.com:19302', isWorking: true }
    ])
  }
}));

vi.mock('@/lib/webrtc/session-persistence', () => ({
  sessionPersistence: {
    initializeSession: vi.fn(),
    addParticipant: vi.fn(),
    removeParticipant: vi.fn(),
    updateConnectionState: vi.fn(),
    updateQuality: vi.fn(),
    endSession: vi.fn(),
    recordDisconnection: vi.fn()
  }
}));

vi.mock('@/lib/webrtc/connection-monitor', () => ({
  ConnectionMonitor: vi.fn().mockImplementation(() => ({
    destroy: vi.fn(),
    getCurrentQuality: vi.fn(() => ({
      overall: 'good',
      details: {}
    })),
    getAverageQuality: vi.fn(() => ({
      overall: 'good',
      details: {}
    }))
  }))
}));

describe('WebRTCManager', () => {
  let webrtcManager: WebRTCManager;
  const mockOptions = {
    sessionId: 'test-session',
    userId: 'test-user',
    onRemoteStream: vi.fn(),
    onConnectionStateChange: vi.fn(),
    onIceConnectionStateChange: vi.fn(),
    onQualityChange: vi.fn(),
    onConnectionEvent: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    webrtcManager = new WebRTCManager(mockOptions);
  });

  it('should initialize successfully', async () => {
    const result = await webrtcManager.initialize();
    expect(result).toBe(true);
  });

  it('should get local stream', async () => {
    // Mock getUserMedia
    const mockStream = new MediaStream();
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream)
      },
      writable: true
    });

    const stream = await webrtcManager.getLocalStream();
    expect(stream).toBe(mockStream);
  });

  it('should handle getUserMedia failure', async () => {
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockRejectedValue(new Error('Permission denied'))
      },
      writable: true
    });

    const stream = await webrtcManager.getLocalStream();
    expect(stream).toBeNull();
  });

  it('should toggle video track', async () => {
    // Setup mock stream with video track
    const mockVideoTrack = {
      enabled: true,
      stop: vi.fn()
    };
    const mockStream = {
      getVideoTracks: vi.fn(() => [mockVideoTrack]),
      getTracks: vi.fn(() => [mockVideoTrack])
    } as any;

    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream)
      },
      writable: true
    });

    await webrtcManager.getLocalStream();
    const result = await webrtcManager.toggleVideo();
    
    expect(result).toBe(false); // Should be toggled off
    expect(mockVideoTrack.enabled).toBe(false);
  });

  it('should toggle audio track', async () => {
    // Setup mock stream with audio track
    const mockAudioTrack = {
      enabled: true,
      stop: vi.fn()
    };
    const mockStream = {
      getAudioTracks: vi.fn(() => [mockAudioTrack]),
      getTracks: vi.fn(() => [mockAudioTrack])
    } as any;

    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream)
      },
      writable: true
    });

    await webrtcManager.getLocalStream();
    const result = await webrtcManager.toggleAudio();
    
    expect(result).toBe(false); // Should be toggled off
    expect(mockAudioTrack.enabled).toBe(false);
  });

  it('should get connection states', () => {
    const states = webrtcManager.getConnectionStates();
    expect(typeof states).toBe('object');
  });

  it('should get remote streams', () => {
    const streams = webrtcManager.getRemoteStreams();
    expect(typeof streams).toBe('object');
  });

  it('should destroy properly', async () => {
    // Setup with local stream
    const mockTrack = { stop: vi.fn() };
    const mockStream = {
      getTracks: vi.fn(() => [mockTrack]),
      getVideoTracks: vi.fn(() => []),
      getAudioTracks: vi.fn(() => [])
    } as any;

    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream)
      },
      writable: true
    });

    await webrtcManager.getLocalStream();
    await webrtcManager.destroy();

    expect(mockTrack.stop).toHaveBeenCalled();
  });

  it('should get current local stream', () => {
    const stream = webrtcManager.getCurrentLocalStream();
    expect(stream).toBeNull(); // Initially null
  });

  it('should handle initialization failure', async () => {
    // Mock failure in signaling client
    const WebRTCManagerWithFailure = class extends WebRTCManager {
      constructor(options: any) {
        super(options);
        // Override the signaling client to fail
        (this as any).signalingClient = {
          connect: vi.fn().mockResolvedValue(false)
        };
      }
    };

    const manager = new WebRTCManagerWithFailure(mockOptions);
    const result = await manager.initialize();
    expect(result).toBe(false);
  });
});