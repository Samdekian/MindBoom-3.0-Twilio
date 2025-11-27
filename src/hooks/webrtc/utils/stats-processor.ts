
import { ExtendedRTCStats } from "../types/connection-metrics";

export function collectRTTFromStats(stats: RTCStatsReport): number | null {
  let currentRtt: number | null = null;
  
  stats.forEach((stat) => {
    // Cast to our extended type
    const extendedStat = stat as ExtendedRTCStats;
    
    // Process RTT from candidates-pair that is nominated
    if (extendedStat.type === 'candidate-pair' && extendedStat.nominated) {
      currentRtt = extendedStat.currentRoundTripTime ? extendedStat.currentRoundTripTime * 1000 : null; // Convert to ms
    }
  });
  
  return currentRtt;
}

export function collectPacketLossFromStats(stats: RTCStatsReport): number | null {
  let currentPacketLoss: number | null = null;
  
  stats.forEach((stat) => {
    const extendedStat = stat as ExtendedRTCStats;
    
    // Process inbound-rtp for packet loss
    if (extendedStat.type === 'inbound-rtp') {
      if (extendedStat.packetsLost && extendedStat.packetsReceived) {
        const totalPackets = extendedStat.packetsLost + extendedStat.packetsReceived;
        currentPacketLoss = totalPackets > 0 ? (extendedStat.packetsLost / totalPackets) * 100 : 0;
      }
    }
  });
  
  return currentPacketLoss;
}

export function collectJitterFromStats(stats: RTCStatsReport): number | null {
  let currentJitter: number | null = null;
  
  stats.forEach((stat) => {
    const extendedStat = stat as ExtendedRTCStats;
    
    // Process inbound-rtp for jitter
    if (extendedStat.type === 'inbound-rtp' && extendedStat.jitter) {
      currentJitter = extendedStat.jitter * 1000; // Convert to ms
    }
  });
  
  return currentJitter;
}

export function collectVideoMetricsFromStats(stats: RTCStatsReport): {
  frameWidth: number | null;
  frameHeight: number | null;
  framesPerSecond: number | null;
} {
  let frameWidth: number | null = null;
  let frameHeight: number | null = null;
  let framesPerSecond: number | null = null;
  
  stats.forEach((stat) => {
    const extendedStat = stat as ExtendedRTCStats;
    
    // For video metrics
    if (extendedStat.type === 'inbound-rtp' && extendedStat.kind === 'video') {
      if (extendedStat.frameWidth && extendedStat.frameHeight) {
        frameWidth = extendedStat.frameWidth;
        frameHeight = extendedStat.frameHeight;
        framesPerSecond = extendedStat.framesPerSecond || null;
      }
    }
  });
  
  return { frameWidth, frameHeight, framesPerSecond };
}

export function collectAudioLevelFromStats(stats: RTCStatsReport): number | null {
  let audioLevel: number | null = null;
  
  stats.forEach((stat) => {
    const extendedStat = stat as ExtendedRTCStats;
    
    // For audio metrics
    if (extendedStat.type === 'inbound-rtp' && extendedStat.kind === 'audio' && extendedStat.audioLevel !== undefined) {
      audioLevel = extendedStat.audioLevel;
    }
  });
  
  return audioLevel;
}

export function collectByteCountsFromStats(stats: RTCStatsReport): {
  bytesSent: number;
  bytesReceived: number;
} {
  let bytesSent = 0;
  let bytesReceived = 0;
  
  stats.forEach((stat) => {
    const extendedStat = stat as ExtendedRTCStats;
    
    // Process outbound-rtp for sent data
    if (extendedStat.type === 'outbound-rtp' && extendedStat.bytesSent) {
      bytesSent += extendedStat.bytesSent;
    }
    
    // Process inbound-rtp for received data
    if (extendedStat.type === 'inbound-rtp' && extendedStat.bytesReceived) {
      bytesReceived += extendedStat.bytesReceived;
    }
  });
  
  return { bytesSent, bytesReceived };
}

export function calculateBitrates(
  currentBytes: { bytesSent: number; bytesReceived: number },
  prevBytes: { bytesSent: number; bytesReceived: number },
  deltaTimeMs: number
): { bitrateSent: number | null; bitrateReceived: number | null } {
  if (deltaTimeMs <= 0) {
    return { bitrateSent: null, bitrateReceived: null };
  }

  const deltaTimeSec = deltaTimeMs / 1000;
  const bitrateSent = ((currentBytes.bytesSent - prevBytes.bytesSent) * 8) / deltaTimeSec; // bits per second
  const bitrateReceived = ((currentBytes.bytesReceived - prevBytes.bytesReceived) * 8) / deltaTimeSec; // bits per second

  return { bitrateSent, bitrateReceived };
}
