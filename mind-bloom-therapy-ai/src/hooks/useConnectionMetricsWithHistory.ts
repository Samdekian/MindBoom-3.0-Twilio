
import { useState, useEffect, useCallback } from 'react';

export interface ConnectionMetrics {
  packetLoss: number;
  roundTripTime: number | null;
  bitrate: number;
  jitter: number | null;
  audioLevel?: number;
  frameRate?: number;
  frameWidth?: number;
  frameHeight?: number;
  timestamp: number;
}

export const useConnectionMetricsWithHistory = (
  peerConnection: RTCPeerConnection | null,
  maxHistoryLength: number = 10
) => {
  const [currentMetrics, setCurrentMetrics] = useState<ConnectionMetrics>({
    packetLoss: 0,
    roundTripTime: null,
    bitrate: 0,
    jitter: null,
    timestamp: Date.now()
  });
  
  const [metricsHistory, setMetricsHistory] = useState<ConnectionMetrics[]>([]);
  const [previousStats, setPreviousStats] = useState<Record<string, any>>({});
  
  // Function to collect metrics from WebRTC connection
  const collectMetrics = useCallback(async () => {
    if (!peerConnection) return;
    
    try {
      const stats = await peerConnection.getStats();
      
      let packetLoss = 0;
      let roundTripTime: number | null = null;
      let bitrate = 0;
      let jitter: number | null = null;
      let audioLevel: number | undefined;
      let frameRate: number | undefined;
      let frameWidth: number | undefined;
      let frameHeight: number | undefined;
      
      // Process stats report
      stats.forEach((report) => {
        // Outbound RTP stats (sending data)
        if (report.type === 'outbound-rtp' && report.kind === 'video') {
          const now = Date.now(); // Use Date.now() instead of report.timestamp
          const prev = previousStats[report.id];
          
          if (prev && 'bytesSent' in report && 'bytesSent' in prev) {
            // Calculate bitrate
            const bytesSent = report.bytesSent as number;
            const prevBytesSent = prev.bytesSent as number;
            
            const bytesIncrement = bytesSent - prevBytesSent;
            const timeElapsed = now - (prev.timestamp || 0);
            
            if (timeElapsed > 0) {
              bitrate = (bytesIncrement * 8) / (timeElapsed / 1000); // bits per second
            }
          }
          
          if ('framesPerSecond' in report) {
            frameRate = report.framesPerSecond as number;
          }
          
          if ('frameWidth' in report) {
            frameWidth = report.frameWidth as number;
          }
          
          if ('frameHeight' in report) {
            frameHeight = report.frameHeight as number;
          }
        }
        
        // Inbound RTP stats (receiving data)
        if (report.type === 'inbound-rtp') {
          if ('packetsLost' in report && 'packetsReceived' in report) {
            const packetsLost = report.packetsLost as number;
            const packetsReceived = report.packetsReceived as number;
            
            if (packetsReceived > 0) {
              packetLoss = (packetsLost / (packetsReceived + packetsLost)) * 100;
            }
          }
          
          if ('jitter' in report) {
            jitter = report.jitter as number;
          }
        }
        
        // Round trip time
        if (report.type === 'remote-inbound-rtp') {
          if ('roundTripTime' in report) {
            roundTripTime = report.roundTripTime as number;
          }
        }
        
        // Audio levels
        if (report.type === 'media-source' && report.kind === 'audio') {
          if ('audioLevel' in report) {
            audioLevel = report.audioLevel as number;
          }
        }
      });
      
      // Create new metrics object
      const newMetrics: ConnectionMetrics = {
        packetLoss,
        roundTripTime,
        bitrate,
        jitter,
        audioLevel,
        frameRate,
        frameWidth,
        frameHeight,
        timestamp: Date.now()
      };
      
      // Update current metrics
      setCurrentMetrics(newMetrics);
      
      // Update metrics history
      setMetricsHistory(prev => {
        const updated = [...prev, newMetrics];
        return updated.slice(-maxHistoryLength); // Keep only the latest 'maxHistoryLength' items
      });
      
      // Save stats for next comparison
      const newPreviousStats: Record<string, any> = {};
      stats.forEach((report) => {
        newPreviousStats[report.id] = {
          ...report,
          timestamp: Date.now() // Manually add timestamp to each saved report
        };
      });
      setPreviousStats(newPreviousStats);
      
    } catch (error) {
      console.error('Error collecting connection metrics:', error);
    }
  }, [peerConnection, previousStats, maxHistoryLength]);
  
  // Calculate average metrics from history
  const getAverageMetrics = useCallback(() => {
    if (metricsHistory.length === 0) return null;
    
    const sum = metricsHistory.reduce((acc, metrics) => ({
      packetLoss: acc.packetLoss + metrics.packetLoss,
      roundTripTime: (acc.roundTripTime || 0) + (metrics.roundTripTime || 0),
      bitrate: acc.bitrate + metrics.bitrate,
      jitter: (acc.jitter || 0) + (metrics.jitter || 0),
      timestamp: 0,
    }), {
      packetLoss: 0,
      roundTripTime: 0,
      bitrate: 0,
      jitter: 0,
      timestamp: 0,
    });
    
    // Filter out items with null values for proper averaging
    const validRoundTripTimeCount = metricsHistory.filter(m => m.roundTripTime !== null).length;
    const validJitterCount = metricsHistory.filter(m => m.jitter !== null).length;
    
    return {
      packetLoss: sum.packetLoss / metricsHistory.length,
      roundTripTime: validRoundTripTimeCount ? sum.roundTripTime / validRoundTripTimeCount : null,
      bitrate: sum.bitrate / metricsHistory.length,
      jitter: validJitterCount ? sum.jitter / validJitterCount : null,
    };
  }, [metricsHistory]);
  
  // Set up periodic metrics collection
  useEffect(() => {
    if (!peerConnection) return;
    
    const intervalId = setInterval(() => {
      collectMetrics();
    }, 2000); // Collect metrics every 2 seconds
    
    // Initial collection
    collectMetrics();
    
    return () => {
      clearInterval(intervalId);
    };
  }, [peerConnection, collectMetrics]);
  
  return {
    currentMetrics,
    metricsHistory,
    getAverageMetrics,
  };
};
