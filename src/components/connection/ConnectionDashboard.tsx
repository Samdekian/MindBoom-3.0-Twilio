// Real-time Connection Monitoring Dashboard
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, Activity, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { ConnectionPool, ConnectionMetrics, ConnectionHealth } from '@/lib/connection/ConnectionPool';
import { cn } from '@/lib/utils';

export const ConnectionDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<ConnectionMetrics | null>(null);
  const [healthStatus, setHealthStatus] = useState<ConnectionHealth[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const connectionPool = ConnectionPool.getInstance();

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(connectionPool.getMetrics());
      setHealthStatus(connectionPool.getHealthStatus());
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 2000);
    
    return () => clearInterval(interval);
  }, [connectionPool]);

  if (!metrics) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-success border-success/20 bg-success/10';
      case 'degraded': return 'text-warning border-warning/20 bg-warning/10';
      case 'unhealthy': return 'text-destructive border-destructive/20 bg-destructive/10';
      case 'dead': return 'text-muted-foreground border-muted/20 bg-muted/10';
      default: return 'text-muted-foreground border-muted/20 bg-muted/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4" />;
      case 'unhealthy': return <XCircle className="h-4 w-4" />;
      case 'dead': return <WifiOff className="h-4 w-4" />;
      default: return <Wifi className="h-4 w-4" />;
    }
  };

  const getCircuitBreakerColor = (state: string) => {
    switch (state) {
      case 'closed': return 'text-success';
      case 'half-open': return 'text-warning';
      case 'open': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 shadow-lg border border-border/50 backdrop-blur-sm bg-background/95">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Connection Status
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? '−' : '+'}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Overview Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Active</div>
              <div className="text-lg font-semibold">{metrics.activeConnections}/{metrics.totalConnections}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Latency</div>
              <div className="text-lg font-semibold">{Math.round(metrics.averageLatency)}ms</div>
            </div>
          </div>

          {/* Circuit Breaker Status */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Circuit Breaker</span>
            <Badge variant="outline" className={cn("text-xs", getCircuitBreakerColor(metrics.circuitBreakerState))}>
              {metrics.circuitBreakerState.toUpperCase()}
            </Badge>
          </div>

          {/* Error Rate */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Error Rate</span>
              <span>{(metrics.errorRate * 100).toFixed(1)}%</span>
            </div>
            <Progress value={metrics.errorRate * 100} className="h-1" />
          </div>

          {/* Queue Status */}
          {metrics.queuedRequests > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Queued</span>
              <Badge variant="outline" className="text-xs">
                {metrics.queuedRequests}
              </Badge>
            </div>
          )}

          {/* Expanded Details */}
          {isExpanded && (
            <div className="space-y-3 pt-2 border-t border-border/50">
              <div className="text-xs font-medium text-muted-foreground">Connection Health</div>
              
              {healthStatus.length === 0 ? (
                <div className="text-xs text-muted-foreground text-center py-2">
                  No active connections
                </div>
              ) : (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {healthStatus.map((health) => (
                    <div key={health.id} className="flex items-center justify-between p-2 rounded-md border border-border/30">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(health.status)}
                        <div>
                          <div className="text-xs font-medium truncate max-w-[100px]">
                            {health.id}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {health.pingLatency}ms • {health.consecutiveFailures} failures
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs", getStatusColor(health.status))}
                      >
                        {health.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => connectionPool.cleanup()}
                  className="text-xs h-7 flex-1"
                >
                  Cleanup
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};