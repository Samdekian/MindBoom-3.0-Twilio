
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, AlertTriangle, Check, BarChart } from 'lucide-react';
import { performSecurityAudit } from '@/utils/rbac-tester';
import { VulnerabilityReport } from '@/types/rbac-tests';
import { useRBAC } from '@/hooks/useRBAC';
import { useToast } from '@/hooks/use-toast';

export function RBACSecurityReport() {
  const { roles } = useRBAC();
  const { toast } = useToast();
  const [vulnerabilities, setVulnerabilities] = useState<VulnerabilityReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAuditDate, setLastAuditDate] = useState<Date | null>(null);
  
  const runSecurityAudit = async () => {
    setIsLoading(true);
    try {
      // Get the audit result with proper return type
      const auditResult = performSecurityAudit();
      
      // Update state with the vulnerabilities list
      setVulnerabilities(auditResult.vulnerabilitiesFound);
      setLastAuditDate(auditResult.timestamp);
      
      toast({
        title: "Security Audit Complete",
        description: `Found ${auditResult.vulnerabilitiesFound.length} vulnerabilities`,
      });
    } catch (error) {
      console.error('Error running security audit:', error);
      toast({
        title: "Security Audit Failed",
        description: "An error occurred while running the security audit",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    // Run audit on mount
    runSecurityAudit();
  }, []);
  
  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'critical': return 'bg-red-500 hover:bg-red-600';
      case 'high': return 'bg-orange-500 hover:bg-orange-600';
      case 'medium': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'low': return 'bg-blue-500 hover:bg-blue-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">RBAC Security Report</h3>
          <p className="text-muted-foreground text-sm">
            {lastAuditDate 
              ? `Last audit: ${lastAuditDate.toLocaleDateString()} at ${lastAuditDate.toLocaleTimeString()}`
              : 'No audit has been run yet'}
          </p>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={runSecurityAudit}
          disabled={isLoading}
        >
          <Shield className="w-4 h-4 mr-2" />
          {isLoading ? 'Running Audit...' : 'Run Security Audit'}
        </Button>
      </div>
      
      {vulnerabilities.length > 0 ? (
        <Tabs defaultValue="issues">
          <TabsList className="mb-4">
            <TabsTrigger value="issues">Issues ({vulnerabilities.length})</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>
          
          <TabsContent value="issues">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
                  Vulnerabilities Detected
                </CardTitle>
                <CardDescription>
                  The following security vulnerabilities were found in your RBAC configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Severity</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Resource Type</TableHead>
                      <TableHead className="text-right">Recommendation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vulnerabilities.map((vuln, index) => (
                      <TableRow key={vuln.id || `vuln-${index}`}>
                        <TableCell>
                          <Badge className={getSeverityColor(vuln.severity)}>
                            {vuln.severity.charAt(0).toUpperCase() + vuln.severity.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{vuln.description}</TableCell>
                        <TableCell>{vuln.resourceType}</TableCell>
                        <TableCell className="text-right">{vuln.recommendation}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-end">
                <Button size="sm" variant="outline">
                  Export Report
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="summary">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center">
                  <BarChart className="w-5 h-5 mr-2 text-blue-500" />
                  Security Audit Summary
                </CardTitle>
                <CardDescription>
                  Overview of the RBAC security status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm font-medium text-muted-foreground mb-1">
                        Total Issues
                      </div>
                      <div className="text-2xl font-bold">
                        {vulnerabilities.length}
                      </div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm font-medium text-muted-foreground mb-1">
                        Critical Issues
                      </div>
                      <div className="text-2xl font-bold text-red-500">
                        {vulnerabilities.filter(v => v.severity === 'critical').length}
                      </div>
                    </div>
                  </div>
                  
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Security Recommendations</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1 mt-2">
                        <li>Review and update role assignments regularly</li>
                        <li>Implement least privilege principle</li>
                        <li>Run security audits after making system changes</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Alert className="bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertTitle>No Vulnerabilities Detected</AlertTitle>
          <AlertDescription>
            Your RBAC configuration appears to be secure. Continue to monitor and test regularly.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
