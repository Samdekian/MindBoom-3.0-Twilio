import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ConnectionMetrics {
  rtt: number;
  packetsLost: number;
  packetsSent: number;
  packetsReceived: number;
  bytesReceived: number;
  bytesSent: number;
  jitter: number;
  bandwidth: number;
  timestamp: number;
}

export interface ConnectionQuality {
  level: 'excellent' | 'good' | 'fair' | 'poor' | 'disconnected';
  score: number;
  issues: string[];
}

export interface SessionAnalytics {
  sessionId: string;
  duration: number;
  averageQuality: number;
  disconnectionCount: number;
  reconnectionCount: number;
  participantCount: number;
  totalBytes: number;
}

export const useEnhancedConnectionMetrics = (
  peerConnection: RTCPeerConnection | null,
  sessionId?: string
) => {
  const [metrics, setMetrics] = useState<ConnectionMetrics | null>(null);
  const [quality, setQuality] = useState<ConnectionQuality>({
    level: 'disconnected',
    score: 0,
    issues: []
  });
  const [metricsHistory, setMetricsHistory] = useState<ConnectionMetrics[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const calculateQuality = useCallback((metrics: ConnectionMetrics): ConnectionQuality => {
    let score = 100;
    const issues: string[] = [];

    // RTT scoring (0-100ms excellent, 100-300ms good, 300-800ms fair, >800ms poor)
    if (metrics.rtt > 800) {
      score -= 30;
      issues.push('High latency detected');
    } else if (metrics.rtt > 300) {
      score -= 15;
      issues.push('Moderate latency');
    } else if (metrics.rtt > 100) {
      score -= 5;
    }

    // Packet loss scoring (0% excellent, 0-2% good, 2-5% fair, >5% poor)
    const packetLossRate = metrics.packetsLost / (metrics.packetsSent || 1) * 100;
    if (packetLossRate > 5) {
      score -= 25;
      issues.push('High packet loss');
    } else if (packetLossRate > 2) {
      score -= 10;
      issues.push('Moderate packet loss');
    } else if (packetLossRate > 0.5) {
      score -= 5;
    }

    // Jitter scoring (0-30ms excellent, 30-100ms good, 100-200ms fair, >200ms poor)
    if (metrics.jitter > 200) {
      score -= 20;
      issues.push('High jitter detected');
    } else if (metrics.jitter > 100) {
      score -= 10;
      issues.push('Moderate jitter');
    } else if (metrics.jitter > 30) {
      score -= 5;
    }

    // Bandwidth scoring (>1Mbps excellent, 500k-1Mbps good, 100k-500k fair, <100k poor)
    if (metrics.bandwidth < 100000) {
      score -= 30;
      issues.push('Low bandwidth');
    } else if (metrics.bandwidth < 500000) {
      score -= 15;
      issues.push('Limited bandwidth');
    } else if (metrics.bandwidth < 1000000) {
      score -= 5;
    }

    // Determine level based on score
    let level: ConnectionQuality['level'];
    if (score >= 90) level = 'excellent';
    else if (score >= 70) level = 'good';
    else if (score >= 50) level = 'fair';
    else if (score >= 20) level = 'poor';
    else level = 'disconnected';

    return { level, score: Math.max(0, score), issues };
  }, []);

  const recordMetrics = useCallback(async () => {
    if (!peerConnection || peerConnection.connectionState !== 'connected') {
      setQuality({ level: 'disconnected', score: 0, issues: ['Not connected'] });
      return;
    }

    try {
      const stats = await peerConnection.getStats();
      let inboundRtp: RTCInboundRtpStreamStats | null = null;
      let outboundRtp: RTCOutboundRtpStreamStats | null = null;
      let candidatePair: RTCIceCandidatePairStats | null = null;

      stats.forEach((report) => {
        if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
          inboundRtp = report as RTCInboundRtpStreamStats;
        } else if (report.type === 'outbound-rtp' && report.mediaType === 'video') {
          outboundRtp = report as RTCOutboundRtpStreamStats;
        } else if (report.type === 'candidate-pair' && report.state === 'succeeded') {
          candidatePair = report as RTCIceCandidatePairStats;
        }
      });

      if (candidatePair || inboundRtp || outboundRtp) {
        const newMetrics: ConnectionMetrics = {
          rtt: candidatePair?.currentRoundTripTime ? candidatePair.currentRoundTripTime * 1000 : 0,
          packetsLost: inboundRtp?.packetsLost || 0,
          packetsSent: outboundRtp?.packetsSent || 0,
          packetsReceived: inboundRtp?.packetsReceived || 0,
          bytesReceived: inboundRtp?.bytesReceived || 0,
          bytesSent: outboundRtp?.bytesSent || 0,
          jitter: inboundRtp?.jitter ? inboundRtp.jitter * 1000 : 0,
          bandwidth: candidatePair?.availableOutgoingBitrate || 0,
          timestamp: Date.now()
        };

        setMetrics(newMetrics);
        setMetricsHistory(prev => [...prev.slice(-119), newMetrics]); // Keep last 2 minutes
        
        const newQuality = calculateQuality(newMetrics);
        setQuality(newQuality);

        // Log to database if session is being tracked
        if (sessionId && isRecording) {
          await supabase.from('session_connection_logs').insert({
            session_id: sessionId,
            connection_state: 'connected',
            rtt_ms: newMetrics.rtt,
            packet_loss_rate: newMetrics.packetsLost / (newMetrics.packetsSent || 1),
            jitter_ms: newMetrics.jitter,
            bandwidth_kbps: Math.round(newMetrics.bandwidth / 1000),
            quality_score: newQuality.score,
            quality_level: newQuality.level,
            metadata: {
              issues: newQuality.issues,
              bytesReceived: newMetrics.bytesReceived,
              bytesSent: newMetrics.bytesSent
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to collect connection metrics:', error);
      setQuality({ level: 'poor', score: 10, issues: ['Metrics collection failed'] });
    }
  }, [peerConnection, sessionId, isRecording, calculateQuality]);

  const startRecording = useCallback(() => {
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback(async () => {
    setIsRecording(false);
    
    // Generate session analytics summary
    if (sessionId && metricsHistory.length > 0) {
      const avgQuality = metricsHistory.reduce((sum, m) => {
        const q = calculateQuality(m);
        return sum + q.score;
      }, 0) / metricsHistory.length;

      const totalBytes = metricsHistory[metricsHistory.length - 1]?.bytesReceived + 
                        metricsHistory[metricsHistory.length - 1]?.bytesSent || 0;

      const analytics: Partial<SessionAnalytics> = {
        sessionId,
        duration: metricsHistory.length > 0 ? 
          (metricsHistory[metricsHistory.length - 1].timestamp - metricsHistory[0].timestamp) / 1000 : 0,
        averageQuality: Math.round(avgQuality),
        totalBytes
      };

      try {
        await supabase.rpc('update_session_analytics_data', { p_session_id: sessionId });
      } catch (error) {
        console.error('Failed to update session analytics:', error);
      }
    }
  }, [sessionId, metricsHistory, calculateQuality]);

  useEffect(() => {
    if (!peerConnection) return;

    const interval = setInterval(recordMetrics, 1000); // Collect metrics every second
    return () => clearInterval(interval);
  }, [recordMetrics]);

  return {
    metrics,
    quality,
    metricsHistory,
    isRecording,
    startRecording,
    stopRecording,
    refresh: recordMetrics
  };
};