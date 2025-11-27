
// Defines structured types for connection metrics with history
export interface ConnectionMetricsWithHistory {
  timestamp: number;
  packetLoss: number;
  jitter: number;
  roundTripTime: number; // in ms
  bandwidth: {
    send: number; // in kbps
    receive: number; // in kbps
  };
  resolution: {
    width: number;
    height: number;
  };
  frameRate: number;
  iceState: RTCIceConnectionState;
}

// Stats interfaces
export interface RTCOutboundRtpStreamStats extends RTCStats {
  bytesSent?: number;
  packetsSent?: number;
  framesEncoded?: number;
  framesSent?: number;
  frameWidth?: number;
  frameHeight?: number;
  framesPerSecond?: number;
}

export interface RTCInboundRtpStreamStats extends RTCStats {
  bytesReceived?: number;
  packetsReceived?: number;
  packetsLost?: number;
  jitter?: number;
  framesDecoded?: number;
  frameWidth?: number;
  frameHeight?: number;
  framesPerSecond?: number;
}

export interface RTCRemoteInboundRtpStreamStats extends RTCStats {
  roundTripTime?: number;
  packetsLost?: number;
  jitter?: number;
}

// Stats tracking
export interface BandwidthCalculationData {
  timestamp: number;
  bytesSent: number;
  bytesReceived: number;
}
