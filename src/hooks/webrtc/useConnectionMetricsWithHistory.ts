import { useState, useEffect, useCallback, useRef } from "react";
import { ConnectionMetricsWithHistory, BandwidthCalculationData } from "./types/history-metrics";
import { processStatsForHistoryMetrics } from "./utils/unified-stats-processor";
import { calculateAverageMetrics } from "./utils/stats-history-processor";

export function useConnectionMetricsWithHistory(
  peerConnection: RTCPeerConnection | null,
  historyLength = 60 // Default: keep 60 entries
) {
  // Current metrics
  const [currentMetrics, setCurrentMetrics] = useState<ConnectionMetricsWithHistory>({
    timestamp: Date.now(),
    packetLoss: 0,
    jitter: 0,
    roundTripTime: 0,
    bandwidth: {
      send: 0,
      receive: 0
    },
    resolution: {
      width: 0,
      height: 0
    },
    frameRate: 0,
    iceState: "new"
  });
  
  // Metrics history
  const [metricsHistory, setMetricsHistory] = useState<ConnectionMetricsWithHistory[]>([]);
  
  // Previous values for bandwidth calculation
  const prevStats = useRef<BandwidthCalculationData>({
    timestamp: 0,
    bytesSent: 0,
    bytesReceived: 0
  });
  
  // Collection interval in milliseconds (2 seconds)
  const COLLECTION_INTERVAL = 2000;
  
  // Collect metrics from peer connection
  const collectMetrics = useCallback(async () => {
    if (!peerConnection) return;
    
    try {
      const stats = await peerConnection.getStats();
      
      // Use the unified processor
      const { metrics, bytesSent, bytesReceived } = processStatsForHistoryMetrics(
        stats,
        peerConnection,
        prevStats.current.bytesSent,
        prevStats.current.bytesReceived,
        prevStats.current.timestamp
      );
      
      // Update previous values
      prevStats.current = {
        timestamp: metrics.timestamp,
        bytesSent,
        bytesReceived
      };
      
      // Update current metrics
      setCurrentMetrics(metrics);
      
      // Update history (keeping only last historyLength entries)
      setMetricsHistory(prev => {
        const newHistory = [...prev, metrics];
        if (newHistory.length > historyLength) {
          return newHistory.slice(newHistory.length - historyLength);
        }
        return newHistory;
      });
      
    } catch (err) {
      console.error("Error collecting WebRTC metrics:", err);
    }
  }, [peerConnection, historyLength]);
  
  // Start collecting metrics
  useEffect(() => {
    if (!peerConnection) return;
    
    // Collect metrics immediately 
    collectMetrics();
    
    // Set up interval
    const interval = setInterval(collectMetrics, COLLECTION_INTERVAL);
    
    return () => {
      clearInterval(interval);
    };
  }, [peerConnection, collectMetrics]);
  
  // Helper function to get average metrics over a time period
  const getAverageMetrics = useCallback((seconds: number): ConnectionMetricsWithHistory => {
    return calculateAverageMetrics(metricsHistory, Date.now(), seconds);
  }, [metricsHistory]);
  
  return { currentMetrics, metricsHistory, getAverageMetrics };
}

export type { ConnectionMetricsWithHistory } from "./types/history-metrics";
