
import { useState, useEffect } from 'react';
import { ConnectionMetrics } from './types/connection-metrics';
import { ConnectionMetricsWithHistory } from './types/history-metrics';
import { useConnectionMetrics } from './useConnectionMetrics';
import { useConnectionMetricsWithHistory } from './useConnectionMetricsWithHistory';
import { convertHistoryMetricsToStandard, convertStandardMetricsToHistory } from './utils/metrics-adapter';

export type UnifiedMetricsOptions = {
  withHistory?: boolean;
  historyLength?: number;
};

/**
 * A unified hook that provides connection metrics with optional history support
 */
export function useUnifiedConnectionMetrics(
  peerConnection: RTCPeerConnection | null,
  options: UnifiedMetricsOptions = {}
) {
  const { withHistory = false, historyLength = 60 } = options;
  
  // Use either the history metrics or the standard metrics based on options
  const { metrics: standardMetrics, refreshMetrics } = 
    useConnectionMetrics(withHistory ? null : peerConnection);
    
  const { currentMetrics: historyMetrics, metricsHistory, getAverageMetrics } = 
    useConnectionMetricsWithHistory(withHistory ? peerConnection : null, historyLength);
  
  // Provide a unified metrics object in the standard format
  const [unifiedMetrics, setUnifiedMetrics] = useState<ConnectionMetrics>(standardMetrics);
  
  // Update unified metrics when either source changes
  useEffect(() => {
    if (withHistory && historyMetrics) {
      setUnifiedMetrics(convertHistoryMetricsToStandard(historyMetrics));
    } else {
      setUnifiedMetrics(standardMetrics);
    }
  }, [withHistory, standardMetrics, historyMetrics]);
  
  // Return either set of functionality based on which mode is active
  return {
    metrics: unifiedMetrics,
    refreshMetrics: withHistory ? undefined : refreshMetrics,
    
    // History specific properties (only available when withHistory is true)
    metricsHistory: withHistory ? metricsHistory : undefined,
    getAverageMetrics: withHistory ? getAverageMetrics : undefined,
    
    // Utility functions for conversion
    toHistoryFormat: (metrics: ConnectionMetrics) => convertStandardMetricsToHistory(metrics),
    toStandardFormat: (metrics: ConnectionMetricsWithHistory) => convertHistoryMetricsToStandard(metrics)
  };
}
