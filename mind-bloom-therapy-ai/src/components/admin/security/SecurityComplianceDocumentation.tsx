
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Download, Lock, Shield, Download as DownloadIcon, AlertTriangle, Eye, Bell, RefreshCw } from "lucide-react";

interface SecurityDocDefinition {
  id: string;
  title: string;
  description: string;
  lastUpdated: string;
  category: string;
  tags: string[];
  status: 'complete' | 'in-progress' | 'planned';
}

interface SecurityComplianceDocumentationProps {
  onGenerateReport?: () => void;
}

export const SecurityComplianceDocumentation: React.FC<SecurityComplianceDocumentationProps> = ({
  onGenerateReport
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Sample security documentation data
  const securityDocs: SecurityDocDefinition[] = [
    {
      id: "auth-overview",
      title: "Authentication System Overview",
      description: "Comprehensive documentation of the authentication system architecture and components.",
      lastUpdated: "2025-05-01",
      category: "architecture",
      tags: ["authentication", "security", "architecture"],
      status: "complete"
    },
    {
      id: "rbac-implementation",
      title: "Role-Based Access Control Implementation",
      description: "Detailed documentation of the RBAC system implementation, including role definitions and permission mappings.",
      lastUpdated: "2025-04-15",
      category: "architecture",
      tags: ["rbac", "permissions", "security"],
      status: "complete"
    },
    {
      id: "session-management",
      title: "Session Management Policies",
      description: "Documentation of session management policies and practices, including timeout configurations and security measures.",
      lastUpdated: "2025-05-12",
      category: "policies",
      tags: ["sessions", "security"],
      status: "complete"
    },
    {
      id: "security-monitoring",
      title: "Security Monitoring and Alerting",
      description: "Overview of security monitoring systems, alerting thresholds, and response procedures.",
      lastUpdated: "2025-05-10",
      category: "operations",
      tags: ["monitoring", "alerts", "incident-response"],
      status: "complete"
    },
    {
      id: "auth-logs",
      title: "Authentication Event Logging",
      description: "Documentation of authentication event logging implementation and retention policies.",
      lastUpdated: "2025-04-20",
      category: "compliance",
      tags: ["logging", "audit-trail", "compliance"],
      status: "complete"
    },
    {
      id: "2fa-implementation",
      title: "Two-Factor Authentication Implementation",
      description: "Technical documentation of the two-factor authentication implementation and security considerations.",
      lastUpdated: "2025-03-25",
      category: "architecture",
      tags: ["2fa", "mfa", "authentication"],
      status: "complete"
    },
    {
      id: "incident-response",
      title: "Security Incident Response Plan",
      description: "Procedures for responding to security incidents related to authentication and authorization.",
      lastUpdated: "2025-04-30",
      category: "operations",
      tags: ["incident-response", "security"],
      status: "in-progress"
    },
    {
      id: "compliance-mapping",
      title: "Regulatory Compliance Mapping",
      description: "Mapping of authentication and authorization controls to relevant compliance requirements.",
      lastUpdated: "2025-05-08",
      category: "compliance",
      tags: ["hipaa", "compliance", "regulations"],
      status: "in-progress"
    },
    {
      id: "access-review",
      title: "Access Review Procedures",
      description: "Documentation of procedures for conducting regular access reviews and role audits.",
      lastUpdated: "2025-04-10",
      category: "operations",
      tags: ["access-reviews", "compliance", "security"],
      status: "complete"
    },
    {
      id: "security-training",
      title: "Security Awareness Training",
      description: "Security awareness training materials related to authentication and authorization.",
      lastUpdated: "2025-04-05",
      category: "training",
      tags: ["training", "awareness", "security"],
      status: "planned"
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">Security & Compliance Documentation</CardTitle>
            <CardDescription>
              Comprehensive documentation of security controls and compliance requirements
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline"
              className="flex items-center gap-1"
              onClick={onGenerateReport}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Generate Report
            </Button>
            
            <Button 
              variant="default"
              className="flex items-center gap-1"
            >
              <DownloadIcon className="h-4 w-4 mr-1" />
              Export All Docs
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documentation</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="space-y-6">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>Compliance Status</AlertTitle>
                <AlertDescription>
                  Documentation requirements are currently <Badge className="ml-1">93% Complete</Badge>
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Documentation Status</CardTitle>
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex flex-col items-center">
                        <Badge className="mb-1" variant="outline">Complete</Badge>
                        <p className="text-2xl font-bold">
                          {securityDocs.filter(doc => doc.status === 'complete').length}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <Badge className="mb-1" variant="outline">In Progress</Badge>
                        <p className="text-2xl font-bold">
                          {securityDocs.filter(doc => doc.status === 'in-progress').length}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <Badge className="mb-1" variant="outline">Planned</Badge>
                        <p className="text-2xl font-bold">
                          {securityDocs.filter(doc => doc.status === 'planned').length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Compliance Status</CardTitle>
                      <Lock className="h-5 w-5 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>HIPAA</span>
                        <Badge variant="default">Compliant</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>GDPR</span>
                        <Badge variant="outline">In Progress</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>SOC 2</span>
                        <Badge variant="outline">Planned</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Security Audit Status</CardTitle>
                      <Eye className="h-5 w-5 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span>Last Audit</span>
                        <span className="text-sm text-muted-foreground">May 15, 2025</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Findings</span>
                        <span className="text-sm">2 low, 1 medium</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Resolution</span>
                        <Badge variant="outline">In Progress</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Next Audit</span>
                        <span className="text-sm text-muted-foreground">August 15, 2025</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="security-requirements">
                  <AccordionTrigger>Security Requirements</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium">Authentication Requirements</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          The system implements multi-factor authentication capabilities, 
                          password complexity requirements, and secure credential storage 
                          in accordance with industry standards.
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium">Authorization Requirements</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Role-based access control is implemented with principle of least privilege.
                          Regular access reviews are conducted to ensure appropriate permissions.
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium">Audit Requirements</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          All authentication and authorization events are logged with sufficient detail
                          to support security investigations and compliance reporting.
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="compliance-framework">
                  <AccordionTrigger>Compliance Framework</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium">HIPAA Compliance</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Authentication and authorization controls are implemented in accordance with 
                          HIPAA Security Rule requirements for access controls, audit controls, 
                          and person or entity authentication.
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium">GDPR Compliance</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Authentication and authorization systems support GDPR requirements for 
                          data access controls, consent management, and data subject rights.
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="security-monitoring">
                  <AccordionTrigger>Security Monitoring</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium">Alert Thresholds</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Security alerts are configured for authentication anomalies, 
                          excessive failed login attempts, and suspicious role changes.
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium">Incident Response</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Security incidents trigger automated responses and notifications
                          to the security team for investigation and remediation.
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </TabsContent>
          
          <TabsContent value="documents">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">Security Documentation</h3>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive documentation of security controls and procedures
                  </p>
                </div>
                
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-1" />
                  Add Document
                </Button>
              </div>
              
              <Separator />
              
              <div className="border rounded-md">
                <Table>
                  <TableCaption>Complete list of security documentation</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {securityDocs.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">
                          {doc.title}
                          <div className="flex flex-wrap gap-1 mt-1">
                            {doc.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{doc.category}</TableCell>
                        <TableCell>{doc.lastUpdated}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              doc.status === 'complete'
                                ? "default"
                                : doc.status === 'in-progress'
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {doc.status === 'complete'
                              ? 'Complete'
                              : doc.status === 'in-progress'
                              ? 'In Progress'
                              : 'Planned'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Download</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="compliance">
            <div className="space-y-6">
              <Alert className="bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-200">
                <Shield className="h-4 w-4" />
                <AlertTitle>HIPAA Compliance Status: Compliant</AlertTitle>
                <AlertDescription>
                  The authentication and authorization system meets all HIPAA compliance requirements.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">HIPAA Requirements Mapping</h3>
                
                <div className="border rounded-md">
                  <Table>
                    <TableCaption>Mapping of system controls to HIPAA requirements</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>HIPAA Requirement</TableHead>
                        <TableHead>System Control</TableHead>
                        <TableHead>Implementation Status</TableHead>
                        <TableHead>Documentation</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Access Control - Unique User Identification</TableCell>
                        <TableCell>Email-based authentication with unique user accounts</TableCell>
                        <TableCell>
                          <Badge variant="default">Implemented</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="link" size="sm" className="p-0 h-auto">
                            View Documentation
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Access Control - Emergency Access Procedure</TableCell>
                        <TableCell>Admin emergency access workflow with approval process</TableCell>
                        <TableCell>
                          <Badge variant="default">Implemented</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="link" size="sm" className="p-0 h-auto">
                            View Documentation
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Access Control - Automatic Logoff</TableCell>
                        <TableCell>Role-based session timeout implementation</TableCell>
                        <TableCell>
                          <Badge variant="default">Implemented</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="link" size="sm" className="p-0 h-auto">
                            View Documentation
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Audit Controls - Record and Examine Activity</TableCell>
                        <TableCell>Comprehensive audit logging of all authentication events</TableCell>
                        <TableCell>
                          <Badge variant="default">Implemented</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="link" size="sm" className="p-0 h-auto">
                            View Documentation
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Person or Entity Authentication</TableCell>
                        <TableCell>Multi-factor authentication option for all users</TableCell>
                        <TableCell>
                          <Badge variant="default">Implemented</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="link" size="sm" className="p-0 h-auto">
                            View Documentation
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Compliance Reports</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">HIPAA Compliance Report</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-muted-foreground">
                        Comprehensive report on HIPAA Security Rule compliance
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Last generated: May 10, 2025
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm" className="w-full flex items-center gap-1">
                        <Download className="h-4 w-4 mr-1" />
                        Download Report
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Access Control Audit</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-muted-foreground">
                        Audit report of role-based access controls
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Last generated: May 5, 2025
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm" className="w-full flex items-center gap-1">
                        <Download className="h-4 w-4 mr-1" />
                        Download Report
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Authentication Security Report</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-muted-foreground">
                        Security analysis of authentication system
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Last generated: April 28, 2025
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm" className="w-full flex items-center gap-1">
                        <Download className="h-4 w-4 mr-1" />
                        Download Report
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="audit-logs">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">Authentication Audit Logs</h3>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive logs of authentication and authorization activities
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Bell className="h-4 w-4 mr-1" />
                    Configure Alerts
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Export Logs
                  </Button>
                </div>
              </div>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Audit Log Retention</AlertTitle>
                <AlertDescription>
                  Authentication audit logs are retained for 12 months in compliance with regulatory requirements.
                </AlertDescription>
              </Alert>
              
              <div className="border rounded-md">
                <Table>
                  <TableCaption>Recent authentication and authorization events</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Event Type</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="whitespace-nowrap">2025-05-19 14:32:45</TableCell>
                      <TableCell>user_signed_in</TableCell>
                      <TableCell>alice@example.com</TableCell>
                      <TableCell>IP: 192.168.1.25</TableCell>
                      <TableCell>
                        <Badge variant="default">Success</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="whitespace-nowrap">2025-05-19 14:30:12</TableCell>
                      <TableCell>user_signed_in</TableCell>
                      <TableCell>alice@example.com</TableCell>
                      <TableCell>IP: 192.168.1.25</TableCell>
                      <TableCell>
                        <Badge variant="destructive">Failed</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="whitespace-nowrap">2025-05-19 13:45:22</TableCell>
                      <TableCell>role_assignment</TableCell>
                      <TableCell>admin@example.com</TableCell>
                      <TableCell>Target: bob@example.com, Role: therapist</TableCell>
                      <TableCell>
                        <Badge variant="default">Success</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="whitespace-nowrap">2025-05-19 12:18:05</TableCell>
                      <TableCell>user_signed_out</TableCell>
                      <TableCell>bob@example.com</TableCell>
                      <TableCell>Session duration: 1h 24m</TableCell>
                      <TableCell>
                        <Badge variant="default">Success</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="whitespace-nowrap">2025-05-19 11:03:18</TableCell>
                      <TableCell>permission_denied</TableCell>
                      <TableCell>charlie@example.com</TableCell>
                      <TableCell>Resource: patient records, Action: edit</TableCell>
                      <TableCell>
                        <Badge variant="destructive">Denied</Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Showing 5 of 1,547 log entries from the last 30 days
                </p>
                
                <Button variant="outline" size="sm">
                  View All Logs
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="border-t p-6">
        <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
          <p>
            Security documentation last reviewed: May 15, 2025
          </p>
          <p>
            Next scheduled review: August 15, 2025
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SecurityComplianceDocumentation;
