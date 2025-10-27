
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Server, Database, Wifi, Shield, RefreshCw, Settings, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminSystem: React.FC = () => {
  const { toast } = useToast();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [backupEnabled, setBackupEnabled] = useState(true);
  const [debugMode, setDebugMode] = useState(false);

  // Mock system status
  const systemStatus = {
    server: { status: 'online', uptime: '99.9%', lastRestart: '2024-01-15' },
    database: { status: 'online', connections: 45, maxConnections: 100 },
    api: { status: 'online', responseTime: '120ms', requests: '1.2M' },
    storage: { used: '45GB', total: '100GB', percentage: 45 }
  };

  const systemLogs = [
    { id: 1, level: 'info', message: 'System backup completed successfully', timestamp: '2024-01-20 10:30:00' },
    { id: 2, level: 'warning', message: 'High memory usage detected on server-01', timestamp: '2024-01-20 09:15:00' },
    { id: 3, level: 'error', message: 'Failed to connect to external API endpoint', timestamp: '2024-01-20 08:45:00' },
    { id: 4, level: 'info', message: 'Database optimization completed', timestamp: '2024-01-20 08:00:00' }
  ];

  const handleSystemAction = (action: string) => {
    toast({
      title: `${action} Initiated`,
      description: `System ${action.toLowerCase()} has been started successfully.`
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'offline': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8" />
          System Administration
        </h1>
        <p className="text-gray-600">Monitor and manage system infrastructure</p>
      </div>

      <Tabs defaultValue="status" className="space-y-6">
        <TabsList>
          <TabsTrigger value="status">System Status</TabsTrigger>
          <TabsTrigger value="settings">System Settings</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="status">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Server Status</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <Badge className={getStatusColor(systemStatus.server.status)}>
                    {systemStatus.server.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">Uptime: {systemStatus.server.uptime}</p>
                <p className="text-xs text-muted-foreground">Last restart: {systemStatus.server.lastRestart}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Database</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <Badge className={getStatusColor(systemStatus.database.status)}>
                    {systemStatus.database.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Connections: {systemStatus.database.connections}/{systemStatus.database.maxConnections}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Service</CardTitle>
                <Wifi className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <Badge className={getStatusColor(systemStatus.api.status)}>
                    {systemStatus.api.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">Response time: {systemStatus.api.responseTime}</p>
                <p className="text-xs text-muted-foreground">Requests: {systemStatus.api.requests}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Storage</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStatus.storage.percentage}%</div>
                <p className="text-xs text-muted-foreground">
                  {systemStatus.storage.used} / {systemStatus.storage.total}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${systemStatus.storage.percentage}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
                <CardDescription>Configure system-wide settings and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium">Maintenance Mode</h3>
                    <p className="text-sm text-gray-600">Enable maintenance mode to prevent user access</p>
                  </div>
                  <Switch
                    checked={maintenanceMode}
                    onCheckedChange={setMaintenanceMode}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium">Automatic Backups</h3>
                    <p className="text-sm text-gray-600">Enable automatic daily system backups</p>
                  </div>
                  <Switch
                    checked={backupEnabled}
                    onCheckedChange={setBackupEnabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium">Debug Mode</h3>
                    <p className="text-sm text-gray-600">Enable detailed system logging and debugging</p>
                  </div>
                  <Switch
                    checked={debugMode}
                    onCheckedChange={setDebugMode}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>Recent system events and error logs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemLogs.map((log) => (
                  <div key={log.id} className="flex items-start justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={getLogLevelColor(log.level)}>
                          {log.level.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-gray-500">{log.timestamp}</span>
                      </div>
                      <p className="text-sm">{log.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <div className="space-y-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Maintenance operations may temporarily affect system availability. Please schedule during low-traffic periods.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Operations</CardTitle>
                  <CardDescription>Perform system maintenance tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={() => handleSystemAction('Backup')}
                    className="w-full"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Create System Backup
                  </Button>
                  
                  <Button 
                    onClick={() => handleSystemAction('Cache Clear')}
                    variant="outline"
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Clear System Cache
                  </Button>
                  
                  <Button 
                    onClick={() => handleSystemAction('Database Optimization')}
                    variant="outline"
                    className="w-full"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Optimize Database
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Health Checks</CardTitle>
                  <CardDescription>Run system diagnostic tests</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={() => handleSystemAction('Health Check')}
                    variant="outline"
                    className="w-full"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Run Health Check
                  </Button>
                  
                  <Button 
                    onClick={() => handleSystemAction('Performance Test')}
                    variant="outline"
                    className="w-full"
                  >
                    <Server className="h-4 w-4 mr-2" />
                    Performance Test
                  </Button>
                  
                  <Button 
                    onClick={() => handleSystemAction('Security Scan')}
                    variant="outline"
                    className="w-full"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Security Scan
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSystem;
