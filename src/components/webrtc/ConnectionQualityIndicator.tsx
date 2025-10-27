import React from 'react';
import { Wifi, WifiOff, Signal, SignalHigh, SignalMedium, SignalLow, AlertTriangle } from 'lucide-react';
import { ConnectionQuality } from '@/lib/webrtc/connection-monitor';

interface ConnectionQualityIndicatorProps {
  quality: ConnectionQuality | null;
  userId?: string;
  showDetails?: boolean;
  className?: string;
}

export const ConnectionQualityIndicator: React.FC<ConnectionQualityIndicatorProps> = ({
  quality,
  userId,
  showDetails = false,
  className = ''
}) => {
  if (!quality) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <WifiOff className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">No connection</span>
      </div>
    );
  }

  const getQualityIcon = () => {
    switch (quality.overall) {
      case 'excellent':
        return <SignalHigh className="w-4 h-4 text-green-500" />;
      case 'good':
        return <Signal className="w-4 h-4 text-green-400" />;
      case 'fair':
        return <SignalMedium className="w-4 h-4 text-yellow-500" />;
      case 'poor':
        return <SignalLow className="w-4 h-4 text-orange-500" />;
      case 'disconnected':
        return <WifiOff className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getQualityColor = () => {
    switch (quality.overall) {
      case 'excellent':
        return 'text-green-500';
      case 'good':
        return 'text-green-400';
      case 'fair':
        return 'text-yellow-500';
      case 'poor':
        return 'text-orange-500';
      case 'disconnected':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const formatLatency = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatBandwidth = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B/s`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB/s`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB/s`;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {getQualityIcon()}
      
      <div className="flex flex-col">
        <span className={`text-sm font-medium ${getQualityColor()}`}>
          {quality.overall.charAt(0).toUpperCase() + quality.overall.slice(1)}
          {userId && ` (${userId.slice(0, 8)}...)`}
        </span>
        
        {showDetails && (
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex gap-4">
              <span>📹 Video: {quality.video}</span>
              <span>🎤 Audio: {quality.audio}</span>
            </div>
            
            <div className="flex gap-4">
              <span>🌐 Network: {quality.network}</span>
              <span>⏱️ {formatLatency(quality.details.latency)}</span>
            </div>
            
            {quality.details.bandwidth > 0 && (
              <div className="flex gap-4">
                <span>📊 {formatBandwidth(quality.details.bandwidth)}</span>
                <span>📉 {quality.details.packetLoss.toFixed(1)}% loss</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionQualityIndicator;