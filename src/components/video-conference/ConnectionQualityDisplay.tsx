import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wifi, 
  Video, 
  Volume2, 
  AlertTriangle, 
  CheckCircle, 
  Signal,
  Monitor,
  Zap
} from 'lucide-react';
import { ConnectionQualityMetrics, QualityAssessment } from '@/hooks/video-conference/use-connection-quality-monitor';

interface ConnectionQualityDisplayProps {
  metrics: ConnectionQualityMetrics | null;
  quality: QualityAssessment;
  isMonitoring: boolean;
  optimizationSuggestions: string[];
}

export function ConnectionQualityDisplay({ 
  metrics, 
  quality, 
  isMonitoring,
  optimizationSuggestions 
}: ConnectionQualityDisplayProps) {
  const getQualityColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'poor': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getQualityIcon = (level: string) => {
    switch (level) {
      case 'excellent': return CheckCircle;
      case 'good': return CheckCircle;
      case 'poor': return AlertTriangle;
      case 'critical': return AlertTriangle;
      default: return Signal;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const QualityIndicator = ({ 
    label, 
    level, 
    icon: Icon 
  }: { 
    label: string; 
    level: string; 
    icon: React.ElementType 
  }) => (
    <div className={`flex items-center gap-2 p-3 rounded-lg border ${getQualityColor(level)}`}>
      <Icon className="h-4 w-4" />
      <div className="flex-1">
        <div className="font-medium text-sm">{label}</div>
        <div className="text-xs opacity-75 capitalize">{level}</div>
      </div>
    </div>
  );

  if (!isMonitoring) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Signal className="h-5 w-5" />
            Connection Quality
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            Monitoring will start when connection is established
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Signal className="h-5 w-5" />
            Connection Quality
            <Badge variant={quality.overall === 'excellent' || quality.overall === 'good' ? 'default' : 'destructive'}>
              {quality.overall}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quality Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <QualityIndicator label="Network" level={quality.network} icon={Wifi} />
            <QualityIndicator label="Video" level={quality.video} icon={Video} />
            <QualityIndicator label="Audio" level={quality.audio} icon={Volume2} />
          </div>

          {/* Detailed Metrics */}
          {metrics && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-muted-foreground">Latency</div>
                  <div className="text-lg font-mono">{metrics.rtt.toFixed(0)}ms</div>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground">Frame Rate</div>
                  <div className="text-lg font-mono">{metrics.frameRate.toFixed(0)} fps</div>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground">Resolution</div>
                  <div className="text-lg font-mono">
                    {metrics.resolution.width}x{metrics.resolution.height}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground">Bandwidth</div>
                  <div className="text-lg font-mono">{metrics.bandwidth.toFixed(0)} kbps</div>
                </div>
              </div>

              {/* Packet Loss Indicator */}
              {metrics.packetsSent > 0 && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-muted-foreground">Packet Loss</span>
                    <span className="font-mono">
                      {((metrics.packetsLost / metrics.packetsSent) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={(metrics.packetsLost / metrics.packetsSent) * 100} 
                    className="h-2"
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Optimization Suggestions */}
      {optimizationSuggestions.length > 0 && (
        <Alert>
          <Zap className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-2">Optimization Suggestions:</div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {optimizationSuggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Critical Quality Warning */}
      {quality.overall === 'critical' && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium">Critical Connection Issues Detected</div>
            <div className="mt-1">
              Your connection quality is severely degraded. Consider ending the call and 
              troubleshooting your network connection.
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}