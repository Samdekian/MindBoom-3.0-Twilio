
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RefreshCw, Clock, Activity, BarChart3, ZapIcon } from 'lucide-react';
import { roleCache } from '@/utils/rbac/role-cache';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Mock historical data for the chart
const generateHistoricalData = () => {
  const data = [];
  const now = Date.now();
  
  for (let i = 23; i >= 0; i--) {
    data.push({
      time: new Date(now - i * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      hits: Math.floor(Math.random() * 40) + 10,
      misses: Math.floor(Math.random() * 20) + 5,
      syncAttempts: Math.floor(Math.random() * 15),
    });
  }
  
  return data;
};

export const PerformanceStats: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState(roleCache.getMetrics());
  const [historyData, setHistoryData] = useState(generateHistoricalData());
  const { toast } = useToast();

  useEffect(() => {
    // Update metrics every 10 seconds
    const interval = setInterval(() => {
      setMetrics(roleCache.getMetrics());
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const refreshMetrics = () => {
    setIsLoading(true);
    setMetrics(roleCache.getMetrics());
    
    // Generate new mock historical data for demonstration
    setHistoryData(generateHistoricalData());
    
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Metrics refreshed",
        description: "Performance metrics have been updated.",
      });
    }, 800);
  };

  const formatDuration = (ms: number) => {
    if (ms < 1) return '< 1ms';
    if (ms < 1000) return `${ms.toFixed(1)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Performance Metrics</h2>
          <p className="text-muted-foreground">
            Monitor RBAC system performance and cache efficiency
          </p>
        </div>
        <Button
          onClick={refreshMetrics}
          variant="outline"
          disabled={isLoading}
        >
          <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
          Refresh Metrics
        </Button>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Cache Hit Ratio</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.cacheHits + metrics.cacheMisses > 0 
                ? ((metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) * 100).toFixed(1) + '%'
                : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">
              Higher is better
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Avg Sync Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(metrics.averageSyncDuration || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Lower is better
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <ZapIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Of all sync attempts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Operations</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.cacheHits + metrics.cacheMisses + metrics.totalSyncAttempts}
            </div>
            <p className="text-xs text-muted-foreground">
              Lifetime operations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <Card>
        <CardHeader>
          <CardTitle>RBAC Operations Over Time</CardTitle>
          <CardDescription>24-hour view of cache hits, misses and sync attempts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="hits" 
                  stroke="#3b82f6" 
                  name="Cache Hits"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="misses" 
                  stroke="#f97316" 
                  name="Cache Misses" 
                />
                <Line 
                  type="monotone" 
                  dataKey="syncAttempts" 
                  stroke="#10b981" 
                  name="Sync Attempts" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Last Sync Information */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sync Timing Details</CardTitle>
            <CardDescription>Performance breakdown of role synchronization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Last Sync:</span>
                  <span>{metrics.lastSyncTime ? new Date(metrics.lastSyncTime).toLocaleString() : 'Never'}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Total Sync Attempts:</span>
                  <span>{metrics.totalSyncAttempts}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Average Duration:</span>
                  <span>{formatDuration(metrics.averageSyncDuration)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Success Rate:</span>
                  <span className={metrics.successRate > 95 ? "text-green-500" : "text-amber-500"}>
                    {metrics.successRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cache Performance</CardTitle>
            <CardDescription>Role cache hit/miss statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Cache Hits:</span>
                  <span>{metrics.cacheHits}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Cache Misses:</span>
                  <span>{metrics.cacheMisses}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Total Queries:</span>
                  <span>{metrics.cacheHits + metrics.cacheMisses}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Hit Rate:</span>
                  <span className={
                    metrics.cacheHits + metrics.cacheMisses === 0 ? "text-muted-foreground" :
                    (metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) > 0.8 ? "text-green-500" : "text-amber-500"
                  }>
                    {metrics.cacheHits + metrics.cacheMisses === 0 ? '0.0%' :
                      ((metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) * 100).toFixed(1) + '%'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
