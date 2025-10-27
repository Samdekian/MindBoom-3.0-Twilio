
import React from "react";
import { Helmet } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import RBACTestingDashboard from "@/components/rbac-testing/RBACTestingDashboard";
import RoleProtectedRouteTest from "@/components/rbac-testing/RoleProtectedRouteTest";
import { RBACRouteTestTable } from "@/components/security/RBACRouteTestTable";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { rbacRouteTests, testRouteAccess } from "@/utils/rbac-tester";
import { useState } from "react";
import { TestResult } from "@/types/rbac-tests";
import { useToast } from "@/hooks/use-toast";

const RBACTestPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuthRBAC();
  const [tests, setTests] = useState(rbacRouteTests);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handleRunTest = async (test: any) => {
    setIsLoading(true);
    try {
      const updatedTest = await testRouteAccess(test, hasRole);
      setTests(prev => prev.map(t => t.id === test.id ? updatedTest : t));
      return { success: updatedTest.testStatus === 'passed' } as TestResult;
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "There was an error running the test.",
        variant: "destructive",
      });
      return { success: false, message: "Error running test" } as TestResult;
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRunAllTests = async () => {
    setIsLoading(true);
    try {
      const updatedTests = [];
      
      for (const test of tests) {
        const updatedTest = await testRouteAccess(test, hasRole);
        updatedTests.push(updatedTest);
      }
      
      setTests(updatedTests);
      
      toast({
        title: "Tests Complete",
        description: `${updatedTests.filter(t => t.testStatus === 'passed').length} tests passed, ${updatedTests.filter(t => t.testStatus === 'failed').length} tests failed.`,
      });
    } catch (error) {
      toast({
        title: "Tests Failed",
        description: "There was an error running the tests.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Layout>
      <Helmet>
        <title>RBAC Testing | Security Test Suite</title>
      </Helmet>
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">RBAC Test Suite</h1>
            <p className="text-muted-foreground">
              Comprehensive testing for role-based access control
            </p>
          </div>
          
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
        
        <Tabs defaultValue="route-tests">
          <TabsList>
            <TabsTrigger value="route-tests">Route Tests</TabsTrigger>
            <TabsTrigger value="role-tests">Role Tests</TabsTrigger>
            <TabsTrigger value="dashboard">Test Dashboard</TabsTrigger>
          </TabsList>
          
          <TabsContent value="route-tests" className="mt-6">
            <RBACRouteTestTable
              tests={tests}
              onRunTest={handleRunTest}
              onRunAll={handleRunAllTests}
              isLoading={isLoading}
            />
          </TabsContent>
          
          <TabsContent value="role-tests" className="mt-6">
            <RoleProtectedRouteTest />
          </TabsContent>
          
          <TabsContent value="dashboard" className="mt-6">
            <RBACTestingDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default RBACTestPage;
