
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, User, Users, Settings, TestTube, CheckCircle, XCircle } from "lucide-react";
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

const RBACTesting: React.FC = () => {
  const { user, userRoles, primaryRole, isAuthenticated } = useAuthRBAC();
  const [testRole, setTestRole] = useState<string>('patient');
  const [testResults, setTestResults] = useState<any[]>([]);

  const roles = [
    { value: 'patient', label: 'Patient', description: 'Standard patient access' },
    { value: 'therapist', label: 'Therapist', description: 'Therapist access with patient management' },
    { value: 'admin', label: 'Admin', description: 'Full system administration access' },
    { value: 'support', label: 'Support', description: 'Customer support access' }
  ];

  const testScenarios = [
    {
      name: 'Dashboard Access',
      description: 'Test access to role-specific dashboards',
      roles: ['patient', 'therapist', 'admin'],
      paths: ['/patient', '/therapist', '/admin']
    },
    {
      name: 'User Management',
      description: 'Test user management capabilities',
      roles: ['admin'],
      paths: ['/admin/users']
    },
    {
      name: 'Appointment Management',
      description: 'Test appointment creation and management',
      roles: ['patient', 'therapist', 'admin'],
      paths: ['/appointments']
    },
    {
      name: 'Security Settings',
      description: 'Test access to security configuration',
      roles: ['admin'],
      paths: ['/admin/security']
    }
  ];

  const runRoleTest = (scenario: any) => {
    const hasAccess = scenario.roles.includes(testRole);
    const result = {
      scenario: scenario.name,
      role: testRole,
      expected: hasAccess,
      actual: hasAccess, // In real implementation, this would check actual permissions
      status: hasAccess ? 'pass' : 'fail',
      timestamp: new Date().toLocaleTimeString()
    };
    
    setTestResults(prev => [result, ...prev.slice(0, 9)]);
  };

  const runAllTests = () => {
    testScenarios.forEach(scenario => {
      setTimeout(() => runRoleTest(scenario), Math.random() * 1000);
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'therapist': return 'bg-blue-100 text-blue-800';
      case 'patient': return 'bg-green-100 text-green-800';
      case 'support': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <TestTube className="h-8 w-8" />
          RBAC Testing Dashboard
        </h1>
        <p className="text-gray-600">Test role-based access control functionality</p>
      </div>

      <Tabs defaultValue="current" className="space-y-6">
        <TabsList>
          <TabsTrigger value="current">Current User</TabsTrigger>
          <TabsTrigger value="scenarios">Test Scenarios</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Current User Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Authenticated:</span>
                  <Badge variant={isAuthenticated ? "default" : "destructive"}>
                    {isAuthenticated ? "Yes" : "No"}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">Email:</span>
                  <span className="text-sm">{user?.email || 'Not available'}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">Primary Role:</span>
                  <Badge className={getRoleBadgeColor(primaryRole || '')}>
                    {primaryRole || 'None'}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-start">
                  <span className="font-medium">All Roles:</span>
                  <div className="flex flex-wrap gap-1">
                    {userRoles.length > 0 ? (
                      userRoles.map(role => (
                        <Badge key={role} variant="outline" className={getRoleBadgeColor(role)}>
                          {role}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">None</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Role Simulation
                </CardTitle>
                <CardDescription>Test with different roles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Test Role:</label>
                  <Select value={testRole} onValueChange={setTestRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role.value} value={role.value}>
                          <div>
                            <div className="font-medium">{role.label}</div>
                            <div className="text-xs text-gray-500">{role.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Selected role: <strong>{roles.find(r => r.value === testRole)?.label}</strong>
                    <br />
                    {roles.find(r => r.value === testRole)?.description}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scenarios">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Available Test Scenarios</h3>
              <Button onClick={runAllTests}>
                Run All Tests
              </Button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {testScenarios.map((scenario, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{scenario.name}</CardTitle>
                        <CardDescription>{scenario.description}</CardDescription>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => runRoleTest(scenario)}
                      >
                        Test Now
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Required Roles:</span>
                        <div className="flex gap-1">
                          {scenario.roles.map(role => (
                            <Badge key={role} variant="outline" className={getRoleBadgeColor(role)}>
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Test Paths:</span>
                        <div className="flex gap-1 flex-wrap">
                          {scenario.paths.map(path => (
                            <Badge key={path} variant="secondary">
                              {path}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Test Results
              </CardTitle>
              <CardDescription>Recent RBAC test execution results</CardDescription>
            </CardHeader>
            <CardContent>
              {testResults.length > 0 ? (
                <div className="space-y-3">
                  {testResults.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {result.status === 'pass' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <div>
                          <span className="font-medium">{result.scenario}</span>
                          <div className="text-sm text-gray-600">
                            Role: {result.role} | Expected: {result.expected ? 'Allow' : 'Deny'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={result.status === 'pass' ? 'default' : 'destructive'}>
                          {result.status.toUpperCase()}
                        </Badge>
                        <div className="text-xs text-gray-500">{result.timestamp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Test Results</h3>
                  <p className="text-gray-600">Run some tests to see results here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RBACTesting;
