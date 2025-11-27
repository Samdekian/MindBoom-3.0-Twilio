import { useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface ConnectionQualityMetrics {
  rtt: number; // Round trip time
  packetsLost: number;
  packetsSent: number;
  bytesReceived: number;
  bytesSent: number;
  jitter: number;
  bandwidth: number;
  frameRate: number;
  resolution: { width: number; height: number };
}

export interface QualityAssessment {
  overall: 'excellent' | 'good' | 'poor' | 'critical';
  network: 'excellent' | 'good' | 'poor' | 'critical';
  video: 'excellent' | 'good' | 'poor' | 'critical';
  audio: 'excellent' | 'good' | 'poor' | 'critical';
  recommendations: string[];
}

export function useConnectionQualityMonitor(peerConnection: RTCPeerConnection | null) {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<ConnectionQualityMetrics | null>(null);
  const [quality, setQuality] = useState<QualityAssessment>({
    overall: 'good',
    network: 'good',
    video: 'good',
    audio: 'good',
    recommendations: []
  });
  
  const monitoringRef = useRef<number | null>(null);
  const previousStats = useRef<RTCStatsReport | null>(null);

  // Analyze connection quality from metrics
  const assessQuality = useCallback((currentMetrics: ConnectionQualityMetrics): QualityAssessment => {
    const recommendations: string[] = [];
    
    // Network quality assessment
    let networkQuality: QualityAssessment['network'] = 'excellent';
    if (currentMetrics.rtt > 300) {
      networkQuality = 'critical';
      recommendations.push('High latency detected. Check your internet connection.');
    } else if (currentMetrics.rtt > 150) {
      networkQuality = 'poor';
      recommendations.push('Network latency is elevated. Consider switching to a wired connection.');
    } else if (currentMetrics.rtt > 100) {
      networkQuality = 'good';
    }

    // Packet loss assessment
    const packetLossRate = currentMetrics.packetsLost / Math.max(currentMetrics.packetsSent, 1);
    if (packetLossRate > 0.05) {
      networkQuality = Math.min(networkQuality === 'excellent' ? 3 : networkQuality === 'good' ? 2 : networkQuality === 'poor' ? 1 : 0, 0) as any;
      recommendations.push('High packet loss detected. Check your network stability.');
    }

    // Video quality assessment
    let videoQuality: QualityAssessment['video'] = 'excellent';
    if (currentMetrics.frameRate < 15) {
      videoQuality = 'poor';
      recommendations.push('Low frame rate detected. Consider reducing video quality.');
    } else if (currentMetrics.frameRate < 25) {
      videoQuality = 'good';
    }

    // Audio quality assessment
    let audioQuality: QualityAssessment['audio'] = 'excellent';
    if (currentMetrics.jitter > 50) {
      audioQuality = 'poor';
      recommendations.push('Audio jitter detected. Check your network stability.');
    } else if (currentMetrics.jitter > 30) {
      audioQuality = 'good';
    }

    // Overall quality (worst of all components)
    const qualityLevels = { excellent: 3, good: 2, poor: 1, critical: 0 };
    const overallLevel = Math.min(
      qualityLevels[networkQuality],
      qualityLevels[videoQuality],
      qualityLevels[audioQuality]
    );
    const overall = Object.keys(qualityLevels)[Object.values(qualityLevels).indexOf(overallLevel)] as QualityAssessment['overall'];

    return {
      overall,
      network: networkQuality,
      video: videoQuality,
      audio: audioQuality,
      recommendations
    };
  }, []);

  // Parse WebRTC stats into our metrics format
  const parseStats = useCallback((stats: RTCStatsReport): ConnectionQualityMetrics | null => {
    let rtt = 0;
    let packetsLost = 0;
    let packetsSent = 0;
    let bytesReceived = 0;
    let bytesSent = 0;
    let jitter = 0;
    let frameRate = 0;
    let resolution = { width: 0, height: 0 };

    for (const [, stat] of stats) {
      if (stat.type === 'candidate-pair' && stat.state === 'succeeded') {
        rtt = stat.currentRoundTripTime * 1000 || 0;
      } else if (stat.type === 'inbound-rtp' && stat.kind === 'video') {
        packetsLost += stat.packetsLost || 0;
        bytesReceived += stat.bytesReceived || 0;
        jitter = stat.jitter || 0;
        frameRate = stat.framesPerSecond || 0;
        resolution.width = stat.frameWidth || 0;
        resolution.height = stat.frameHeight || 0;
      } else if (stat.type === 'outbound-rtp') {
        packetsSent += stat.packetsSent || 0;
        bytesSent += stat.bytesSent || 0;
      }
    }

    // Calculate bandwidth (simplified)
    const bandwidth = previousStats.current ? 
      (bytesReceived + bytesSent) * 8 / 1000 : 0; // kbps

    return {
      rtt,
      packetsLost,
      packetsSent,
      bytesReceived,
      bytesSent,
      jitter,
      bandwidth,
      frameRate,
      resolution
    };
  }, []);

  // Monitor connection quality
  const startMonitoring = useCallback(() => {
    if (!peerConnection || monitoringRef.current) return;

    const monitor = async () => {
      try {
        const stats = await peerConnection.getStats();
        const currentMetrics = parseStats(stats);
        
        if (currentMetrics) {
          setMetrics(currentMetrics);
          const qualityAssessment = assessQuality(currentMetrics);
          setQuality(qualityAssessment);
          
          // Show critical quality warnings
          if (qualityAssessment.overall === 'critical') {
            toast({
              title: "Connection Quality Critical",
              description: qualityAssessment.recommendations[0] || "Poor connection detected",
              variant: "destructive"
            });
          }
        }
        
        previousStats.current = stats;
      } catch (error) {
        console.error('Error monitoring connection quality:', error);
      }
    };

    // Monitor every 2 seconds
    monitoringRef.current = window.setInterval(monitor, 2000);
    monitor(); // Initial check
  }, [peerConnection, parseStats, assessQuality, toast]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    if (monitoringRef.current) {
      clearInterval(monitoringRef.current);
      monitoringRef.current = null;
    }
  }, []);

  // Auto-start/stop monitoring based on peer connection
  useEffect(() => {
    if (peerConnection && peerConnection.connectionState === 'connected') {
      startMonitoring();
    } else {
      stopMonitoring();
    }

    return stopMonitoring;
  }, [peerConnection, startMonitoring, stopMonitoring]);

  // Quality optimization suggestions
  const getOptimizationSuggestions = useCallback(() => {
    if (!metrics || !quality) return [];

    const suggestions: string[] = [];

    if (quality.network === 'poor' || quality.network === 'critical') {
      suggestions.push('Switch to a wired connection if possible');
      suggestions.push('Close other bandwidth-intensive applications');
      suggestions.push('Move closer to your WiFi router');
    }

    if (quality.video === 'poor') {
      suggestions.push('Reduce video quality to improve performance');
      suggestions.push('Turn off video if not essential');
    }

    if (metrics.frameRate < 20) {
      suggestions.push('Close other applications to free up system resources');
    }

    return suggestions;
  }, [metrics, quality]);

  return {
    metrics,
    quality,
    isMonitoring: monitoringRef.current !== null,
    startMonitoring,
    stopMonitoring,
    getOptimizationSuggestions
  };
}