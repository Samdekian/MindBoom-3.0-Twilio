// Browser-safe testing utilities

export type MockFunction = (...args: any[]) => any;

// Safe mock implementations for browser environments
export const createMockFunction = (): MockFunction => {
  const fn = (...args: any[]) => {
    console.warn('Mock function called in browser environment', args);
    return undefined;
  };
  
  // Add mock-specific methods that are safe in browser
  (fn as any).mockClear = () => {};
  (fn as any).mockReset = () => {};
  (fn as any).mockImplementation = () => fn;
  (fn as any).mockResolvedValue = () => fn;
  (fn as any).mockRejectedValue = () => fn;
  
  return fn;
};

// Test data factories
export const createTestSession = () => ({
  id: `test-session-${Date.now()}`,
  session_name: 'Test Video Session',
  therapist_id: 'test-therapist-123',
  is_active: true,
  created_at: new Date().toISOString(),
  expires_at: new Date(Date.now() + 3600000).toISOString(),
  max_participants: 2,
  recording_enabled: false,
  waiting_room_enabled: true,
  session_token: 'test-token-123'
});

export const createTestParticipant = (role: string = 'patient') => ({
  id: `test-participant-${Date.now()}`,
  session_id: 'test-session-123',
  user_id: `test-user-${role}`,
  role,
  participant_name: `Test ${role}`,
  is_active: true,
  joined_at: new Date().toISOString(),
  left_at: null
});

// Browser-safe WebRTC mocks
export const createMockPeerConnection = () => ({
  connectionState: 'connected' as RTCPeerConnectionState,
  iceConnectionState: 'connected' as RTCIceConnectionState,
  signalingState: 'stable' as RTCSignalingState,
  localDescription: null,
  remoteDescription: null,
  
  createOffer: createMockFunction(),
  createAnswer: createMockFunction(),
  setLocalDescription: createMockFunction(),
  setRemoteDescription: createMockFunction(),
  addIceCandidate: createMockFunction(),
  addTrack: createMockFunction(),
  removeTrack: createMockFunction(),
  getStats: createMockFunction(),
  close: createMockFunction(),
  
  onicecandidate: null,
  oniceconnectionstatechange: null,
  onconnectionstatechange: null,
  ontrack: null,
  onnegotiationneeded: null
});

export const createMockMediaStream = () => ({
  id: `mock-stream-${Date.now()}`,
  active: true,
  getTracks: () => [
    createMockMediaStreamTrack('video'),
    createMockMediaStreamTrack('audio')
  ],
  getVideoTracks: () => [createMockMediaStreamTrack('video')],
  getAudioTracks: () => [createMockMediaStreamTrack('audio')],
  addTrack: createMockFunction(),
  removeTrack: createMockFunction()
});

export const createMockMediaStreamTrack = (kind: 'audio' | 'video' = 'video') => ({
  id: `mock-track-${kind}-${Date.now()}`,
  kind,
  label: `Mock ${kind} track`,
  enabled: true,
  muted: false,
  readyState: 'live' as MediaStreamTrackState,
  stop: createMockFunction(),
  clone: () => createMockMediaStreamTrack(kind),
  getCapabilities: createMockFunction(),
  getConstraints: createMockFunction(),
  getSettings: createMockFunction(),
  applyConstraints: createMockFunction()
});

// Environment detection
export const isTestEnvironment = () => {
  return typeof process !== 'undefined' && 
         process.env && 
         (process.env.NODE_ENV === 'test' || process.env.VITEST);
};

export const isBrowserEnvironment = () => {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
};

// Safe test execution wrapper
export const runInTestEnvironment = (testFn: () => void) => {
  if (isTestEnvironment()) {
    testFn();
  } else {
    console.warn('Test function called outside test environment');
  }
};