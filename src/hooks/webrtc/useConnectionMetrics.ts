
import { useState, useCallback, useEffect, useRef } from "react";
import { useToast } from "../use-toast";
import { ConnectionMetrics, StatsMap } from "./types/connection-metrics";
import { processStatsForStandardMetrics } from "./utils/unified-stats-processor";

export function useConnectionMetrics(peerConnection: RTCPeerConnection | null) {
  const [metrics, setMetrics] = useState<ConnectionMetrics>({
    roundTripTime: null,
    packetLoss: null,
    jitter: null,
    bitrateSent: null,
    bitrateReceived: null,
    frameWidth: null,
    frameHeight: null,
    framesPerSecond: null,
    audioLevel: null,
    qualityScore: 100,
  });
  
  const { toast } = useToast();
  
  // Store previous values for bitrate calculation
  const prevBytesSent = useRef<number>(0);
  const prevBytesReceived = useRef<number>(0);
  const prevTimestamp = useRef<number | null>(null);
  
  // Collect WebRTC stats
  const collectStats = useCallback(async () => {
    if (!peerConnection) return;
    
    try {
      const stats = await peerConnection.getStats();
      const currentTimestamp = Date.now();
      
      // Use the unified processor to get metrics
      const updatedMetrics = processStatsForStandardMetrics(
        stats,
        prevBytesSent.current,
        prevBytesReceived.current,
        prevTimestamp.current || 0
      );
      
      // Update metrics state
      setMetrics(updatedMetrics);
      
      // Store current values for next comparison
      let totalBytesSent = 0;
      let totalBytesReceived = 0;
      
      stats.forEach((stat) => {
        if (stat.type === 'outbound-rtp' && 'bytesSent' in stat) {
          totalBytesSent += (stat.bytesSent as number);
        }
        
        if (stat.type === 'inbound-rtp' && 'bytesReceived' in stat) {
          totalBytesReceived += (stat.bytesReceived as number);
        }
      });
      
      prevBytesSent.current = totalBytesSent;
      prevBytesReceived.current = totalBytesReceived;
      prevTimestamp.current = currentTimestamp;
    } catch (err) {
      console.error('Error collecting WebRTC stats:', err);
    }
  }, [peerConnection]);
  
  // Periodically collect stats when connection is active
  useEffect(() => {
    if (!peerConnection) return;
    
    const intervalId = setInterval(collectStats, 2000); // Collect every 2 seconds
    
    return () => {
      clearInterval(intervalId);
      prevTimestamp.current = null;
    };
  }, [peerConnection, collectStats]);
  
  // Expose a method to forcefully collect stats on demand
  const refreshMetrics = useCallback(async () => {
    await collectStats();
  }, [collectStats]);
  
  // Notify about poor connection quality
  useEffect(() => {
    if (metrics.qualityScore < 40 && peerConnection?.connectionState === 'connected') {
      toast({
        title: "Poor connection quality",
        description: "Your network connection is unstable. Consider disabling video."
      });
    }
  }, [metrics.qualityScore, peerConnection, toast]);
  
  return {
    metrics,
    refreshMetrics
  };
}

// Re-export types
export type { ConnectionMetrics } from './types/connection-metrics';
