
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ConnectionMetrics as MetricsType } from "@/hooks/webrtc/useConnectionMetrics";

interface ConnectionMetricsProps {
  metrics: MetricsType;
  isMinimized?: boolean;
}

const ConnectionMetrics: React.FC<ConnectionMetricsProps> = ({ 
  metrics, 
  isMinimized = false 
}) => {
  // Helper to get color based on score
  const getQualityColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  // Helper to format bitrate
  const formatBitrate = (bitrate: number | null) => {
    if (bitrate === null) return "N/A";
    
    if (bitrate >= 1000000) {
      return `${(bitrate / 1000000).toFixed(1)} Mbps`;
    }
    
    return `${(bitrate / 1000).toFixed(0)} Kbps`;
  };
  
  if (isMinimized) {
    // Minimized view - just show quality score
    return (
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${getQualityColor(metrics.qualityScore)}`} />
        <span className="text-sm font-medium">
          {metrics.qualityScore >= 80 ? "Excellent" : 
           metrics.qualityScore >= 50 ? "Good" : "Poor"}
        </span>
      </div>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader className="py-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${getQualityColor(metrics.qualityScore)}`} />
          Connection Quality
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Quality Score</span>
            <span className="font-medium">{metrics.qualityScore}%</span>
          </div>
          <Progress value={metrics.qualityScore} className="h-2" />
        </div>
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Latency</span>
            <span>{metrics.roundTripTime !== null ? `${Math.round(metrics.roundTripTime)}ms` : 'N/A'}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Packet Loss</span>
            <span>{metrics.packetLoss !== null ? `${metrics.packetLoss.toFixed(1)}%` : 'N/A'}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Download</span>
            <span>{formatBitrate(metrics.bitrateReceived)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Upload</span>
            <span>{formatBitrate(metrics.bitrateSent)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Resolution</span>
            <span>
              {metrics.frameWidth && metrics.frameHeight 
                ? `${metrics.frameWidth}x${metrics.frameHeight}` 
                : 'N/A'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Framerate</span>
            <span>{metrics.framesPerSecond ? `${Math.round(metrics.framesPerSecond)} fps` : 'N/A'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionMetrics;
