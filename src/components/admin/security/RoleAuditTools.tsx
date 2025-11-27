import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { supabase } from "@/integrations/supabase/client";
import { RoleDiagnosticResult } from "@/types/rbac-monitoring";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { useToast } from "@/hooks/use-toast";
import { addDays, format, subDays } from "date-fns";
import { DateRange } from "react-day-picker";
import {
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  User,
  ShieldAlert,
  Clock,
  ArrowDown,
  TrashIcon,
  Download,
  Shield,
  AlertTriangle,
  XCircle,
  UserCheck,
  CalendarRange
} from "lucide-react";

export interface RoleAssignment {
  id: string;
  user_id: string;
  role: string;
  assigned_at: string;
  assigned_by: string;
  users?: {
    full_name?: string;
    email?: string;
  };
}

interface RoleResult {
  name: string;
}

interface RoleAuditToolsProps {
  onAnomalyDetected: (anomalies: RoleDiagnosticResult[]) => void;
}

const RoleAuditTools: React.FC<RoleAuditToolsProps> = ({ onAnomalyDetected }) => {
  const [activeTab, setActiveTab] = useState("history");
  const [loading, setLoading] = useState(false);
  const [roleHistory, setRoleHistory] = useState<RoleAssignment[]>([]);
  const [diagnosticResults, setDiagnosticResults] = useState<RoleDiagnosticResult[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("");
  const { refreshRoles, performConsistencyCheck } = useAuthRBAC();
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });

  const fetchRoleHistory = useCallback(async () => {
    try {
      setLoading(true);
      
      // This would typically query a view like role_assignments_view or role_audit_logs_view
      // For now, simulate data from user_roles table
      const { data: roleData, error } = await supabase
        .from("user_roles")
        .select(`
          id,
          user_id,
          role_id,
          created_at,
          roles (name)
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        throw error;
      }
      
      // Transform the data to match the RoleAssignment interface
      const formattedRoleHistory: RoleAssignment[] = roleData?.map(item => {
        // Access the role name safely from the roles object
        const roleObj = item.roles as unknown as RoleResult;
        const roleName = roleObj ? roleObj.name : '';
        
        return {
          id: item.id || '',
          user_id: item.user_id || '',
          role: roleName,
          assigned_at: item.created_at || '',
          assigned_by: 'System', // This information might not be available
          users: {
            full_name: 'User ' + item.user_id?.substring(0, 4),
            email: `user-${item.user_id?.substring(0, 4)}@example.com`
          }
        };
      }) || [];

      setRoleHistory(formattedRoleHistory);
      
    } catch (error) {
      console.error("Error fetching role history:", error);
      toast({
        title: "Error",
        description: "Could not load role assignment history.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const runDiagnostics = useCallback(async () => {
    try {
      setLoading(true);
      
      // Use the performConsistencyCheck function from useAuthRBAC
      const results = await performConsistencyCheck();
      
      if (Array.isArray(results)) {
        // Filter out any null or undefined results
        const validResults = results.filter(result => result !== null && result !== undefined);
        setDiagnosticResults(validResults);
        
        // Count issues
        const issuesCount = validResults.filter(r => r && typeof r === 'object' && r.isConsistent === false).length;
        
        // Call the onAnomalyDetected prop if it exists and there are issues
        if (onAnomalyDetected && validResults.length > 0) {
          onAnomalyDetected(validResults);
        }
        
        toast({
          title: "Diagnostic Complete",
          description: `Found ${issuesCount} role configuration issues.`,
          variant: issuesCount > 0 ? "destructive" : "default",
        });
      } else {
        throw new Error("Invalid diagnostic results");
      }
      
    } catch (error) {
      console.error("Error running role diagnostics:", error);
      toast({
        title: "Diagnostic Failed",
        description: "Could not complete role consistency check.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [performConsistencyCheck, toast, onAnomalyDetected]);

  // Filter role history based on search and filter
  const filteredRoleHistory = roleHistory.filter((record) => {
    const matchesSearch =
      searchTerm === "" ||
      record.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.users?.full_name &&
        record.users.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (record.users?.email &&
        record.users.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter =
      filter === "" ||
      record.role.toLowerCase() === filter.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  // Load data on component mount
  useEffect(() => {
    if (activeTab === "history") {
      fetchRoleHistory();
    } else if (activeTab === "diagnostics") {
      runDiagnostics();
    }
  }, [activeTab, fetchRoleHistory, runDiagnostics]);

  // Handle anomaly detection and call the parent component's callback
  useEffect(() => {
    if (diagnosticResults && diagnosticResults.length > 0) {
      onAnomalyDetected(diagnosticResults);
    }
  }, [diagnosticResults, onAnomalyDetected]);

  // Function to handle repairing a user role
  const handleRepairUser = (userId: string) => {
    // In a real implementation, this would call an API to repair the user's role
    toast({
      title: "Repairing user role",
      description: `Attempting to repair role for user ${userId}...`,
    });
    
    // Mock implementation - update the diagnostic results to mark as repaired
    setDiagnosticResults(prev => 
      prev.map(result => 
        result.userId === userId 
          ? { ...result, repaired: true } 
          : result
      )
    );
  };

  // Update rendering of user rows to ensure userId is used properly
  const renderUserRow = (user: RoleDiagnosticResult) => (
    <TableRow key={user.userId}>
      <TableCell className="font-medium">{user.userName || user.userId}</TableCell>
      <TableCell>{user.userEmail || user.userId}</TableCell>
      <TableCell>
        <Badge 
          variant={user.severity === "critical" || user.severity === "high" ? "destructive" : 
                 user.severity === "medium" ? "warning" : "default"}
        >
          {user.severity}
        </Badge>
      </TableCell>
      <TableCell className="max-w-md truncate">{user.issue}</TableCell>
      <TableCell>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleRepairUser(user.userId)}
          disabled={loading}
        >
          Fix
        </Button>
      </TableCell>
    </TableRow>
  );

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="history">Role Assignment History</TabsTrigger>
          <TabsTrigger value="diagnostics">Role Diagnostics</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Role Assignment History</CardTitle>
              <CardDescription>
                Track and audit role changes across the system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative w-full sm:w-auto flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search users or roles..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <DateRangePicker
                  date={dateRange}
                  onDateChange={setDateRange}
                  className="w-full sm:w-auto"
                />

                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="therapist">Therapist</SelectItem>
                    <SelectItem value="patient">Patient</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={fetchRoleHistory}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>

              {filteredRoleHistory.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No role assignments found matching your criteria.
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Assigned</TableHead>
                        <TableHead>Assigned By</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRoleHistory.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>
                            <div className="font-medium">
                              {record.users?.full_name || "Unknown User"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {record.users?.email || record.user_id}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                record.role === "admin"
                                  ? "destructive"
                                  : record.role === "therapist"
                                  ? "default"
                                  : "outline"
                              }
                            >
                              {record.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-mono text-xs">
                              {new Date(record.assigned_at).toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>{record.assigned_by}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagnostics">
          <Card>
            <CardHeader>
              <CardTitle>Role Diagnostics</CardTitle>
              <CardDescription>
                Monitor and audit role assignments across the system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative w-full sm:w-auto flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search users or roles..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="therapist">Therapist</SelectItem>
                    <SelectItem value="patient">Patient</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={runDiagnostics}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Run Diagnostics
                </Button>
              </div>

              {diagnosticResults.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No role diagnostics found matching your criteria.
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Issue</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Suggested Fix</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {diagnosticResults.map((result) => (
                        <TableRow key={(result.userId) + (result.issue || '')}>
                          <TableCell>
                            <div className="font-medium">
                              {result.userName || result.userId || "Unknown User"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {result.userEmail || result.userId}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                result.severity === "high" || result.severity === "critical"
                                  ? "destructive"
                                  : result.severity === "medium"
                                  ? "default"
                                  : "outline"
                              }
                            >
                              {result.severity}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {result.issue}
                          </TableCell>
                          <TableCell>
                            {result.repaired ? (
                              <div className="flex items-center text-green-600">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                <span>Auto-repaired</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-amber-600">
                                <TrashIcon className="h-4 w-4 mr-1" />
                                <span>Needs repair</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {result.suggestedFix || "No fix suggested"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RoleAuditTools;
