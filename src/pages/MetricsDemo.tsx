
import React, { useEffect, useState } from 'react';
import { usePeerConnection } from '@/hooks/video-conference/use-peer-connection';
import MetricsContainer from '@/components/video-conference/MetricsContainer';
import ConnectionMetricsDisplay from '@/components/video-conference/ConnectionMetricsDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { convertStandardMetricsToHistory } from '@/hooks/webrtc/utils/metrics-adapter';
import { ConnectionMetrics } from '@/hooks/webrtc/types/connection-metrics';
import { ConnectionMetricsWithHistory } from '@/hooks/webrtc/types/history-metrics';

const MetricsDemo: React.FC = () => {
  const { peerConnection, setupPeerConnection } = usePeerConnection();
  const [mockStandardMetrics, setMockStandardMetrics] = useState<ConnectionMetrics>({
    roundTripTime: 120,
    packetLoss: 0.5,
    jitter: 15,
    bitrateSent: 1200000,
    bitrateReceived: 900000,
    frameWidth: 1280,
    frameHeight: 720,
    framesPerSecond: 25,
    audioLevel: 0.75,
    qualityScore: 85
  });
  
  const [mockHistoryMetrics, setMockHistoryMetrics] = useState<ConnectionMetricsWithHistory>(
    convertStandardMetricsToHistory(mockStandardMetrics)
  );
  
  // Initialize peer connection on component mount
  useEffect(() => {
    setupPeerConnection();
    
    // Simulate changing metrics over time
    const intervalId = setInterval(() => {
      setMockStandardMetrics(prev => ({
        ...prev,
        roundTripTime: Math.max(50, Math.min(300, prev.roundTripTime! + (Math.random() - 0.5) * 30)),
        packetLoss: Math.max(0, Math.min(5, prev.packetLoss! + (Math.random() - 0.5) * 0.5)),
        bitrateSent: Math.max(500000, Math.min(2000000, prev.bitrateSent! + (Math.random() - 0.5) * 100000)),
        qualityScore: Math.max(50, Math.min(100, prev.qualityScore + (Math.random() - 0.5) * 5))
      }));
      
      setMockHistoryMetrics(prev => ({
        ...prev,
        timestamp: Date.now(),
        roundTripTime: Math.max(50, Math.min(300, prev.roundTripTime + (Math.random() - 0.5) * 30)),
        packetLoss: Math.max(0, Math.min(0.05, prev.packetLoss + (Math.random() - 0.5) * 0.005)),
        bandwidth: {
          ...prev.bandwidth,
          send: Math.max(500, Math.min(2000, prev.bandwidth.send + (Math.random() - 0.5) * 100)),
          receive: Math.max(400, Math.min(1500, prev.bandwidth.receive + (Math.random() - 0.5) * 80))
        },
        iceState: Math.random() > 0.95 ? "checking" : "connected"
      }));
    }, 2000);
    
    return () => clearInterval(intervalId);
  }, [setupPeerConnection]);
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Connection Metrics Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Live metrics from WebRTC */}
        <Card>
          <CardHeader>
            <CardTitle>Live WebRTC Metrics</CardTitle>
            <CardDescription>Real-time metrics from WebRTC connection</CardDescription>
          </CardHeader>
          <CardContent>
            <MetricsContainer peerConnection={peerConnection} />
          </CardContent>
        </Card>
        
        {/* Mock Standard Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Mock Standard Metrics</CardTitle>
            <CardDescription>
              Uses the ConnectionMetrics format from useConnectionMetrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ConnectionMetricsDisplay metrics={mockStandardMetrics} />
          </CardContent>
        </Card>
        
        {/* Mock History Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Mock History Metrics</CardTitle>
            <CardDescription>
              Uses the ConnectionMetricsWithHistory format from useConnectionMetricsWithHistory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ConnectionMetricsDisplay metrics={mockHistoryMetrics} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MetricsDemo;
