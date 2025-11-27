
export interface MockPeerConnection {
  connectionState: string;
  localDescription: any;
  remoteDescription: any;
  iceConnectionState: string;
  signalingState: string;
  onicecandidate: ((event: any) => void) | null;
  oniceconnectionstatechange: ((event: any) => void) | null;
  onconnectionstatechange: ((event: any) => void) | null;
  ontrack: ((event: any) => void) | null;
  onnegotiationneeded: ((event: any) => void) | null;
  addTrack: (track: any, stream: any) => any;
  createOffer: () => Promise<any>;
  createAnswer: () => Promise<any>;
  setLocalDescription: (desc: any) => Promise<void>;
  setRemoteDescription: (desc: any) => Promise<void>;
  addIceCandidate: (candidate: any) => Promise<void>;
  close: () => void;
}

export interface MockMediaStream {
  id: string;
  active: boolean;
  getTracks: () => MockMediaStreamTrack[];
  getAudioTracks: () => MockMediaStreamTrack[];
  getVideoTracks: () => MockMediaStreamTrack[];
  addTrack: (track: MockMediaStreamTrack) => void;
  removeTrack: (track: MockMediaStreamTrack) => void;
}

export interface MockMediaStreamTrack {
  id: string;
  kind: string;
  enabled: boolean;
  muted: boolean;
  readyState: string;
  stop: () => void;
  getCapabilities: () => any;
  getConstraints: () => any;
  getSettings: () => any;
  applyConstraints: (constraints: any) => Promise<void>;
  clone: () => MockMediaStreamTrack;
}

export interface TestResult {
  passed: boolean;
  message: string;
  details?: {
    skipped: boolean;
    tracks?: any[];
    latency?: number;
    error?: any;
  };
}

export type Mock<T> = {
  mockClear: () => void;
  mockReset: () => void;
} & T;

export type Procedure = (...args: any[]) => any;
