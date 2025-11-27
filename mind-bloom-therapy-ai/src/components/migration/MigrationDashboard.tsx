
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { authMigrationMonitor } from '@/utils/migration/auth-migration-monitor';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Download,
  TrendingUp,
  Users,
  Shield
} from 'lucide-react';

const MigrationDashboard = () => {
  const [stats, setStats] = useState(authMigrationMonitor.getStats());
  const [events, setEvents] = useState(authMigrationMonitor.getRecentEvents());
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setStats(authMigrationMonitor.getStats());
      setEvents(authMigrationMonitor.getRecentEvents());
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const progressPercentage = (stats.migratedComponents / stats.totalComponents) * 100;
  const errorEvents = events.filter(e => e.type === 'error');
  const warningEvents = events.filter(e => e.type === 'warning');
  const performanceIssues = events.filter(e => 
    e.type === 'performance' && e.details?.duration > 100
  );

  const downloadReport = () => {
    const report = authMigrationMonitor.generateReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auth-migration-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Migration Dashboard</h1>
          <p className="text-muted-foreground">Auth System Migration Monitoring</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className="h-4 w-4 mr-2" />
            {autoRefresh ? 'Live' : 'Paused'}
          </Button>
          <Button variant="outline" size="sm" onClick={downloadReport}>
            <Download className="h-4 w-4 mr-2" />
            Report
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Migration Progress</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressPercentage.toFixed(1)}%</div>
            <Progress value={progressPercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {stats.migratedComponents} of {stats.totalComponents} components
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compatibility Usage</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.compatibilityLayerUsage}</div>
            <p className="text-xs text-muted-foreground">
              Components using compatibility layer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.errorCount}</div>
            <p className="text-xs text-muted-foreground">
              Total errors since migration start
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.performanceMetrics.authCheckTime.toFixed(0)}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Average auth check time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Alerts */}
      {errorEvents.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Critical Issues Detected</AlertTitle>
          <AlertDescription>
            {errorEvents.length} error(s) in the last 50 events. Please review the Events tab.
          </AlertDescription>
        </Alert>
      )}

      {performanceIssues.length > 0 && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertTitle>Performance Warnings</AlertTitle>
          <AlertDescription>
            {performanceIssues.length} slow operation(s) detected. Check the Performance tab.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">
            Events
            {(errorEvents.length + warningEvents.length) > 0 && (
              <Badge variant="destructive" className="ml-2">
                {errorEvents.length + warningEvents.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Migration Status</CardTitle>
                <CardDescription>Current migration progress breakdown</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Components Migrated</span>
                  <Badge variant="default">{stats.migratedComponents}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Using Compatibility Layer</span>
                  <Badge variant="secondary">{stats.compatibilityLayerUsage}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Total Components</span>
                  <Badge variant="outline">{stats.totalComponents}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Current system stability metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Error Rate</span>
                  <Badge variant={stats.errorCount > 10 ? "destructive" : "default"}>
                    {((stats.errorCount / events.length) * 100).toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Performance Issues</span>
                  <Badge variant={performanceIssues.length > 5 ? "destructive" : "default"}>
                    {performanceIssues.length}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Last Updated</span>
                  <span className="text-sm text-muted-foreground">
                    {stats.lastUpdated.toLocaleTimeString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>Latest migration events and system activities</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className={`p-3 rounded-lg border ${
                        event.type === 'error' ? 'border-red-200 bg-red-50' :
                        event.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                        event.type === 'migration' ? 'border-green-200 bg-green-50' :
                        'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            event.type === 'error' ? 'destructive' :
                            event.type === 'warning' ? 'secondary' :
                            event.type === 'migration' ? 'default' :
                            'outline'
                          }>
                            {event.type}
                          </Badge>
                          <span className="font-medium">{event.component}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {event.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{event.message}</p>
                      {event.details && (
                        <pre className="text-xs bg-white p-2 rounded mt-2 overflow-auto">
                          {JSON.stringify(event.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Auth Checks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.performanceMetrics.authCheckTime.toFixed(0)}ms
                </div>
                <p className="text-xs text-muted-foreground">Average time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Role Checks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.performanceMetrics.roleCheckTime.toFixed(0)}ms
                </div>
                <p className="text-xs text-muted-foreground">Average time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Permission Checks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.performanceMetrics.permissionCheckTime.toFixed(0)}ms
                </div>
                <p className="text-xs text-muted-foreground">Average time</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MigrationDashboard;
