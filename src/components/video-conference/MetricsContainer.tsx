
import React, { useState } from 'react';
import ConnectionMetricsDisplay from './ConnectionMetricsDisplay';
import { useUnifiedConnectionMetrics } from '@/hooks/webrtc/useUnifiedConnectionMetrics';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface MetricsContainerProps {
  peerConnection: RTCPeerConnection | null;
}

const MetricsContainer: React.FC<MetricsContainerProps> = ({ peerConnection }) => {
  const [useHistoryMetrics, setUseHistoryMetrics] = useState(false);
  
  // Use our unified metrics hook
  const { metrics, metricsHistory } = useUnifiedConnectionMetrics(peerConnection, {
    withHistory: useHistoryMetrics,
    historyLength: 120 // Keep 2 minutes of history
  });
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
        <div className="flex items-center space-x-2">
          <Switch
            id="metrics-mode"
            checked={useHistoryMetrics}
            onCheckedChange={setUseHistoryMetrics}
          />
          <Label htmlFor="metrics-mode">Use metrics with history</Label>
        </div>
        
        {useHistoryMetrics && metricsHistory && (
          <div className="text-xs text-muted-foreground">
            Data points: {metricsHistory.length}
          </div>
        )}
      </div>
      
      <ConnectionMetricsDisplay
        metrics={metrics}
        showHistory={useHistoryMetrics}
      />
    </div>
  );
};

export default MetricsContainer;
