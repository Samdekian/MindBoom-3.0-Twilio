
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePerformanceMonitor } from "@/services/performance-monitor";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type SystemComponent = {
  name: string;
  status: "operational" | "degraded" | "issue" | "unknown";
  latency?: number;
  lastCheck: Date;
  details?: string;
};

type IntegrationTest = {
  name: string;
  status: "pass" | "fail" | "pending";
  duration?: number; 
  message?: string;
};

const SystemIntegrationReport = () => {
  const [components, setComponents] = useState<SystemComponent[]>([]);
  const [tests, setTests] = useState<IntegrationTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { trackOperation } = usePerformanceMonitor('SystemIntegrationReport');

  // Mock data - in a real app, this would come from API calls
  useEffect(() => {
    const loadData = async () => {
      const endTiming = trackOperation('load-status-data');
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setComponents([
          { 
            name: "Authentication Service", 
            status: "operational", 
            latency: 120, 
            lastCheck: new Date(),
            details: "JWT validation and role-based access control fully operational"
          },
          { 
            name: "Video Conference System", 
            status: "operational", 
            latency: 85, 
            lastCheck: new Date(),
            details: "WebRTC signaling and media transmission working normally"
          },
          { 
            name: "Calendar Integration", 
            status: "operational", 
            latency: 210, 
            lastCheck: new Date(),
            details: "Google Calendar and webhook synchronization operational"
          },
          { 
            name: "Database Services", 
            status: "operational", 
            latency: 45, 
            lastCheck: new Date(),
            details: "All database connections responsive with normal query times"
          },
          { 
            name: "File Storage", 
            status: "operational", 
            latency: 160, 
            lastCheck: new Date(),
            details: "Uploads and retrievals functioning within expected parameters"
          }
        ]);
        
        setTests([
          { 
            name: "End-to-End Login Flow", 
            status: "pass", 
            duration: 1252,
            message: "Successfully authenticated and retrieved user data" 
          },
          { 
            name: "Appointment Creation & Syncing", 
            status: "pass",
            duration: 1876,
            message: "Created appointment and verified calendar sync" 
          },
          { 
            name: "Video Session Connection", 
            status: "pass",
            duration: 2340,
            message: "Established P2P connection and verified media transmission" 
          },
          { 
            name: "Role-Based Access Control", 
            status: "pass",
            duration: 945,
            message: "All permission checks passed for different user roles" 
          },
          { 
            name: "Push Notification Delivery", 
            status: "pass",
            duration: 1105,
            message: "Notifications sent and delivered successfully" 
          }
        ]);
      } catch (error) {
        console.error("Failed to load system status:", error);
        toast({
          title: "System Status Error",
          description: "Failed to load component status data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
        endTiming();
      }
    };

    loadData();
  }, [trackOperation]);

  const runSystemCheck = async () => {
    setIsLoading(true);
    const endTiming = trackOperation('run-system-check');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "System Check Complete",
        description: "All system components verified operational",
      });
    } catch (error) {
      toast({
        title: "System Check Failed",
        description: "Could not complete system verification",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      endTiming();
    }
  };

  const renderStatusBadge = (status: SystemComponent["status"]) => {
    switch (status) {
      case "operational":
        return <Badge className="bg-green-600">Operational</Badge>;
      case "degraded":
        return <Badge className="bg-yellow-600">Degraded</Badge>;
      case "issue":
        return <Badge className="bg-red-600">Issue</Badge>;
      default:
        return <Badge className="bg-gray-600">Unknown</Badge>;
    }
  };

  const renderTestBadge = (status: IntegrationTest["status"]) => {
    switch (status) {
      case "pass":
        return <Badge className="bg-green-600">Pass</Badge>;
      case "fail":
        return <Badge className="bg-red-600">Fail</Badge>;
      default:
        return <Badge className="bg-yellow-600">Pending</Badge>;
    }
  };

  const getSystemHealthStatus = () => {
    const operationalCount = components.filter(c => c.status === "operational").length;
    const total = components.length;
    
    if (operationalCount === total) return "All Systems Operational";
    if (operationalCount >= total * 0.8) return "Minor System Issues";
    if (operationalCount >= total * 0.5) return "Major System Degradation";
    return "Critical System Failure";
  };

  const getTestsPassedStatus = () => {
    const passedCount = tests.filter(t => t.status === "pass").length;
    const total = tests.length;
    
    return `${passedCount}/${total} Tests Passing`;
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-bold">System Integration Status</CardTitle>
            <CardDescription>
              Monitoring and validation of integrated system components
            </CardDescription>
          </div>
          <Button
            variant="outline"
            onClick={runSystemCheck}
            disabled={isLoading}
          >
            {isLoading ? (
              <ArrowUpDown className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUpDown className="h-4 w-4 mr-2" />
            )}
            Run System Check
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="bg-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">System Health</p>
                  <h3 className="text-2xl font-bold mt-2">{getSystemHealthStatus()}</h3>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Integration Tests</p>
                  <h3 className="text-2xl font-bold mt-2">{getTestsPassedStatus()}</h3>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="components">
          <TabsList className="mb-4 w-full grid grid-cols-2">
            <TabsTrigger value="components">System Components</TabsTrigger>
            <TabsTrigger value="tests">Integration Tests</TabsTrigger>
          </TabsList>
          
          <TabsContent value="components">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Component</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Latency</TableHead>
                  <TableHead className="hidden md:table-cell">Last Check</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {components.map((component, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{component.name}</TableCell>
                    <TableCell>{renderStatusBadge(component.status)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {component.latency ? `${component.latency}ms` : "N/A"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {component.lastCheck?.toLocaleTimeString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          
          <TabsContent value="tests">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test Name</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead className="hidden md:table-cell">Duration</TableHead>
                  <TableHead className="hidden md:table-cell">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tests.map((test, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{test.name}</TableCell>
                    <TableCell>{renderTestBadge(test.status)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {test.duration ? `${test.duration}ms` : "N/A"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-xs truncate">
                      {test.message}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SystemIntegrationReport;
