
import { ConnectionMetrics } from "../types/connection-metrics";
import { ConnectionMetricsWithHistory } from "../types/history-metrics";
import { calculateUnifiedQualityScore } from "./unified-stats-processor";

/**
 * Converts ConnectionMetricsWithHistory to ConnectionMetrics format
 */
export function convertHistoryMetricsToStandard(historyMetrics: ConnectionMetricsWithHistory): ConnectionMetrics {
  // Calculate quality score based on unified algorithm
  const qualityScore = calculateUnifiedQualityScore({
    roundTripTime: historyMetrics.roundTripTime,
    packetLoss: historyMetrics.packetLoss * 100, // Convert from 0-1 to percentage
    frameWidth: historyMetrics.resolution.width,
    frameHeight: historyMetrics.resolution.height,
    framesPerSecond: historyMetrics.frameRate,
    bitrateSent: historyMetrics.bandwidth.send * 1000, // Convert from kbps to bps
    bitrateReceived: historyMetrics.bandwidth.receive * 1000, // Convert from kbps to bps
    iceState: historyMetrics.iceState
  });

  return {
    roundTripTime: historyMetrics.roundTripTime,
    packetLoss: historyMetrics.packetLoss * 100, // Convert from 0-1 to percentage
    jitter: historyMetrics.jitter,
    bitrateSent: historyMetrics.bandwidth.send * 1000, // Convert from kbps to bps
    bitrateReceived: historyMetrics.bandwidth.receive * 1000, // Convert from kbps to bps
    frameWidth: historyMetrics.resolution.width,
    frameHeight: historyMetrics.resolution.height,
    framesPerSecond: historyMetrics.frameRate,
    audioLevel: null, // Not available in history metrics
    qualityScore: qualityScore,
  };
}

/**
 * Converts ConnectionMetrics to ConnectionMetricsWithHistory format
 */
export function convertStandardMetricsToHistory(standardMetrics: ConnectionMetrics): ConnectionMetricsWithHistory {
  return {
    timestamp: Date.now(),
    packetLoss: standardMetrics.packetLoss !== null ? standardMetrics.packetLoss / 100 : 0, // Convert from percentage to 0-1
    jitter: standardMetrics.jitter || 0,
    roundTripTime: standardMetrics.roundTripTime || 0,
    bandwidth: {
      send: standardMetrics.bitrateSent !== null ? standardMetrics.bitrateSent / 1000 : 0, // Convert from bps to kbps
      receive: standardMetrics.bitrateReceived !== null ? standardMetrics.bitrateReceived / 1000 : 0, // Convert from bps to kbps
    },
    resolution: {
      width: standardMetrics.frameWidth || 0,
      height: standardMetrics.frameHeight || 0,
    },
    frameRate: standardMetrics.framesPerSecond || 0,
    iceState: "new", // Default value since not available in standard metrics
  };
}

/**
 * Creates a hook adapter to provide a unified interface for both metrics types
 */
export function createUnifiedMetricsAdapter(
  metrics: ConnectionMetrics | ConnectionMetricsWithHistory
): ConnectionMetrics {
  if ('timestamp' in metrics && 'bandwidth' in metrics) {
    return convertHistoryMetricsToStandard(metrics);
  }
  return metrics;
}
