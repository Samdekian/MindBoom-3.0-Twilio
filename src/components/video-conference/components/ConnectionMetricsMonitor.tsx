
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface ConnectionMetricsMonitorProps {
  connectionQuality: string;
  metrics?: any;
  reconnecting?: boolean;
  reconnectAttempt?: number;
  onManualReconnect?: () => Promise<boolean>;
}

const ConnectionMetricsMonitor: React.FC<ConnectionMetricsMonitorProps> = ({
  connectionQuality,
  metrics,
  reconnecting = false,
  reconnectAttempt = 0,
  onManualReconnect
}) => {
  // Get the appropriate variant based on the connection quality
  const getQualityVariant = () => {
    switch (connectionQuality) {
      case "excellent": return "success";
      case "good": return "default";
      case "poor": return "warning";
      case "disconnected": return "destructive";
      default: return "outline";
    }
  };

  // Get the appropriate icon based on the connection quality
  const getQualityIcon = () => {
    if (reconnecting) {
      return <RefreshCw className="h-4 w-4 mr-1 animate-spin" />;
    }

    if (connectionQuality === "disconnected") {
      return <WifiOff className="h-4 w-4 mr-1" />;
    }

    return <Wifi className="h-4 w-4 mr-1" />;
  };

  return (
    <Card className="w-auto bg-gray-800/80 border-gray-700 text-white">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <Badge variant={getQualityVariant()} className="flex items-center">
            {getQualityIcon()}
            {reconnecting ? `Reconnecting (${reconnectAttempt})` : `Connection: ${connectionQuality}`}
          </Badge>
          
          {reconnecting && onManualReconnect && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onManualReconnect}
              className="ml-2 h-6 text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          )}
        </div>
        
        {metrics && (
          <div className="grid grid-cols-2 gap-1 text-xs text-gray-300">
            {metrics.roundTripTime !== undefined && (
              <div>RTT: {metrics.roundTripTime.toFixed(0)}ms</div>
            )}
            {metrics.packetLoss !== undefined && (
              <div>Loss: {(metrics.packetLoss * 100).toFixed(1)}%</div>
            )}
            {!metrics.roundTripTime && !metrics.packetLoss && (
              <>
                <Skeleton className="h-3 w-12 bg-gray-700" />
                <Skeleton className="h-3 w-12 bg-gray-700" />
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConnectionMetricsMonitor;
