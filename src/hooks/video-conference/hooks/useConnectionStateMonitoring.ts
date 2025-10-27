
import { useState, useEffect, useCallback } from "react";
import { ConnectionQuality, VideoQuality } from "../types";

interface ConnectionMetrics {
  rtt?: number;
  packetsLost?: number;
  packetsReceived?: number;
  bytesReceived?: number;
  bytesSent?: number;
  framesPerSecond?: number;
  timestamp: number;
  availableBandwidth?: number;
}

export function useConnectionStateMonitoring(
  peerConnection: RTCPeerConnection | null,
  onQualityChange?: (quality: ConnectionQuality) => void
) {
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality>("excellent");
  const [videoQuality, setVideoQuality] = useState<VideoQuality>("high");
  const [currentMetrics, setCurrentMetrics] = useState<ConnectionMetrics>({
    timestamp: Date.now()
  });
  const [metricsHistory, setMetricsHistory] = useState<ConnectionMetrics[]>([]);
  
  // Check connection metrics periodically
  useEffect(() => {
    if (!peerConnection) return;
    
    let intervalId: NodeJS.Timeout;
    
    const checkMetrics = async () => {
      try {
        const stats = await peerConnection.getStats();
        let rtt: number | undefined;
        let packetsLost = 0;
        let packetsReceived = 0;
        let bytesReceived = 0;
        let bytesSent = 0;
        let framesPerSecond: number | undefined;
        
        // Process RTCStats
        stats.forEach(stat => {
          if (stat.type === 'remote-inbound-rtp') {
            rtt = stat.roundTripTime;
          } else if (stat.type === 'inbound-rtp') {
            packetsLost += stat.packetsLost || 0;
            packetsReceived += stat.packetsReceived || 0;
            bytesReceived += stat.bytesReceived || 0;
            framesPerSecond = stat.framesPerSecond;
          } else if (stat.type === 'outbound-rtp') {
            bytesSent += stat.bytesSent || 0;
          }
        });
        
        // Calculate estimated available bandwidth
        const availableBandwidth = calculateEstimatedBandwidth(bytesReceived, bytesSent);
        
        // Create new metrics object
        const newMetrics: ConnectionMetrics = {
          rtt,
          packetsLost,
          packetsReceived,
          bytesReceived,
          bytesSent,
          framesPerSecond,
          timestamp: Date.now(),
          availableBandwidth
        };
        
        // Update metrics state
        setCurrentMetrics(newMetrics);
        setMetricsHistory(prev => [...prev, newMetrics].slice(-30)); // Keep last 30 entries
        
        // Determine connection quality
        const newQuality = determineConnectionQuality(newMetrics);
        if (newQuality !== connectionQuality) {
          setConnectionQuality(newQuality);
          if (onQualityChange) onQualityChange(newQuality);
          
          // Update video quality based on connection quality
          updateVideoQuality(newQuality);
        }
      } catch (error) {
        console.error("Error getting connection metrics:", error);
      }
    };
    
    // Run immediately and then on interval
    checkMetrics();
    intervalId = setInterval(checkMetrics, 2000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [peerConnection, connectionQuality, onQualityChange]);
  
  // Determine video quality based on connection quality
  const updateVideoQuality = useCallback((quality: ConnectionQuality) => {
    switch (quality) {
      case "excellent":
        setVideoQuality("high");
        break;
      case "good":
        setVideoQuality("medium");
        break;
      case "poor":
        setVideoQuality("low");
        break;
      case "disconnected":
        setVideoQuality("low");
        break;
      default:
        setVideoQuality("medium");
    }
  }, []);
  
  // Calculate estimated bandwidth
  const calculateEstimatedBandwidth = (bytesReceived: number, bytesSent: number): number => {
    // This is a very simplified bandwidth estimation
    // In a real implementation, you'd use RTCOutboundRtpStreamStats.targetBitrate
    // or other, more accurate methods
    return Math.max(bytesReceived, bytesSent) * 8; // bits per second
  };
  
  // Determine connection quality based on metrics
  const determineConnectionQuality = (metrics: ConnectionMetrics): ConnectionQuality => {
    // These thresholds are simplified and would need tuning in a real implementation
    if (!metrics.rtt) return "good"; // Default if no RTT data
    
    if (metrics.rtt < 100 && (!metrics.packetsLost || metrics.packetsLost < 1)) {
      return "excellent";
    } else if (metrics.rtt < 250 && (!metrics.packetsLost || metrics.packetsLost < 5)) {
      return "good";
    } else if (metrics.rtt < 500 && (!metrics.packetsLost || metrics.packetsLost < 15)) {
      return "poor";
    } else {
      return "disconnected";
    }
  };
  
  // Get average metrics over a specified period
  const getAverageMetrics = useCallback((seconds: number = 10): ConnectionMetrics => {
    const now = Date.now();
    const cutoffTime = now - (seconds * 1000);
    
    const relevantMetrics = metricsHistory.filter(m => m.timestamp >= cutoffTime);
    
    if (relevantMetrics.length === 0) {
      return { timestamp: now };
    }
    
    // Calculate averages
    let rttSum = 0;
    let rttCount = 0;
    let packetsLostSum = 0;
    let packetsReceivedSum = 0;
    let bytesReceivedSum = 0;
    let bytesSentSum = 0;
    let fpsSum = 0;
    let fpsCount = 0;
    
    relevantMetrics.forEach(m => {
      if (m.rtt !== undefined) {
        rttSum += m.rtt;
        rttCount++;
      }
      packetsLostSum += m.packetsLost || 0;
      packetsReceivedSum += m.packetsReceived || 0;
      bytesReceivedSum += m.bytesReceived || 0;
      bytesSentSum += m.bytesSent || 0;
      if (m.framesPerSecond !== undefined) {
        fpsSum += m.framesPerSecond;
        fpsCount++;
      }
    });
    
    return {
      rtt: rttCount > 0 ? rttSum / rttCount : undefined,
      packetsLost: packetsLostSum / relevantMetrics.length,
      packetsReceived: packetsReceivedSum / relevantMetrics.length,
      bytesReceived: bytesReceivedSum / relevantMetrics.length,
      bytesSent: bytesSentSum / relevantMetrics.length,
      framesPerSecond: fpsCount > 0 ? fpsSum / fpsCount : undefined,
      timestamp: now,
      availableBandwidth: calculateEstimatedBandwidth(
        bytesReceivedSum / relevantMetrics.length, 
        bytesSentSum / relevantMetrics.length
      )
    };
  }, [metricsHistory]);
  
  return {
    connectionQuality,
    videoQuality,
    currentMetrics,
    metricsHistory,
    getAverageMetrics
  };
}
