import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ConnectionQualityProps {
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'disconnected';
  score: number;
  issues?: string[];
  rtt?: number;
  packetLoss?: number;
  className?: string;
  showDetails?: boolean;
}

export const ConnectionQualityBadge: React.FC<ConnectionQualityProps> = ({
  quality,
  score,
  issues = [],
  rtt,
  packetLoss,
  className,
  showDetails = false
}) => {
  const getQualityIcon = () => {
    switch (quality) {
      case 'excellent':
        return <Zap className="h-3 w-3" />;
      case 'good':
        return <CheckCircle className="h-3 w-3" />;
      case 'fair':
        return <Wifi className="h-3 w-3" />;
      case 'poor':
        return <AlertTriangle className="h-3 w-3" />;
      case 'disconnected':
        return <WifiOff className="h-3 w-3" />;
      default:
        return <Wifi className="h-3 w-3" />;
    }
  };

  const getQualityColor = () => {
    switch (quality) {
      case 'excellent':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'good':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'fair':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'poor':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'disconnected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getQualityText = () => {
    switch (quality) {
      case 'excellent':
        return 'Excellent';
      case 'good':
        return 'Good';
      case 'fair':
        return 'Fair';
      case 'poor':
        return 'Poor';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge 
        variant="outline" 
        className={cn(
          "flex items-center gap-1 text-xs font-medium",
          getQualityColor()
        )}
      >
        {getQualityIcon()}
        {getQualityText()}
        {showDetails && score > 0 && (
          <span className="ml-1">({score}%)</span>
        )}
      </Badge>
      
      {showDetails && (rtt !== undefined || packetLoss !== undefined) && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {rtt !== undefined && (
            <span>{Math.round(rtt)}ms</span>
          )}
          {packetLoss !== undefined && (
            <span>{(packetLoss * 100).toFixed(1)}% loss</span>
          )}
        </div>
      )}
      
      {issues.length > 0 && (
        <div className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3 text-amber-500" />
          <span className="text-xs text-amber-600">
            {issues.length} issue{issues.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
};