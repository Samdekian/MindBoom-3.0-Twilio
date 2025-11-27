
export type ConnectionMetrics = {
  // Network metrics
  roundTripTime: number | null;
  packetLoss: number | null;
  jitter: number | null;
  bitrateSent: number | null;
  bitrateReceived: number | null;
  
  // Video metrics
  frameWidth: number | null;
  frameHeight: number | null;
  framesPerSecond: number | null;
  
  // Audio metrics
  audioLevel: number | null;
  
  // Overall quality score (0-100)
  qualityScore: number;
};

// Extend the RTCStats interface to include the properties we need
export interface ExtendedRTCStats extends RTCStats {
  packetsLost?: number;
  packetsReceived?: number;
  jitter?: number;
  bytesReceived?: number;
  bytesSent?: number;
  frameWidth?: number;
  frameHeight?: number;
  framesPerSecond?: number;
  audioLevel?: number;
  currentRoundTripTime?: number;
  nominated?: boolean;
  kind?: string;
}

export type StatsMap = Map<string, ExtendedRTCStats>;
