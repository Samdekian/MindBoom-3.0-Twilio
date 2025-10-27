
import { ExtendedRTCStats } from "../types/connection-metrics";
import { ConnectionMetrics } from "../types/connection-metrics";
import { ConnectionMetricsWithHistory } from "../types/history-metrics";

/**
 * Collects common WebRTC stats from an RTCStatsReport
 * This function serves as a base for both metrics collection approaches
 */
export function collectCommonWebRTCStats(stats: RTCStatsReport): {
  packetLoss: number | null;
  roundTripTime: number | null;
  jitter: number | null;
  bytesSent: number;
  bytesReceived: number;
  frameWidth: number | null;
  frameHeight: number | null;
  framesPerSecond: number | null;
  audioLevel: number | null;
} {
  let packetLoss: number | null = null;
  let roundTripTime: number | null = null;
  let jitter: number | null = null;
  let bytesSent = 0;
  let bytesReceived = 0;
  let frameWidth: number | null = null;
  let frameHeight: number | null = null;
  let framesPerSecond: number | null = null;
  let audioLevel: number | null = null;
  
  stats.forEach((report) => {
    const stat = report as ExtendedRTCStats;
    
    // Process RTT from candidate-pair
    if (stat.type === 'candidate-pair' && stat.nominated) {
      roundTripTime = stat.currentRoundTripTime ? stat.currentRoundTripTime * 1000 : null; // Convert to ms
    }
    
    // Process inbound-rtp for packet loss, jitter and received data
    if (stat.type === 'inbound-rtp') {
      if (stat.packetsLost !== undefined && stat.packetsReceived !== undefined) {
        const totalPackets = stat.packetsLost + stat.packetsReceived;
        packetLoss = totalPackets > 0 ? (stat.packetsLost / totalPackets) * 100 : 0;
      }
      
      if (stat.jitter !== undefined) {
        jitter = stat.jitter * 1000; // Convert to ms
      }
      
      if (stat.bytesReceived !== undefined) {
        bytesReceived += stat.bytesReceived;
      }
      
      // Video metrics from inbound stream
      if (stat.kind === 'video') {
        if (stat.frameWidth !== undefined) frameWidth = stat.frameWidth;
        if (stat.frameHeight !== undefined) frameHeight = stat.frameHeight;
        if (stat.framesPerSecond !== undefined) framesPerSecond = stat.framesPerSecond;
      }
    }
    
    // Process outbound-rtp for sent data and potential video metrics
    if (stat.type === 'outbound-rtp') {
      if (stat.bytesSent !== undefined) {
        bytesSent += stat.bytesSent;
      }
      
      // Video metrics from outbound stream (if not found in inbound)
      if (stat.kind === 'video') {
        if (frameWidth === null && stat.frameWidth !== undefined) frameWidth = stat.frameWidth;
        if (frameHeight === null && stat.frameHeight !== undefined) frameHeight = stat.frameHeight;
        if (framesPerSecond === null && stat.framesPerSecond !== undefined) framesPerSecond = stat.framesPerSecond;
      }
    }
    
    // Audio level
    if ((stat.type === 'media-source' || stat.type === 'inbound-rtp') && stat.kind === 'audio') {
      if (stat.audioLevel !== undefined) {
        audioLevel = stat.audioLevel;
      }
    }
  });
  
  return {
    packetLoss,
    roundTripTime,
    jitter,
    bytesSent,
    bytesReceived,
    frameWidth,
    frameHeight,
    framesPerSecond,
    audioLevel
  };
}

/**
 * Calculates bitrates based on byte counts and time difference
 */
export function calculateBitrate(
  currentBytes: number,
  previousBytes: number,
  deltaTimeMs: number
): number | null {
  if (deltaTimeMs <= 0 || previousBytes === undefined) {
    return null;
  }

  const deltaTimeSec = deltaTimeMs / 1000;
  return ((currentBytes - previousBytes) * 8) / deltaTimeSec; // bits per second
}

/**
 * Calculate a unified quality score from common WebRTC metrics
 */
export function calculateUnifiedQualityScore({
  roundTripTime,
  packetLoss,
  frameWidth,
  frameHeight,
  framesPerSecond,
  bitrateSent,
  bitrateReceived,
  iceState = "connected"
}: {
  roundTripTime: number | null;
  packetLoss: number | null;
  frameWidth: number | null;
  frameHeight: number | null;
  framesPerSecond: number | null;
  bitrateSent?: number | null;
  bitrateReceived?: number | null;
  iceState?: RTCIceConnectionState;
}): number {
  let score = 100;
  
  // Reduce score based on RTT
  if (roundTripTime !== null) {
    if (roundTripTime > 300) score -= 30;
    else if (roundTripTime > 150) score -= 15;
    else if (roundTripTime > 100) score -= 5;
  }
  
  // Reduce score based on packet loss (percentage)
  if (packetLoss !== null) {
    if (packetLoss > 5) score -= 40;
    else if (packetLoss > 2) score -= 20;
    else if (packetLoss > 0.5) score -= 10;
  }
  
  // Reduce score based on resolution
  if (frameWidth !== null && frameHeight !== null) {
    const pixels = frameWidth * frameHeight;
    if (pixels < 307200) score -= 10; // Less than 640x480
  }
  
  // Reduce score based on framerate
  if (framesPerSecond !== null) {
    if (framesPerSecond < 15) score -= 15;
    else if (framesPerSecond < 24) score -= 5;
  }
  
  // Reduce score based on bitrates
  if (bitrateSent !== null && bitrateSent < 500000) score -= 10; // Less than 500 kbps
  if (bitrateReceived !== null && bitrateReceived < 500000) score -= 10; // Less than 500 kbps
  
  // Adjust score based on ICE state
  if (iceState !== "connected" && iceState !== "completed") {
    score -= 30;
  }
  
  // Ensure score is between 0-100
  return Math.max(0, Math.min(100, score));
}

/**
 * Process WebRTC stats for standard metrics format
 */
export function processStatsForStandardMetrics(
  stats: RTCStatsReport,
  prevBytesSent: number,
  prevBytesReceived: number,
  prevTimestamp: number
): ConnectionMetrics {
  const currentTime = Date.now();
  const commonStats = collectCommonWebRTCStats(stats);
  
  // Calculate bitrates
  let bitrateSent: number | null = null;
  let bitrateReceived: number | null = null;
  
  if (prevTimestamp > 0) {
    const deltaTime = currentTime - prevTimestamp;
    bitrateSent = calculateBitrate(commonStats.bytesSent, prevBytesSent, deltaTime);
    bitrateReceived = calculateBitrate(commonStats.bytesReceived, prevBytesReceived, deltaTime);
  }
  
  // Calculate quality score
  const qualityScore = calculateUnifiedQualityScore({
    roundTripTime: commonStats.roundTripTime,
    packetLoss: commonStats.packetLoss,
    frameWidth: commonStats.frameWidth,
    frameHeight: commonStats.frameHeight,
    framesPerSecond: commonStats.framesPerSecond,
    bitrateSent,
    bitrateReceived
  });
  
  return {
    roundTripTime: commonStats.roundTripTime,
    packetLoss: commonStats.packetLoss,
    jitter: commonStats.jitter,
    bitrateSent,
    bitrateReceived,
    frameWidth: commonStats.frameWidth,
    frameHeight: commonStats.frameHeight,
    framesPerSecond: commonStats.framesPerSecond,
    audioLevel: commonStats.audioLevel,
    qualityScore
  };
}

/**
 * Process WebRTC stats for history metrics format
 */
export function processStatsForHistoryMetrics(
  stats: RTCStatsReport,
  peerConnection: RTCPeerConnection,
  prevBytesSent: number,
  prevBytesReceived: number,
  prevTimestamp: number
): {
  metrics: ConnectionMetricsWithHistory;
  bytesSent: number;
  bytesReceived: number;
} {
  const now = Date.now();
  const commonStats = collectCommonWebRTCStats(stats);
  
  // Calculate bandwidth
  let sendBandwidth = 0;
  let receiveBandwidth = 0;
  
  if (prevTimestamp > 0) {
    const timeDiff = (now - prevTimestamp) / 1000; // seconds
    if (timeDiff > 0) {
      sendBandwidth = (commonStats.bytesSent - prevBytesSent) * 8 / timeDiff / 1000; // kbps
      receiveBandwidth = (commonStats.bytesReceived - prevBytesReceived) * 8 / timeDiff / 1000; // kbps
    }
  }
  
  // Create metrics in history format
  const metricsWithHistory: ConnectionMetricsWithHistory = {
    timestamp: now,
    packetLoss: commonStats.packetLoss !== null ? commonStats.packetLoss / 100 : 0, // Convert from percentage to 0-1
    jitter: commonStats.jitter || 0,
    roundTripTime: commonStats.roundTripTime || 0,
    bandwidth: {
      send: sendBandwidth,
      receive: receiveBandwidth
    },
    resolution: {
      width: commonStats.frameWidth || 0,
      height: commonStats.frameHeight || 0
    },
    frameRate: commonStats.framesPerSecond || 0,
    iceState: peerConnection.iceConnectionState
  };
  
  return {
    metrics: metricsWithHistory,
    bytesSent: commonStats.bytesSent,
    bytesReceived: commonStats.bytesReceived
  };
}
