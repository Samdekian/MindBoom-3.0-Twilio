import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Wifi, 
  WifiOff, 
  Info, 
  Zap, 
  Clock, 
  Activity,
  Signal,
  Monitor
} from 'lucide-react';
import { ConnectionQualityMetrics } from '@/hooks/webrtc/useConnectionQualityMonitor';
import { cn } from '@/lib/utils';

interface ConnectionQualityIndicatorProps {
  quality: ConnectionQualityMetrics;
  isConnected: boolean;
  className?: string;
  detailed?: boolean;
}

const ConnectionQualityIndicator: React.FC<ConnectionQualityIndicatorProps> = ({
  quality,
  isConnected,
  className,
  detailed = false
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getQualityColor = () => {
    switch (quality.quality) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'fair': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'disconnected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getQualityIcon = () => {
    if (!isConnected) return <WifiOff className="h-3 w-3" />;
    
    switch (quality.quality) {
      case 'excellent': return <Signal className="h-3 w-3" />;
      case 'good': return <Wifi className="h-3 w-3" />;
      case 'fair': return <Activity className="h-3 w-3" />;
      case 'poor': return <Zap className="h-3 w-3" />;
      case 'disconnected': return <WifiOff className="h-3 w-3" />;
      default: return <Wifi className="h-3 w-3" />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const QualityBadge = () => (
    <Badge 
      variant="outline" 
      className={cn("gap-1 text-xs", getQualityColor(), className)}
    >
      {getQualityIcon()}
      {quality.quality.charAt(0).toUpperCase() + quality.quality.slice(1)}
      {detailed && (
        <span className="ml-1">
          ({quality.score}/100)
        </span>
      )}
    </Badge>
  );

  if (!detailed) {
    return <QualityBadge />;
  }

  return (
    <Popover open={showDetails} onOpenChange={setShowDetails}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-auto p-1 gap-1"
        >
          <QualityBadge />
          <Info className="h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              {getQualityIcon()}
              Connection Quality
              <Badge variant="outline" className={getQualityColor()}>
                {quality.score}/100
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {/* Overall Score */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Overall Score</span>
                <span className="font-medium">{quality.score}/100</span>
              </div>
              <Progress value={quality.score} className="h-2" />
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Latency</span>
                </div>
                <div className="font-medium">
                  {quality.rtt.toFixed(0)}ms
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  <span>Packet Loss</span>
                </div>
                <div className="font-medium">
                  {quality.packetLoss.toFixed(1)}%
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Wifi className="h-3 w-3" />
                  <span>Bandwidth</span>
                </div>
                <div className="font-medium">
                  {formatBytes(quality.bandwidth)}/s
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Monitor className="h-3 w-3" />
                  <span>Resolution</span>
                </div>
                <div className="font-medium">
                  {quality.resolution}@{quality.fps}fps
                </div>
              </div>
            </div>

            {/* Jitter */}
            <div className="text-xs">
              <div className="flex justify-between items-center">
                <span>Network Jitter</span>
                <span className="font-medium">{quality.jitter.toFixed(1)}ms</span>
              </div>
            </div>

            {/* Recommendation */}
            {quality.recommendation && (
              <div className="bg-muted/50 rounded p-2 text-xs">
                <div className="font-medium text-muted-foreground mb-1">
                  Recommendation:
                </div>
                <div>{quality.recommendation}</div>
              </div>
            )}

            {/* Connection Status */}
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-xs">
                <span>Connection Status</span>
                <Badge 
                  variant={isConnected ? "default" : "destructive"}
                  className="text-xs"
                >
                  {isConnected ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default ConnectionQualityIndicator;