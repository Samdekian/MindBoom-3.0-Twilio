import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Monitor, Pause, Play, Download } from 'lucide-react';
import { useEnhancedConnectionMetrics } from '@/hooks/webrtc/useEnhancedConnectionMetrics';
import { ConnectionQualityBadge } from './ConnectionQualityBadge';
// ProductionHealthMonitor removed to eliminate console spam

interface VideoSessionMonitorProps {
  peerConnection: RTCPeerConnection | null;
  sessionId?: string;
  isSessionActive?: boolean;
}

export const VideoSessionMonitor: React.FC<VideoSessionMonitorProps> = ({
  peerConnection,
  sessionId,
  isSessionActive = false
}) => {
  const {
    metrics,
    quality,
    metricsHistory,
    isRecording,
    startRecording,
    stopRecording,
    refresh
  } = useEnhancedConnectionMetrics(peerConnection, sessionId);

  const [showDetailedView, setShowDetailedView] = useState(false);

  useEffect(() => {
    if (isSessionActive && !isRecording) {
      startRecording();
    } else if (!isSessionActive && isRecording) {
      stopRecording();
    }
  }, [isSessionActive, isRecording, startRecording, stopRecording]);

  const exportMetrics = () => {
    if (metricsHistory.length === 0) return;

    const csvContent = [
      'timestamp,rtt_ms,packets_lost,jitter_ms,bandwidth_bps,quality_score',
      ...metricsHistory.map(m => {
        const q = calculateQuality(m);
        return `${new Date(m.timestamp).toISOString()},${m.rtt},${m.packetsLost},${m.jitter},${m.bandwidth},${q.score}`;
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `session-metrics-${sessionId || 'unknown'}-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const calculateQuality = (metrics: any) => {
    let score = 100;
    const issues: string[] = [];

    if (metrics.rtt > 800) {
      score -= 30;
      issues.push('High latency');
    } else if (metrics.rtt > 300) {
      score -= 15;
    }

    const packetLossRate = metrics.packetsLost / (metrics.packetsSent || 1) * 100;
    if (packetLossRate > 5) {
      score -= 25;
      issues.push('High packet loss');
    }

    return { score: Math.max(0, score), issues };
  };

  return (
    <div className="space-y-4">
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Session Monitor
              {isRecording && (
                <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                  Recording
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {metricsHistory.length > 0 && (
                <Button variant="ghost" size="sm" onClick={exportMetrics}>
                  <Download className="h-3 w-3" />
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowDetailedView(!showDetailedView)}
              >
                {showDetailedView ? 'Simple' : 'Detailed'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {peerConnection && metrics && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Connection Quality</span>
              <ConnectionQualityBadge
                quality={quality.level}
                score={quality.score}
                issues={quality.issues}
                rtt={metrics.rtt}
                packetLoss={metrics.packetsLost / (metrics.packetsSent || 1)}
                showDetails={showDetailedView}
              />
            </div>
          )}

          {showDetailedView && metrics && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Latency (RTT)</span>
                <span className={metrics.rtt > 300 ? 'text-amber-600' : 'text-green-600'}>
                  {Math.round(metrics.rtt)}ms
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Jitter</span>
                <span className={metrics.jitter > 100 ? 'text-amber-600' : 'text-green-600'}>
                  {Math.round(metrics.jitter)}ms
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Bandwidth</span>
                <span className={metrics.bandwidth < 500000 ? 'text-amber-600' : 'text-green-600'}>
                  {(metrics.bandwidth / 1000000).toFixed(1)}Mbps
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Packets Lost</span>
                <span className={metrics.packetsLost > 0 ? 'text-amber-600' : 'text-green-600'}>
                  {metrics.packetsLost}
                </span>
              </div>
            </div>
          )}

          {!peerConnection && (
            <div className="text-xs text-muted-foreground text-center py-2">
              No active connection
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!peerConnection}
              className="text-xs"
            >
              {isRecording ? (
                <>
                  <Pause className="h-3 w-3 mr-1" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 mr-1" />
                  Start Recording
                </>
              )}
            </Button>
            
            <Button variant="ghost" size="sm" onClick={refresh} className="text-xs">
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ProductionHealthMonitor removed to eliminate console spam */}
    </div>
  );
};