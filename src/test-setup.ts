import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock MediaDevices API
Object.defineProperty(window, 'navigator', {
  value: {
    ...window.navigator,
    mediaDevices: {
      getUserMedia: vi.fn(),
      enumerateDevices: vi.fn(),
      getDisplayMedia: vi.fn()
    }
  },
  writable: true
});

// Mock RTCPeerConnection
global.RTCPeerConnection = vi.fn().mockImplementation(() => ({
  setLocalDescription: vi.fn(),
  setRemoteDescription: vi.fn(),
  createOffer: vi.fn(),
  createAnswer: vi.fn(),
  addIceCandidate: vi.fn(),
  addTrack: vi.fn(),
  removeTrack: vi.fn(),
  getSenders: vi.fn(() => []),
  close: vi.fn(),
  connectionState: 'new',
  iceConnectionState: 'new',
  onicecandidate: null,
  ontrack: null,
  onconnectionstatechange: null,
  oniceconnectionstatechange: null
})) as any;

// Add static methods to RTCPeerConnection
(global.RTCPeerConnection as any).generateCertificate = vi.fn().mockResolvedValue({});

// Mock RTCSessionDescription
global.RTCSessionDescription = vi.fn();

// Mock RTCIceCandidate
global.RTCIceCandidate = vi.fn();

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  },
  writable: true
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  debug: vi.fn()
};