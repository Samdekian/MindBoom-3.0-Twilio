/**
 * WebRTC Test Helpers
 * Provides utilities for testing WebRTC functionality in unit and integration tests
 */
import { vi } from 'vitest';

export interface WebRTCTestEnvironment {
  mockPeerConnection: any;
  mockMediaStream: any;
  mockMediaDevices: any;
  restore: () => void;
}

export interface WebRTCTestResult {
  success: boolean;
  mediaAccess: boolean;
  peerConnection: boolean;
  iceConnection: boolean;
  dataChannel: boolean;
  errors: string[];
}

/**
 * Sets up a comprehensive WebRTC test environment with proper mocks
 */
export function setupWebRTCTestEnvironment(): () => void {
  const originalRTCPeerConnection = global.RTCPeerConnection;
  const originalNavigator = global.navigator;
  
  // Mock RTCPeerConnection
  const mockPeerConnection = vi.fn(() => ({
    createOffer: vi.fn().mockResolvedValue({ type: 'offer', sdp: 'mock-sdp' }),
    createAnswer: vi.fn().mockResolvedValue({ type: 'answer', sdp: 'mock-sdp' }),
    setLocalDescription: vi.fn().mockResolvedValue(undefined),
    setRemoteDescription: vi.fn().mockResolvedValue(undefined),
    addIceCandidate: vi.fn().mockResolvedValue(undefined),
    createDataChannel: vi.fn().mockReturnValue({
      readyState: 'open',
      send: vi.fn(),
      close: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }),
    getStats: vi.fn().mockResolvedValue(new Map([
      ['stats1', {
        type: 'inbound-rtp',
        packetsReceived: 100,
        packetsLost: 0,
        bytesReceived: 50000
      }]
    ])),
    close: vi.fn(),
    connectionState: 'connected',
    iceConnectionState: 'connected',
    signalingState: 'stable',
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  }));

  // Add static methods
  (mockPeerConnection as any).generateCertificate = vi.fn().mockResolvedValue({
    expires: new Date().getTime() + 86400000,
    getFingerprints: () => [{ algorithm: 'sha-256', value: 'mock-fingerprint' }]
  });

  global.RTCPeerConnection = mockPeerConnection as any;

  // Mock MediaStream
  const mockMediaStream = {
    id: 'mock-stream-id',
    active: true,
    getTracks: vi.fn().mockReturnValue([
      {
        kind: 'video',
        id: 'video-track-1',
        enabled: true,
        readyState: 'live',
        stop: vi.fn(),
        getSettings: vi.fn().mockReturnValue({
          width: 1280,
          height: 720,
          frameRate: 30
        })
      },
      {
        kind: 'audio',
        id: 'audio-track-1',
        enabled: true,
        readyState: 'live',
        stop: vi.fn(),
        getSettings: vi.fn().mockReturnValue({
          sampleRate: 44100,
          channelCount: 2
        })
      }
    ]),
    getVideoTracks: vi.fn().mockReturnValue([{
      kind: 'video',
      enabled: true,
      stop: vi.fn()
    }]),
    getAudioTracks: vi.fn().mockReturnValue([{
      kind: 'audio',
      enabled: true,
      stop: vi.fn()
    }]),
    addTrack: vi.fn(),
    removeTrack: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  };

  // Mock navigator.mediaDevices
  const mockMediaDevices = {
    getUserMedia: vi.fn().mockResolvedValue(mockMediaStream),
    getDisplayMedia: vi.fn().mockResolvedValue({
      ...mockMediaStream,
      getTracks: vi.fn().mockReturnValue([{
        kind: 'video',
        enabled: true,
        stop: vi.fn(),
        getSettings: vi.fn().mockReturnValue({
          width: 1920,
          height: 1080,
          displaySurface: 'monitor'
        })
      }])
    }),
    enumerateDevices: vi.fn().mockResolvedValue([
      {
        deviceId: 'camera-1',
        kind: 'videoinput',
        label: 'Mock Camera',
        groupId: 'group-1'
      },
      {
        deviceId: 'mic-1',
        kind: 'audioinput',
        label: 'Mock Microphone',
        groupId: 'group-1'
      },
      {
        deviceId: 'speaker-1',
        kind: 'audiooutput',
        label: 'Mock Speaker',
        groupId: 'group-1'
      }
    ]),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  };

  // Setup navigator mock
  Object.defineProperty(global, 'navigator', {
    value: {
      ...originalNavigator,
      mediaDevices: mockMediaDevices,
      userAgent: 'Mozilla/5.0 (Test Environment) TestBrowser/1.0',
      permissions: {
        query: vi.fn().mockResolvedValue({ state: 'granted' })
      }
    },
    writable: true
  });

  // Return cleanup function
  return () => {
    global.RTCPeerConnection = originalRTCPeerConnection;
    global.navigator = originalNavigator;
  };
}

/**
 * Runs a comprehensive WebRTC functionality test
 */
export async function testWebRTCConnection(): Promise<WebRTCTestResult> {
  const result: WebRTCTestResult = {
    success: false,
    mediaAccess: false,
    peerConnection: false,
    iceConnection: false,
    dataChannel: false,
    errors: []
  };

  try {
    // Test media access
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        result.mediaAccess = stream.getTracks().length > 0;
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        result.errors.push('Media access failed: ' + (error as Error).message);
      }
    } else {
      result.errors.push('Media devices API not available');
    }

    // Test peer connection
    if (window.RTCPeerConnection) {
      try {
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
        
        // Test offer creation
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        result.peerConnection = true;
        
        // Test data channel
        try {
          const dataChannel = pc.createDataChannel('test');
          result.dataChannel = dataChannel.readyState !== undefined;
        } catch (error) {
          result.errors.push('Data channel test failed: ' + (error as Error).message);
        }
        
        pc.close();
      } catch (error) {
        result.errors.push('Peer connection failed: ' + (error as Error).message);
      }
    } else {
      result.errors.push('RTCPeerConnection not available');
    }

    // Overall success determination
    result.success = result.mediaAccess && result.peerConnection;
    
  } catch (error) {
    result.errors.push('WebRTC test failed: ' + (error as Error).message);
  }

  return result;
}

/**
 * Creates mock WebRTC test data for integration tests
 */
export function createMockWebRTCData() {
  return {
    offer: {
      type: 'offer' as RTCSdpType,
      sdp: 'v=0\r\no=- 123456789 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n'
    },
    answer: {
      type: 'answer' as RTCSdpType,
      sdp: 'v=0\r\no=- 987654321 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n'
    },
    iceCandidate: {
      candidate: 'candidate:1 1 UDP 2130706431 192.168.1.100 54400 typ host',
      sdpMLineIndex: 0,
      sdpMid: 'audio'
    }
  };
}

/**
 * Validates WebRTC connection state
 */
export function validateWebRTCState(pc: RTCPeerConnection): boolean {
  return pc.connectionState === 'connected' || 
         pc.connectionState === 'connecting' ||
         pc.iceConnectionState === 'connected' ||
         pc.iceConnectionState === 'completed';
}

// Legacy exports for compatibility
export const setupWebRTCMocks = setupWebRTCTestEnvironment;
export type WebRTCMockSetup = () => void;

export default {
  setupWebRTCTestEnvironment,
  setupWebRTCMocks,
  testWebRTCConnection,
  createMockWebRTCData,
  validateWebRTCState
};