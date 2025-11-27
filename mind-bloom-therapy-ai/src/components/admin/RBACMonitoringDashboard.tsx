import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { RoleDiagnosticResult } from "@/types/rbac-monitoring";
import { useRBAC } from "@/hooks/useRBAC";
import { useRBACStats } from "@/hooks/use-rbac-stats";
import {
  Shield,
  AlertTriangle,
  Activity,
  Users,
  RefreshCw,
  Download,
  Clock,
  BarChart3,
  CheckCircle,
  XCircle
} from "lucide-react";
import EventsTabContent from "./rbac-dashboard/EventsTabContent";
import PermissionsVisualization from "./security/PermissionsVisualization";
import RoleAuditTools from "./security/RoleAuditTools";

const RBACMonitoringDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [anomalies, setAnomalies] = useState<RoleDiagnosticResult[]>([]);
  const { performConsistencyCheck } = useRBAC();
  const { stats, events, isLoading, error, refreshStats, refreshEvents } = useRBACStats();
  const { toast } = useToast();
  
  
  // Check for role inconsistencies on load
  useEffect(() => {
    const checkConsistency = async () => {
      try {
        const consistencyResults = await performConsistencyCheck();
        if (Array.isArray(consistencyResults)) {
          const detectedAnomalies = consistencyResults.filter(r => r && typeof r === 'object' && r.isConsistent === false);
          setAnomalies(detectedAnomalies);
          
          if (detectedAnomalies.length > 0) {
            toast({
              title: "Role inconsistencies detected",
              description: `Found ${detectedAnomalies.length} users with role inconsistencies.`,
              variant: "destructive"
            });
          }
        }
      } catch (error) {
        console.error("Error checking consistency:", error);
      }
    };

    if (!isLoading && stats) {
      checkConsistency();
    }
  }, [isLoading, stats, performConsistencyCheck, toast]);
  
  // Refresh events data
  const handleRefreshEvents = async (limit = 10) => {
    try {
      const refreshedEvents = await refreshEvents(limit);
      toast({
        title: "Events refreshed",
        description: "RBAC events have been updated with the latest data."
      });
    } catch (error) {
      console.error("Error refreshing events:", error);
      toast({
        title: "Error refreshing events",
        description: "Could not refresh RBAC events. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Run consistency check
  const runConsistencyCheck = async () => {
    try {
      const consistencyResults = await performConsistencyCheck();
      if (Array.isArray(consistencyResults)) {
        const detectedAnomalies = consistencyResults.filter(r => r && typeof r === 'object' && r.isConsistent === false);
        setAnomalies(detectedAnomalies);
      
        // Refresh stats after consistency check
        await refreshStats();
      
        toast({
          title: "Consistency Check Complete",
          description: detectedAnomalies.length > 0
            ? `Found ${detectedAnomalies.length} users with role inconsistencies.`
            : "No role inconsistencies detected.",
          variant: detectedAnomalies.length > 0 ? "destructive" : "default"
        });
      }
    } catch (error) {
      console.error("Error running consistency check:", error);
      toast({
        title: "Consistency Check Failed",
        description: "Could not complete the role consistency check.",
        variant: "destructive"
      });
    }
  };
  
  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading RBAC Data</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {anomalies.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Role inconsistencies detected</AlertTitle>
          <AlertDescription>
            Found {anomalies.length} users with role inconsistencies. Please check the Role Audit tab for details.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Shield className="h-5 w-5 mr-2" /> RBAC Monitoring
          </h2>
          <p className="text-muted-foreground">
            Monitor and manage role-based access control
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            className="flex items-center gap-1"
            onClick={runConsistencyCheck}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Run Consistency Check
          </Button>
          
          <Button asChild>
            <a href="/security-compliance">
              Security Dashboard
            </a>
          </Button>
        </div>
      </div>
      
      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-baseline">
              <div className="text-3xl font-bold">
                {stats?.healthScore || 0}%
              </div>
              {(stats?.healthScore || 0) > 90 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-baseline">
              <div className="text-3xl font-bold">
                {stats?.uniqueUsers || 0}
              </div>
              <Users className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recent Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-baseline">
              <div className="text-3xl font-bold">
                {stats?.lastDayEvents || 0}
              </div>
              <Activity className="h-5 w-5 text-purple-500" />
            </div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Last Scan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-baseline">
              <div className="text-lg font-bold">
                {stats?.lastScanTime 
                  ? new Date(stats.lastScanTime).toLocaleTimeString() 
                  : 'Never'}
              </div>
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.inconsistencies || 0} inconsistencies found
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 md:w-[400px]">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="events">
            <Activity className="h-4 w-4 mr-2" />
            Events
          </TabsTrigger>
          <TabsTrigger value="roles">
            <Shield className="h-4 w-4 mr-2" />
            Role Audit
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>RBAC System Overview</CardTitle>
              <CardDescription>
                Key metrics and performance indicators for your role-based access control system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Role Distribution</h3>
                  <div className="space-y-2">
                    {stats?.roleBreakdown?.map(role => (
                      <div key={role.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="mr-2 h-2 w-2 rounded-full bg-primary" />
                          <span>{role.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-muted-foreground">{role.count}</span>
                          <div className="w-20 bg-muted rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-primary h-full"
                              style={{ width: `${role.percentage}%` }}
                            />
                          </div>
                          <span className="text-muted-foreground text-xs">{role.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Activity Summary</h3>
                  <div className="space-y-2">
                    {stats?.activityByType && Object.entries(stats.activityByType).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="mr-2 h-2 w-2 rounded-full bg-primary" />
                          <span>{type.replace('_', ' ')}</span>
                        </div>
                        <span className="text-muted-foreground">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Most Active Users</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {stats?.mostActiveUsers?.slice(0, 3).map(user => (
                    <Card key={user.id}>
                      <CardHeader className="py-3 px-4">
                        <CardTitle className="text-sm">{user.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2 px-4">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-sm">Actions</span>
                          <span className="font-medium">{user.count}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Last updated: {stats?.lastScanTime 
                    ? new Date(stats.lastScanTime).toLocaleString()
                    : 'Never'}
                </p>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    className="flex items-center gap-1"
                    onClick={runConsistencyCheck}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Run Consistency Check
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-1"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Permissions Visualization</CardTitle>
              <CardDescription>
                Explore role permissions and their relationships
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PermissionsVisualization />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>RBAC Events Log</CardTitle>
              <CardDescription>
                Recent role-based access control events and activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EventsTabContent 
                events={events}
                loading={isLoading}
                refreshEvents={handleRefreshEvents}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="roles">
          <RoleAuditTools onAnomalyDetected={(detectedAnomalies) => {
            setAnomalies(detectedAnomalies);
            // Refresh stats after anomaly detection
            refreshStats();
          }} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RBACMonitoringDashboard;
