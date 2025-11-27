
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ConnectionMetrics } from "@/hooks/webrtc/useConnectionMetrics";
import { ConnectionMetricsWithHistory } from "@/hooks/webrtc/useConnectionMetricsWithHistory";

interface ConnectionMetricsDisplayProps {
  metrics: ConnectionMetrics | ConnectionMetricsWithHistory;
  isMinimized?: boolean;
  showHistory?: boolean;
  historyTimeframe?: number; // in seconds
}

// Type guard to determine which metrics type we're working with
const isConnectionMetricsWithHistory = (
  metrics: ConnectionMetrics | ConnectionMetricsWithHistory
): metrics is ConnectionMetricsWithHistory => {
  return 'timestamp' in metrics && 'bandwidth' in metrics;
};

const ConnectionMetricsDisplay: React.FC<ConnectionMetricsDisplayProps> = ({ 
  metrics, 
  isMinimized = false,
  showHistory = false,
  historyTimeframe = 60 // Default 1 minute
}) => {
  // Helper to get color based on score or connection quality
  const getQualityColor = (metrics: ConnectionMetrics | ConnectionMetricsWithHistory) => {
    if (isConnectionMetricsWithHistory(metrics)) {
      // For history metrics, use ICE connection state
      switch (metrics.iceState) {
        case "connected":
        case "completed":
          return "bg-green-500";
        case "checking":
          return "bg-yellow-500";
        default:
          return "bg-red-500";
      }
    } else {
      // For regular metrics, use quality score
      if (metrics.qualityScore >= 80) return "bg-green-500";
      if (metrics.qualityScore >= 50) return "bg-yellow-500";
      return "bg-red-500";
    }
  };
  
  // Helper to format bitrate
  const formatBitrate = (bitrate: number | null | undefined) => {
    if (bitrate === null || bitrate === undefined) return "N/A";
    
    if (bitrate >= 1000000) {
      return `${(bitrate / 1000000).toFixed(1)} Mbps`;
    }
    
    return `${(bitrate / 1000).toFixed(0)} Kbps`;
  };

  // Get relevant metrics values based on type
  const getMetricsValues = () => {
    if (isConnectionMetricsWithHistory(metrics)) {
      return {
        packetLoss: metrics.packetLoss * 100, // Convert from 0-1 to percentage
        roundTripTime: metrics.roundTripTime,
        jitter: metrics.jitter,
        bitrateReceived: metrics.bandwidth.receive * 1000, // Convert from kbps to bps
        bitrateSent: metrics.bandwidth.send * 1000, // Convert from kbps to bps
        frameWidth: metrics.resolution.width,
        frameHeight: metrics.resolution.height,
        framesPerSecond: metrics.frameRate,
        qualityScore: calculateQualityScoreFromHistoryMetrics(metrics)
      };
    } else {
      return {
        packetLoss: metrics.packetLoss,
        roundTripTime: metrics.roundTripTime,
        jitter: metrics.jitter,
        bitrateReceived: metrics.bitrateReceived,
        bitrateSent: metrics.bitrateSent,
        frameWidth: metrics.frameWidth,
        frameHeight: metrics.frameHeight,
        framesPerSecond: metrics.framesPerSecond,
        qualityScore: metrics.qualityScore
      };
    }
  };

  // Calculate a quality score from history metrics
  const calculateQualityScoreFromHistoryMetrics = (metrics: ConnectionMetricsWithHistory): number => {
    let score = 100;
    
    // Reduce score based on packet loss (0-1 scale)
    if (metrics.packetLoss > 0.01) score -= 10; // More than 1%
    if (metrics.packetLoss > 0.05) score -= 15; // More than 5%
    if (metrics.packetLoss > 0.1) score -= 25;  // More than 10%
    
    // Reduce score based on RTT
    if (metrics.roundTripTime > 100) score -= 5;  // More than 100ms
    if (metrics.roundTripTime > 200) score -= 10; // More than 200ms
    if (metrics.roundTripTime > 300) score -= 20; // More than 300ms
    
    // Reduce score based on jitter
    if (metrics.jitter > 30) score -= 5;  // More than 30ms
    if (metrics.jitter > 50) score -= 10; // More than 50ms
    
    // Reduce score based on resolution
    if (metrics.resolution.width < 640 || metrics.resolution.height < 480) score -= 10;
    
    // Reduce score based on frame rate
    if (metrics.frameRate < 20) score -= 10;
    if (metrics.frameRate < 15) score -= 15;
    if (metrics.frameRate < 10) score -= 25;
    
    // Reduce score based on bandwidth
    if (metrics.bandwidth.send < 500) score -= 10; // Less than 500 kbps
    if (metrics.bandwidth.receive < 500) score -= 10; // Less than 500 kbps
    
    // Adjust score based on ICE state
    if (metrics.iceState !== "connected" && metrics.iceState !== "completed") {
      score -= 30;
    }
    
    return Math.max(0, Math.min(100, score));
  };
  
  const values = getMetricsValues();
  
  if (isMinimized) {
    // Minimized view - just show quality indicator
    return (
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${getQualityColor(metrics)}`} />
        <span className="text-sm font-medium">
          {values.qualityScore >= 80 ? "Excellent" : 
           values.qualityScore >= 50 ? "Good" : "Poor"}
        </span>
      </div>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader className="py-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${getQualityColor(metrics)}`} />
          Connection Quality
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Quality Score</span>
            <span className="font-medium">{values.qualityScore}%</span>
          </div>
          <Progress value={values.qualityScore} className="h-2" />
        </div>
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Latency</span>
            <span>{values.roundTripTime !== null && values.roundTripTime !== undefined 
              ? `${Math.round(values.roundTripTime)}ms` 
              : 'N/A'}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Packet Loss</span>
            <span>{values.packetLoss !== null && values.packetLoss !== undefined 
              ? `${values.packetLoss.toFixed(1)}%` 
              : 'N/A'}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Download</span>
            <span>{formatBitrate(values.bitrateReceived)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Upload</span>
            <span>{formatBitrate(values.bitrateSent)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Resolution</span>
            <span>
              {values.frameWidth && values.frameHeight 
                ? `${values.frameWidth}x${values.frameHeight}` 
                : 'N/A'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Framerate</span>
            <span>{values.framesPerSecond 
              ? `${Math.round(values.framesPerSecond)} fps` 
              : 'N/A'}</span>
          </div>
          
          {isConnectionMetricsWithHistory(metrics) && (
            <div className="flex justify-between col-span-2">
              <span className="text-muted-foreground">ICE State</span>
              <span className="capitalize">{metrics.iceState}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionMetricsDisplay;
