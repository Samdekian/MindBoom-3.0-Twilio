import { useState, useEffect, useCallback, useRef } from 'react';
import { ConnectionQuality } from '@/types/video-session';

export interface RTCStats {
  // Connection stats
  roundTripTime: number;
  packetsLost: number;
  packetsSent: number;
  bytesReceived: number;
  bytesSent: number;
  
  // Video stats
  framesSent: number;
  framesReceived: number;
  framesDropped: number;
  frameWidth: number;
  frameHeight: number;
  framesPerSecond: number;
  
  // Audio stats
  audioLevel: number;
  totalAudioEnergy: number;
  
  // Quality metrics
  jitter: number;
  packetLossPercentage: number;
  availableBandwidth: number;
}

export interface ConnectionQualityMetrics {
  quality: ConnectionQuality;
  score: number; // 0-100
  rtt: number;
  packetLoss: number;
  bandwidth: number;
  resolution: string;
  fps: number;
  jitter: number;
  recommendation: string;
}

interface UseConnectionQualityMonitorOptions {
  peerConnection: RTCPeerConnection | null;
  enabled?: boolean;
  interval?: number;
}

export function useConnectionQualityMonitor({
  peerConnection,
  enabled = true,
  interval = 1000
}: UseConnectionQualityMonitorOptions) {
  const [stats, setStats] = useState<RTCStats | null>(null);
  const [quality, setQuality] = useState<ConnectionQualityMetrics>({
    quality: 'good',
    score: 100,
    rtt: 0,
    packetLoss: 0,
    bandwidth: 0,
    resolution: '0x0',
    fps: 0,
    jitter: 0,
    recommendation: 'Connection is optimal'
  });

  const [isMonitoring, setIsMonitoring] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousStats = useRef<RTCStats | null>(null);

  const calculateConnectionQuality = useCallback((currentStats: RTCStats): ConnectionQualityMetrics => {
    const { roundTripTime, packetLossPercentage, availableBandwidth, frameWidth, frameHeight, framesPerSecond, jitter } = currentStats;
    
    let score = 100;
    let quality: ConnectionQuality = 'excellent';
    let recommendation = 'Connection is optimal';

    // RTT scoring (0-40 points)
    if (roundTripTime > 300) {
      score -= 40;
      recommendation = 'High latency detected - check network connection';
    } else if (roundTripTime > 150) {
      score -= 20;
      recommendation = 'Moderate latency - connection may feel slow';
    } else if (roundTripTime > 50) {
      score -= 10;
    }

    // Packet loss scoring (0-30 points)
    if (packetLossPercentage > 5) {
      score -= 30;
      recommendation = 'High packet loss - consider reducing video quality';
    } else if (packetLossPercentage > 2) {
      score -= 20;
      recommendation = 'Packet loss detected - video quality may be affected';
    } else if (packetLossPercentage > 0.5) {
      score -= 10;
    }

    // Jitter scoring (0-15 points)
    if (jitter > 50) {
      score -= 15;
    } else if (jitter > 20) {
      score -= 10;
    } else if (jitter > 10) {
      score -= 5;
    }

    // Bandwidth scoring (0-15 points)
    const requiredBandwidth = frameWidth * frameHeight * framesPerSecond * 0.1 / 1000; // Rough estimate
    if (availableBandwidth < requiredBandwidth * 0.5) {
      score -= 15;
      recommendation = 'Low bandwidth - consider audio-only mode';
    } else if (availableBandwidth < requiredBandwidth * 0.8) {
      score -= 10;
      recommendation = 'Limited bandwidth - reducing video quality recommended';
    }

    // Determine quality category
    if (score >= 85) {
      quality = 'excellent';
      if (score === 100) recommendation = 'Connection is optimal';
    } else if (score >= 70) {
      quality = 'good';
    } else if (score >= 50) {
      quality = 'fair';
    } else if (score >= 30) {
      quality = 'poor';
    } else {
      quality = 'disconnected';
      recommendation = 'Connection is very poor - troubleshooting needed';
    }

    return {
      quality,
      score: Math.max(0, score),
      rtt: roundTripTime,
      packetLoss: packetLossPercentage,
      bandwidth: availableBandwidth,
      resolution: `${frameWidth}x${frameHeight}`,
      fps: framesPerSecond,
      jitter,
      recommendation
    };
  }, []);

  const collectStats = useCallback(async () => {
    if (!peerConnection || peerConnection.connectionState !== 'connected') {
      return;
    }

    try {
      const statsReport = await peerConnection.getStats();
      
      let newStats: Partial<RTCStats> = {
        roundTripTime: 0,
        packetsLost: 0,
        packetsSent: 0,
        bytesReceived: 0,
        bytesSent: 0,
        framesSent: 0,
        framesReceived: 0,
        framesDropped: 0,
        frameWidth: 0,
        frameHeight: 0,
        framesPerSecond: 0,
        audioLevel: 0,
        totalAudioEnergy: 0,
        jitter: 0,
        packetLossPercentage: 0,
        availableBandwidth: 0
      };

      statsReport.forEach((report) => {
        switch (report.type) {
          case 'candidate-pair':
            if (report.state === 'succeeded' && report.nominated) {
              newStats.roundTripTime = report.currentRoundTripTime * 1000 || 0;
              newStats.availableBandwidth = report.availableOutgoingBitrate || 0;
            }
            break;

          case 'inbound-rtp':
            if (report.mediaType === 'video') {
              newStats.framesReceived = report.framesReceived || 0;
              newStats.framesDropped = report.framesDropped || 0;
              newStats.frameWidth = report.frameWidth || 0;
              newStats.frameHeight = report.frameHeight || 0;
              newStats.framesPerSecond = report.framesPerSecond || 0;
              newStats.packetsLost = report.packetsLost || 0;
              newStats.bytesReceived = report.bytesReceived || 0;
              newStats.jitter = report.jitter || 0;
            }
            if (report.mediaType === 'audio') {
              newStats.audioLevel = report.audioLevel || 0;
              newStats.totalAudioEnergy = report.totalAudioEnergy || 0;
            }
            break;

          case 'outbound-rtp':
            if (report.mediaType === 'video') {
              newStats.framesSent = report.framesSent || 0;
              newStats.packetsSent = report.packetsSent || 0;
              newStats.bytesSent = report.bytesSent || 0;
            }
            break;
        }
      });

      // Calculate packet loss percentage
      if (newStats.packetsSent && newStats.packetsLost) {
        newStats.packetLossPercentage = (newStats.packetsLost / (newStats.packetsSent + newStats.packetsLost)) * 100;
      }

      const completeStats = newStats as RTCStats;
      setStats(completeStats);
      
      // Calculate and set quality metrics
      const qualityMetrics = calculateConnectionQuality(completeStats);
      setQuality(qualityMetrics);
      
      previousStats.current = completeStats;
    } catch (error) {
      console.error('❌ [ConnectionQualityMonitor] Failed to collect stats:', error);
    }
  }, [peerConnection, calculateConnectionQuality]);

  const startMonitoring = useCallback(() => {
    if (!enabled || !peerConnection || isMonitoring) return;

    console.log('📊 [ConnectionQualityMonitor] Starting monitoring...');
    setIsMonitoring(true);
    
    intervalRef.current = setInterval(collectStats, interval);
  }, [enabled, peerConnection, isMonitoring, collectStats, interval]);

  const stopMonitoring = useCallback(() => {
    console.log('🛑 [ConnectionQualityMonitor] Stopping monitoring');
    setIsMonitoring(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Auto start/stop monitoring based on peer connection state
  useEffect(() => {
    if (enabled && peerConnection && peerConnection.connectionState === 'connected') {
      startMonitoring();
    } else {
      stopMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [enabled, peerConnection?.connectionState, startMonitoring, stopMonitoring]);

  const getQualityColor = useCallback((quality: ConnectionQuality) => {
    switch (quality) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-orange-600';
      case 'disconnected': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }, []);

  const getQualityIcon = useCallback((quality: ConnectionQuality) => {
    switch (quality) {
      case 'excellent': return '🟢';
      case 'good': return '🔵';
      case 'fair': return '🟡';
      case 'poor': return '🟠';
      case 'disconnected': return '🔴';
      default: return '⚪';
    }
  }, []);

  return {
    // Raw stats
    stats,
    
    // Quality metrics
    quality,
    
    // Control
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    
    // Utilities
    getQualityColor,
    getQualityIcon,
    
    // Manual collection
    collectStats
  };
}