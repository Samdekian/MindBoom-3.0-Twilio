
import React from "react";
import RBACMonitoringPanel from "@/components/admin/RBACMonitoringPanel";
import RBACVerificationPanel from "@/components/admin/RBACVerificationPanel";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { rbacHealthMonitor } from "@/services/rbac-health-monitor";
import { Shield, Activity, RefreshCw, Clock, CheckCircle, AlertCircle, ClipboardCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

const RBACMonitoringDashboard: React.FC = () => {
  const [isRunningHealthCheck, setIsRunningHealthCheck] = useState(false);
  const [healthCheckResults, setHealthCheckResults] = useState<any>(null);
  const [lastCheckInfo, setLastCheckInfo] = useState(rbacHealthMonitor.getLastRunInfo());

  const runHealthCheck = async (autoFix = false) => {
    setIsRunningHealthCheck(true);
    try {
      const results = await rbacHealthMonitor.runHealthCheck(autoFix);
      setHealthCheckResults(results);
      setLastCheckInfo(rbacHealthMonitor.getLastRunInfo());
    } catch (error) {
      console.error("Health check error:", error);
    } finally {
      setIsRunningHealthCheck(false);
    }
  };

  const toggleAutomatedChecks = () => {
    const info = rbacHealthMonitor.getLastRunInfo();
    if (info.checkInterval > 0 && info.lastRunTime) {
      rbacHealthMonitor.stopAutomatedChecks();
    } else {
      rbacHealthMonitor.startAutomatedChecks(3600000, true); // 1 hour, with auto-fix
    }
    setLastCheckInfo(rbacHealthMonitor.getLastRunInfo());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center">
            <Activity className="mr-2 h-6 w-6" /> RBAC Monitoring
          </h2>
          <p className="text-muted-foreground">
            Monitor, analyze and optimize your role-based access control system
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {lastCheckInfo.lastRunTime && (
            <div className="text-xs text-muted-foreground flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Last check: {lastCheckInfo.lastRunTime.toLocaleString()}
            </div>
          )}
          <Button variant="outline" size="sm" onClick={() => runHealthCheck(false)}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRunningHealthCheck ? 'animate-spin' : ''}`} />
            Run Health Check
          </Button>
        </div>
      </div>
      
      {/* First row - Health & Performance Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle>Performance & Health Metrics</CardTitle>
            <CardDescription>
              Real-time RBAC system performance and consistency monitoring
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <RBACMonitoringPanel />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>RBAC Health Check</CardTitle>
            <CardDescription>
              Run diagnostics and automatic repairs on your RBAC configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Automated monitoring:</span>
                <Badge variant={lastCheckInfo.checkInterval > 0 ? "default" : "outline"}>
                  {lastCheckInfo.checkInterval > 0 ? "Active" : "Inactive"}
                </Badge>
              </div>
              
              <Button 
                variant={lastCheckInfo.checkInterval > 0 ? "destructive" : "default"} 
                size="sm" 
                className="w-full"
                onClick={toggleAutomatedChecks}
              >
                {lastCheckInfo.checkInterval > 0 ? "Stop Automated Checks" : "Start Automated Checks"}
              </Button>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Manual health check:</span>
                  <Button variant="outline" size="sm" onClick={() => runHealthCheck(true)}>
                    <Shield className="h-4 w-4 mr-2" />
                    Run & Repair
                  </Button>
                </div>
                
                {healthCheckResults && (
                  <Alert variant={healthCheckResults.errors.length > 0 ? "destructive" : "default"} className="mt-4">
                    {healthCheckResults.errors.length > 0 ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    <AlertTitle>Health Check Results</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                        <li>Passed checks: {healthCheckResults.passedChecks}/{healthCheckResults.totalChecks}</li>
                        <li>Inconsistencies found: {healthCheckResults.inconsistencies}</li>
                        <li>Auto-fixed issues: {healthCheckResults.autoFixed}</li>
                        {healthCheckResults.errors.length > 0 && (
                          <li>Errors: {healthCheckResults.errors.length}</li>
                        )}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button variant="link" size="sm" className="text-xs mx-auto">
              View Full Health Report
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Second row - Verification Panel */}
      <div className="mb-6">
        <RBACVerificationPanel />
      </div>
    </div>
  );
};

export default RBACMonitoringDashboard;
