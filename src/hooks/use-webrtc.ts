
// Simplified WebRTC hook - mainly for compatibility
export type WebRTCConnectionState = {
  isConnected: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  peerConnection: RTCPeerConnection | null;
};

export type VideoDevices = {
  cameras: MediaDeviceInfo[];
  microphones: MediaDeviceInfo[];
  speakers: MediaDeviceInfo[];
  videoInputs: MediaDeviceInfo[];
  audioInputs: MediaDeviceInfo[];
  audioOutputs: MediaDeviceInfo[];
};

// For compatibility - users should use useVideoSession from VideoSessionContext instead
export const useWebRTC = () => {
  console.warn('useWebRTC is deprecated. Use useVideoSession from VideoSessionContext instead.');
  
  return {
    state: {
      isConnected: false,
      connectionQuality: 'disconnected' as const,
      localStream: null,
      remoteStream: null,
      peerConnection: null
    },
    joinSession: async () => {},
    leaveSession: async () => {},
    toggleVideo: async () => false,
    toggleAudio: async () => false
  };
};
