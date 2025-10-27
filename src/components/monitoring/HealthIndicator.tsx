
import React from 'react';
import { useHealthCheck } from '@/hooks/use-health-check';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Database, Server, HardDrive, RefreshCw } from 'lucide-react';

export const HealthIndicator = () => {
  const { status, checkHealth, isHealthy } = useHealthCheck();

  const getStatusColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'default';
      case 'unhealthy': return 'destructive';
      case 'checking': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (health: string) => {
    switch (health) {
      case 'healthy': return '🟢';
      case 'unhealthy': return '🔴';
      case 'checking': return '🟡';
      default: return '⚪';
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          System Health
        </CardTitle>
        <CardDescription>
          Real-time system status monitoring
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="text-sm">Database</span>
            </div>
            <Badge variant={getStatusColor(status.database)}>
              {getStatusIcon(status.database)} {status.database}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              <span className="text-sm">API</span>
            </div>
            <Badge variant={getStatusColor(status.api)}>
              {getStatusIcon(status.api)} {status.api}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              <span className="text-sm">Storage</span>
            </div>
            <Badge variant={getStatusColor(status.storage)}>
              {getStatusIcon(status.storage)} {status.storage}
            </Badge>
          </div>
        </div>

        <div className="pt-3 border-t">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Last check: {status.lastCheck?.toLocaleTimeString() || 'Never'}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={checkHealth}
              className="h-8"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="text-center">
          <Badge variant={isHealthy ? 'default' : 'destructive'} className="text-xs">
            System {isHealthy ? 'Operational' : 'Degraded'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
