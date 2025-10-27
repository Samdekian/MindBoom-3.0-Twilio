import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Settings, 
  Zap, 
  Monitor, 
  Wifi,
  RefreshCw,
  Volume2,
  VideoOff
} from 'lucide-react';
import { NetworkAdaptationState } from '@/hooks/webrtc/useNetworkAdaptation';
import { ConnectionQualityMetrics } from '@/hooks/webrtc/useConnectionQualityMonitor';
import { cn } from '@/lib/utils';

interface AdaptiveQualityControlsProps {
  adaptationState: NetworkAdaptationState;
  qualityMetrics: ConnectionQualityMetrics;
  isAdaptationEnabled: boolean;
  isAudioOnlyMode: boolean;
  onToggleAdaptation: (enabled: boolean) => void;
  onForceQualityLevel: (level: NetworkAdaptationState['adaptationLevel']) => Promise<boolean>;
  onResetToMaxQuality: () => Promise<boolean>;
  adaptationSuggestion: string;
  className?: string;
}

export const AdaptiveQualityControls: React.FC<AdaptiveQualityControlsProps> = ({
  adaptationState,
  qualityMetrics,
  isAdaptationEnabled,
  isAudioOnlyMode,
  onToggleAdaptation,
  onForceQualityLevel,
  onResetToMaxQuality,
  adaptationSuggestion,
  className
}) => {
  const [showControls, setShowControls] = useState(false);
  const [isChangingQuality, setIsChangingQuality] = useState(false);

  const getQualityLevelColor = (level: NetworkAdaptationState['adaptationLevel']) => {
    switch (level) {
      case 'max': return 'text-green-600 bg-green-50 border-green-200';
      case 'high': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'audio-only': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getQualityLevelIcon = (level: NetworkAdaptationState['adaptationLevel']) => {
    switch (level) {
      case 'max': return <Monitor className="h-3 w-3" />;
      case 'high': return <Monitor className="h-3 w-3" />;
      case 'medium': return <Monitor className="h-3 w-3" />;
      case 'low': return <VideoOff className="h-3 w-3" />;
      case 'audio-only': return <Volume2 className="h-3 w-3" />;
      default: return <Monitor className="h-3 w-3" />;
    }
  };

  const handleQualityLevelChange = async (level: string) => {
    setIsChangingQuality(true);
    try {
      await onForceQualityLevel(level as NetworkAdaptationState['adaptationLevel']);
    } finally {
      setIsChangingQuality(false);
    }
  };

  const handleResetQuality = async () => {
    setIsChangingQuality(true);
    try {
      await onResetToMaxQuality();
    } finally {
      setIsChangingQuality(false);
    }
  };

  const QualityBadge = () => (
    <Badge 
      variant="outline" 
      className={cn("gap-1 text-xs", getQualityLevelColor(adaptationState.adaptationLevel))}
    >
      {getQualityLevelIcon(adaptationState.adaptationLevel)}
      {adaptationState.adaptationLevel.toUpperCase()}
      {adaptationState.isAdapting && <RefreshCw className="h-3 w-3 animate-spin ml-1" />}
    </Badge>
  );

  return (
    <div className={className}>
      <Popover open={showControls} onOpenChange={setShowControls}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 text-xs"
          >
            <Settings className="h-3 w-3" />
            Quality
            <QualityBadge />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4" />
                Adaptive Quality
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              {/* Current Status */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Current Quality</Label>
                  <QualityBadge />
                </div>
                <div className="text-xs text-muted-foreground">
                  {adaptationState.currentConstraints.width}x{adaptationState.currentConstraints.height} @ {adaptationState.currentConstraints.frameRate}fps
                </div>
              </div>

              {/* Adaptive Control Toggle */}
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Auto Adaptation</Label>
                <Switch 
                  checked={isAdaptationEnabled}
                  onCheckedChange={onToggleAdaptation}
                />
              </div>

              {/* Manual Quality Selection */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Manual Override</Label>
                <Select 
                  value={adaptationState.adaptationLevel}
                  onValueChange={handleQualityLevelChange}
                  disabled={isChangingQuality}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="max">Maximum (1280x720@30fps)</SelectItem>
                    <SelectItem value="high">High (960x540@30fps)</SelectItem>
                    <SelectItem value="medium">Medium (640x480@24fps)</SelectItem>
                    <SelectItem value="low">Low (320x240@15fps)</SelectItem>
                    <SelectItem value="audio-only">Audio Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleResetQuality}
                  disabled={isChangingQuality || adaptationState.adaptationLevel === 'max'}
                  className="w-full text-xs"
                >
                  <Monitor className="h-3 w-3 mr-2" />
                  Reset to Max Quality
                </Button>
              </div>

              {/* Adaptation Info */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Last Adaptation</Label>
                <div className="text-xs text-muted-foreground">
                  {adaptationState.lastAdaptation 
                    ? `${adaptationState.lastAdaptation.toLocaleTimeString()}: ${adaptationState.adaptationReason}`
                    : 'No adaptations yet'
                  }
                </div>
              </div>

              {/* Current Suggestion */}
              {adaptationSuggestion && (
                <div className="bg-muted/50 rounded p-2 text-xs">
                  <div className="font-medium text-muted-foreground mb-1">
                    Suggestion:
                  </div>
                  <div>{adaptationSuggestion}</div>
                </div>
              )}

              {/* Audio-Only Mode Indicator */}
              {isAudioOnlyMode && (
                <div className="bg-orange-50 border border-orange-200 rounded p-2">
                  <div className="flex items-center gap-2 text-xs text-orange-700">
                    <Volume2 className="h-3 w-3" />
                    <span className="font-medium">Audio-Only Mode Active</span>
                  </div>
                  <div className="text-xs text-orange-600 mt-1">
                    Video disabled due to poor connection quality
                  </div>
                </div>
              )}

              {/* Quality Metrics */}
              <div className="border-t pt-3 space-y-2">
                <Label className="text-xs font-medium">Connection Metrics</Label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Score:</span>
                    <span className="ml-1 font-medium">{qualityMetrics.score}/100</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">RTT:</span>
                    <span className="ml-1 font-medium">{qualityMetrics.rtt}ms</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Loss:</span>
                    <span className="ml-1 font-medium">{qualityMetrics.packetLoss.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">FPS:</span>
                    <span className="ml-1 font-medium">{qualityMetrics.fps}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
};