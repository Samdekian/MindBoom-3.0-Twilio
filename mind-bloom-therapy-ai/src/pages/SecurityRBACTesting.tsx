import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getRouteTests, getOperationTests } from '@/utils/rbac-tester';
import { RBACTest, OperationTest } from '@/types/rbac-tests';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RBACRouteTestTable } from '@/components/security/RBACRouteTestTable';
import { RBACOperationTestTable } from '@/components/security/RBACOperationTestTable';
import { RBACSecurityReport } from '@/components/security/RBACSecurityReport';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SecurityRBACTesting() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Convert the test arrays to the correct types
  const [routeTests, setRouteTests] = useState<RBACTest[]>(() => {
    const tests = getRouteTests();
    return tests.map(test => ({
      ...test,
      name: test.name || 'Unnamed Test',
      targetRoute: test.routePath,
      testStatus: test.testStatus || 'not-run',
      lastTested: test.lastTested || null
    }));
  });
  
  const [operationTests, setOperationTests] = useState<OperationTest[]>(() => {
    const tests = getOperationTests();
    return tests.map(test => ({
      ...test,
      name: test.name || 'Unnamed Test',
      operation: test.operationName,
      testStatus: test.testStatus || 'not-run',
      lastTested: test.lastTested || null
    }));
  });
  
  // Mock test runner functions for the demo
  const runRouteTest = async () => {
    return {
      success: Math.random() > 0.3,
      message: 'Test completed',
      timestamp: new Date()
    };
  };
  
  const runOperationTest = async () => {
    return {
      success: Math.random() > 0.3,
      message: 'Operation test completed',
      timestamp: new Date()
    };
  };
  
  const handleRunRouteTest = async (test: RBACTest) => {
    const result = await runRouteTest();
    setRouteTests(tests => tests.map(t => 
      t.id === test.id 
        ? { ...t, testStatus: result.success ? 'passed' : 'failed' as const } 
        : t
    ));
    return result;
  };
  
  const handleRunOperationTest = async (test: OperationTest) => {
    const result = await runOperationTest();
    setOperationTests(tests => tests.map(t => 
      t.id === test.id 
        ? { ...t, testStatus: result.success ? 'passed' : 'failed' as const } 
        : t
    ));
    return result;
  };
  
  const handleRunAllRouteTests = async () => {
    // Simulate running all tests
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setRouteTests(tests => tests.map(t => ({ 
      ...t, 
      testStatus: Math.random() > 0.3 ? 'passed' : 'failed' as const 
    })));
  };
  
  const handleRunAllOperationTests = async () => {
    // Simulate running all tests
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setOperationTests(tests => tests.map(t => ({ 
      ...t, 
      testStatus: Math.random() > 0.3 ? 'passed' : 'failed' as const 
    })));
  };
  
  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">RBAC Security Testing</h1>
        <p className="text-gray-500">Tools for verifying RBAC implementation and security</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="routeTests">Route Tests</TabsTrigger>
          <TabsTrigger value="operationTests">Operation Tests</TabsTrigger>
          <TabsTrigger value="securityReport">Security Report</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>RBAC Testing Dashboard</CardTitle>
                <CardDescription>
                  Test and verify your role-based access control implementation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Test Summary</h3>
                    <div className="mt-2 grid grid-cols-2 gap-4">
                      <div className="bg-green-100 p-4 rounded-md text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {routeTests.filter(t => t.testStatus === 'passed').length}
                        </div>
                        <div className="text-sm text-gray-600">Tests Passed</div>
                      </div>
                      <div className="bg-red-100 p-4 rounded-md text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {routeTests.filter(t => t.testStatus === 'failed').length + 
                           operationTests.filter(t => t.testStatus === 'failed').length}
                        </div>
                        <div className="text-sm text-gray-600">Tests Failed</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">Quick Actions</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button onClick={() => setActiveTab('routeTests')}>
                        Route Access Tests
                      </Button>
                      <Button onClick={() => setActiveTab('operationTests')} variant="outline">
                        Operation Tests
                      </Button>
                      <Button onClick={() => setActiveTab('securityReport')} variant="secondary">
                        View Security Report
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Test Configuration</CardTitle>
                <CardDescription>
                  Configure your RBAC testing environment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="testRole">Test as Role</Label>
                    <Select defaultValue="patient">
                      <SelectTrigger id="testRole">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="therapist">Therapist</SelectItem>
                        <SelectItem value="patient">Patient</SelectItem>
                        <SelectItem value="support">Support</SelectItem>
                        <SelectItem value="guest">Guest (No Role)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="testRoute">Test Specific Route</Label>
                    <div className="flex space-x-2">
                      <Input 
                        id="testRoute" 
                        placeholder="/admin/dashboard" 
                        className="flex-1"
                      />
                      <Button variant="outline">Test</Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="testOperation">Test Specific Operation</Label>
                    <div className="flex space-x-2">
                      <Input 
                        id="testOperation" 
                        placeholder="assignRole" 
                        className="flex-1"
                      />
                      <Button variant="outline">Test</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="routeTests" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Route Access Tests</CardTitle>
              <CardDescription>
                Test access control for different routes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RBACRouteTestTable
                tests={routeTests}
                onRunTest={handleRunRouteTest}
                onRunAll={handleRunAllRouteTests}
                isLoading={false}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="operationTests" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Operation Access Tests</CardTitle>
              <CardDescription>
                Test access control for different operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RBACOperationTestTable
                tests={operationTests}
                onRunTest={handleRunOperationTest}
                onRunAll={handleRunAllOperationTests}
                isLoading={false}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="securityReport" className="mt-6">
          <RBACSecurityReport />
        </TabsContent>
      </Tabs>
    </div>
  );
}
