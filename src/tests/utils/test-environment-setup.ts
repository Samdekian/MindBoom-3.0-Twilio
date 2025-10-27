import { vi } from 'vitest';
import { setupWebRTCTestEnvironment } from '../../utils/testing/webrtc-test-helpers';

// Global test environment configuration
export interface TestEnvironmentConfig {
  enableWebRTC: boolean;
  enableSupabase: boolean;
  mockLevel: 'full' | 'partial' | 'minimal';
  performanceMonitoring: boolean;
}

// Default test configuration
const DEFAULT_CONFIG: TestEnvironmentConfig = {
  enableWebRTC: true,
  enableSupabase: true,
  mockLevel: 'full',
  performanceMonitoring: false,
};

// Global setup for video conference tests
export function setupVideoConferenceTestEnvironment(
  config: Partial<TestEnvironmentConfig> = {}
): () => void {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const cleanupFunctions: (() => void)[] = [];

  // Setup WebRTC mocks
  if (finalConfig.enableWebRTC) {
    const restoreWebRTC = setupWebRTCTestEnvironment();
    cleanupFunctions.push(restoreWebRTC);
  }

  // Setup Supabase mocks
  if (finalConfig.enableSupabase) {
    const restoreSupabase = setupSupabaseMocks();
    cleanupFunctions.push(restoreSupabase);
  }

  // Setup performance monitoring
  if (finalConfig.performanceMonitoring) {
    const restorePerformance = setupPerformanceMonitoring();
    cleanupFunctions.push(restorePerformance);
  }

  // Setup global DOM APIs
  const restoreDOM = setupDOMMocks();
  cleanupFunctions.push(restoreDOM);

  // Return cleanup function
  return () => {
    cleanupFunctions.forEach(cleanup => cleanup());
  };
}

// Setup Supabase mocks
function setupSupabaseMocks(): () => void {
  // Mock Supabase client methods used in video conferencing
  const mockSupabaseClient = {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: { id: 'test-user-id' } } },
        error: null,
      }),
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      }),
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
    }),
  };

  // Store original if it exists
  const originalSupabase = (globalThis as any).supabase;
  (globalThis as any).supabase = mockSupabaseClient;

  return () => {
    if (originalSupabase) {
      (globalThis as any).supabase = originalSupabase;
    }
  };
}

// Setup performance monitoring
function setupPerformanceMonitoring(): () => void {
  const mockPerformance = {
    now: vi.fn().mockImplementation(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByType: vi.fn().mockReturnValue([]),
    getEntriesByName: vi.fn().mockReturnValue([]),
  };

  const originalPerformance = (globalThis as any).performance;
  (globalThis as any).performance = { ...originalPerformance, ...mockPerformance };

  return () => {
    (globalThis as any).performance = originalPerformance;
  };
}

// Setup DOM API mocks
function setupDOMMocks(): () => void {
  // Mock getUserMedia
  const mockGetUserMedia = vi.fn().mockResolvedValue({
    getTracks: () => [
      { kind: 'video', id: 'video-track', stop: vi.fn() },
      { kind: 'audio', id: 'audio-track', stop: vi.fn() },
    ],
    getVideoTracks: () => [{ kind: 'video', id: 'video-track', stop: vi.fn() }],
    getAudioTracks: () => [{ kind: 'audio', id: 'audio-track', stop: vi.fn() }],
  });

  const originalGetUserMedia = navigator.mediaDevices?.getUserMedia;
  if (navigator.mediaDevices) {
    navigator.mediaDevices.getUserMedia = mockGetUserMedia;
  }

  // Mock getDisplayMedia for screen sharing
  const mockGetDisplayMedia = vi.fn().mockResolvedValue({
    getTracks: () => [{ kind: 'video', id: 'screen-track', stop: vi.fn() }],
    getVideoTracks: () => [{ kind: 'video', id: 'screen-track', stop: vi.fn() }],
  });

  if (navigator.mediaDevices) {
    navigator.mediaDevices.getDisplayMedia = mockGetDisplayMedia;
  }

  // Mock enumerateDevices
  const mockEnumerateDevices = vi.fn().mockResolvedValue([
    { kind: 'videoinput', deviceId: 'camera1', label: 'Camera 1' },
    { kind: 'audioinput', deviceId: 'mic1', label: 'Microphone 1' },
  ]);

  if (navigator.mediaDevices) {
    navigator.mediaDevices.enumerateDevices = mockEnumerateDevices;
  }

  // Mock requestFullscreen
  const mockRequestFullscreen = vi.fn().mockResolvedValue(undefined);
  (globalThis as any).Element.prototype.requestFullscreen = mockRequestFullscreen;

  // Mock document.exitFullscreen
  const originalExitFullscreen = document.exitFullscreen;
  document.exitFullscreen = vi.fn().mockResolvedValue(undefined);

  return () => {
    // Restore original implementations
    if (navigator.mediaDevices && originalGetUserMedia) {
      navigator.mediaDevices.getUserMedia = originalGetUserMedia;
    }
    if (originalExitFullscreen) {
      document.exitFullscreen = originalExitFullscreen;
    }
  };
}

// Utility function to wait for async operations in tests
export const waitForAsync = (ms: number = 0): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Utility function to flush all promises
export const flushPromises = (): Promise<void> => {
  return new Promise(resolve => setImmediate(resolve));
};

// Helper to simulate network delays
export const simulateNetworkDelay = (min: number = 100, max: number = 500): Promise<void> => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};