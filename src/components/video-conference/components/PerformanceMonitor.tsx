import React, { useState, useEffect } from 'react';
import { Activity, Cpu, Wifi, HardDrive } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface PerformanceMetrics {
  cpu: number;
  memory: number;
  bandwidth: {
    upload: number;
    download: number;
  };
  frameRate: number;
  packetLoss: number;
  latency: number;
}

interface PerformanceMonitorProps {
  peerConnection?: RTCPeerConnection;
  isVisible?: boolean;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  peerConnection,
  isVisible = false
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cpu: 0,
    memory: 0,
    bandwidth: { upload: 0, download: 0 },
    frameRate: 0,
    packetLoss: 0,
    latency: 0
  });

  const [overallHealth, setOverallHealth] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');

  useEffect(() => {
    if (!isVisible) return;

    const updateMetrics = async () => {
      try {
        // Get performance metrics
        const cpuUsage = await getCPUUsage();
        const memoryUsage = await getMemoryUsage();
        const bandwidthStats = await getBandwidthStats(peerConnection);
        const webrtcStats = await getWebRTCStats(peerConnection);

        const newMetrics = {
          cpu: cpuUsage,
          memory: memoryUsage,
          bandwidth: bandwidthStats,
          frameRate: webrtcStats.frameRate,
          packetLoss: webrtcStats.packetLoss,
          latency: webrtcStats.latency
        };

        setMetrics(newMetrics);
        setOverallHealth(calculateOverallHealth(newMetrics));
      } catch (error) {
        console.warn('Performance monitoring error:', error);
      }
    };

    const interval = setInterval(updateMetrics, 2000);
    updateMetrics(); // Initial call

    return () => clearInterval(interval);
  }, [peerConnection, isVisible]);

  if (!isVisible) return null;

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'fair': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getMetricStatus = (value: number, thresholds: [number, number, number]) => {
    if (value < thresholds[0]) return 'excellent';
    if (value < thresholds[1]) return 'good';
    if (value < thresholds[2]) return 'fair';
    return 'poor';
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Performance Monitor
          <Badge variant="outline" className={getHealthColor(overallHealth)}>
            {overallHealth}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* CPU Usage */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1">
              <Cpu className="h-3 w-3" />
              CPU
            </span>
            <span>{metrics.cpu.toFixed(1)}%</span>
          </div>
          <Progress 
            value={metrics.cpu} 
            className={`h-1 ${getHealthColor(getMetricStatus(metrics.cpu, [50, 70, 85]))}`}
          />
        </div>

        {/* Memory Usage */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1">
              <HardDrive className="h-3 w-3" />
              Memory
            </span>
            <span>{metrics.memory.toFixed(1)}%</span>
          </div>
          <Progress 
            value={metrics.memory} 
            className={`h-1 ${getHealthColor(getMetricStatus(metrics.memory, [60, 80, 90]))}`}
          />
        </div>

        {/* Bandwidth */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              Bandwidth
            </span>
            <span>{formatBandwidth(metrics.bandwidth.upload + metrics.bandwidth.download)}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>↑ {formatBandwidth(metrics.bandwidth.upload)}</div>
            <div>↓ {formatBandwidth(metrics.bandwidth.download)}</div>
          </div>
        </div>

        {/* WebRTC Stats */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="font-medium">{metrics.frameRate}</div>
            <div className="text-muted-foreground">FPS</div>
          </div>
          <div className="text-center">
            <div className="font-medium">{metrics.packetLoss.toFixed(1)}%</div>
            <div className="text-muted-foreground">Loss</div>
          </div>
          <div className="text-center">
            <div className="font-medium">{metrics.latency}ms</div>
            <div className="text-muted-foreground">Latency</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper functions
async function getCPUUsage(): Promise<number> {
  // Approximate CPU usage based on performance API
  if ('performance' in window && 'memory' in performance) {
    const memory = (performance as any).memory;
    return Math.min(100, (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100);
  }
  return 0;
}

async function getMemoryUsage(): Promise<number> {
  if ('performance' in window && 'memory' in performance) {
    const memory = (performance as any).memory;
    return (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
  }
  return 0;
}

async function getBandwidthStats(peerConnection?: RTCPeerConnection) {
  if (!peerConnection) return { upload: 0, download: 0 };
  
  try {
    const stats = await peerConnection.getStats();
    let upload = 0, download = 0;
    
    stats.forEach(report => {
      if (report.type === 'outbound-rtp') {
        upload += report.bytesSent || 0;
      } else if (report.type === 'inbound-rtp') {
        download += report.bytesReceived || 0;
      }
    });
    
    return { upload, download };
  } catch {
    return { upload: 0, download: 0 };
  }
}

async function getWebRTCStats(peerConnection?: RTCPeerConnection) {
  if (!peerConnection) return { frameRate: 0, packetLoss: 0, latency: 0 };
  
  try {
    const stats = await peerConnection.getStats();
    let frameRate = 0, packetLoss = 0, latency = 0;
    
    stats.forEach(report => {
      if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
        frameRate = report.framesPerSecond || 0;
        packetLoss = ((report.packetsLost || 0) / (report.packetsReceived || 1)) * 100;
      }
      if (report.type === 'candidate-pair' && report.state === 'succeeded') {
        latency = report.currentRoundTripTime || 0;
      }
    });
    
    return { frameRate, packetLoss, latency: Math.round(latency * 1000) };
  } catch {
    return { frameRate: 0, packetLoss: 0, latency: 0 };
  }
}

function calculateOverallHealth(metrics: PerformanceMetrics): 'excellent' | 'good' | 'fair' | 'poor' {
  const scores = [
    metrics.cpu < 50 ? 4 : metrics.cpu < 70 ? 3 : metrics.cpu < 85 ? 2 : 1,
    metrics.memory < 60 ? 4 : metrics.memory < 80 ? 3 : metrics.memory < 90 ? 2 : 1,
    metrics.packetLoss < 1 ? 4 : metrics.packetLoss < 3 ? 3 : metrics.packetLoss < 5 ? 2 : 1,
    metrics.latency < 100 ? 4 : metrics.latency < 200 ? 3 : metrics.latency < 300 ? 2 : 1
  ];
  
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  
  if (avgScore >= 3.5) return 'excellent';
  if (avgScore >= 2.5) return 'good';
  if (avgScore >= 1.5) return 'fair';
  return 'poor';
}

function formatBandwidth(bytes: number): string {
  if (bytes < 1024) return `${bytes} B/s`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB/s`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB/s`;
}