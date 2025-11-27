import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, CheckCircle, RefreshCw, Monitor, AlertCircle, Wifi } from 'lucide-react';
import { enhancedHealthMonitor, SystemHealthMetrics } from '@/lib/production/enhanced-monitoring';
import { ConnectionQualityBadge } from './ConnectionQualityBadge';

interface HealthMetrics {
  status: 'healthy' | 'degraded' | 'unhealthy';
  last_check: string;
  response_time_ms: number;
  database_connected: boolean;
  webrtc_available: boolean;
  network_online: boolean;
  issues: string[];
}

export const ProductionHealthMonitor: React.FC = () => {
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkSystemHealth = async () => {
    try {
      setIsLoading(true);
      
      const systemMetrics = await enhancedHealthMonitor.getHealthStatus();
      
      if (systemMetrics) {
        const issues: string[] = [];
        
        if (!systemMetrics.database.connected) {
          issues.push('Database connection failed');
        }
        if (!systemMetrics.webrtc.available) {
          issues.push('WebRTC not supported');
        }
        if (!systemMetrics.network.online) {
          issues.push('Network offline');
        }
        if (systemMetrics.database.responseTime > 3000) {
          issues.push('Slow database response');
        }
        
        const status = systemMetrics.database.connected && systemMetrics.webrtc.available && systemMetrics.network.online
          ? issues.length === 0 ? 'healthy' : 'degraded'
          : 'unhealthy';
        
        const metrics: HealthMetrics = {
          status,
          last_check: new Date().toISOString(),
          response_time_ms: Math.round(systemMetrics.performance.totalResponseTime),
          database_connected: systemMetrics.database.connected,
          webrtc_available: systemMetrics.webrtc.available,
          network_online: systemMetrics.network.online,
          issues
        };
        
        setHealthMetrics(metrics);
      }
    } catch (err) {
      console.error('Health check failed:', err);
      setHealthMetrics({
        status: 'unhealthy',
        last_check: new Date().toISOString(),
        response_time_ms: 0,
        database_connected: false,
        webrtc_available: false,
        network_online: navigator.onLine,
        issues: ['Health check failed']
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSystemHealth();
  }, []);

  if (isLoading && !healthMetrics) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Activity className="h-4 w-4 animate-pulse" />
            Checking System Health...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            System Health
          </div>
          <Button variant="ghost" size="sm" onClick={checkSystemHealth}>
            <RefreshCw className="h-3 w-3" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {healthMetrics && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">System Status</span>
              <ConnectionQualityBadge
                quality={healthMetrics.status === 'healthy' ? 'excellent' : 
                        healthMetrics.status === 'degraded' ? 'fair' : 'poor'}
                score={healthMetrics.status === 'healthy' ? 95 : 
                      healthMetrics.status === 'degraded' ? 60 : 20}
                issues={healthMetrics.issues}
                showDetails={false}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Database</span>
                {healthMetrics.database_connected ? (
                  <CheckCircle className="h-3 w-3 text-green-600" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-red-600" />
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">WebRTC</span>
                {healthMetrics.webrtc_available ? (
                  <CheckCircle className="h-3 w-3 text-green-600" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-red-600" />
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Network</span>
                {healthMetrics.network_online ? (
                  <Wifi className="h-3 w-3 text-green-600" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-red-600" />
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Response</span>
                <span className={`text-xs ${healthMetrics.response_time_ms > 3000 ? 'text-amber-600' : 'text-green-600'}`}>
                  {healthMetrics.response_time_ms}ms
                </span>
              </div>
            </div>
            
            {healthMetrics.issues.length > 0 && (
              <div className="text-xs text-amber-600">
                <AlertCircle className="h-3 w-3 inline mr-1" />
                {healthMetrics.issues.join(', ')}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};