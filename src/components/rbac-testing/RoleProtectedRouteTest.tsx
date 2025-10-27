
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@/types/core/rbac';
import { Check, X, AlertTriangle } from 'lucide-react';

type TestResult = 'pending' | 'pass' | 'fail' | 'error';

interface RouteTest {
  id: string;
  name: string;
  path: string;
  requiredRoles: UserRole[];
  expected: boolean;
  result: TestResult;
}

export const RoleProtectedRouteTest = () => {
  const { roles, hasRole } = useAuthRBAC();
  const navigate = useNavigate();
  const [tests, setTests] = useState<RouteTest[]>([
    {
      id: '1',
      name: 'Admin Dashboard',
      path: '/admin',
      requiredRoles: ['admin'],
      expected: hasRole('admin'),
      result: 'pending'
    },
    {
      id: '2',
      name: 'Therapist Dashboard',
      path: '/therapist',
      requiredRoles: ['therapist'],
      expected: hasRole('therapist'),
      result: 'pending'
    },
    {
      id: '3',
      name: 'Patient Dashboard',
      path: '/patient',
      requiredRoles: ['patient'],
      expected: hasRole('patient'),
      result: 'pending'
    },
    {
      id: '4',
      name: 'Support Dashboard',
      path: '/support',
      requiredRoles: ['support'],
      expected: hasRole('support'),
      result: 'pending'
    }
  ]);
  
  const runTest = async (test: RouteTest) => {
    try {
      // Update the test to running state
      setTests(prev => prev.map(t => 
        t.id === test.id ? {...t, result: 'pending'} : t
      ));
      
      // Simulate testing the route
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check if user has required roles
      const hasAccess = test.requiredRoles.some(role => hasRole(role));
      
      // Update the test result
      setTests(prev => prev.map(t => 
        t.id === test.id ? {...t, result: hasAccess === test.expected ? 'pass' : 'fail'} : t
      ));
    } catch (error) {
      setTests(prev => prev.map(t => 
        t.id === test.id ? {...t, result: 'error'} : t
      ));
    }
  };
  
  const runAllTests = async () => {
    for (const test of tests) {
      await runTest(test);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between">
          <span>Role Protected Route Tests</span>
          <Button variant="outline" size="sm" onClick={runAllTests}>
            Run All Tests
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {tests.map(test => (
            <div key={test.id} className="flex items-center justify-between p-2 border rounded-md">
              <div>
                <span className="font-medium">{test.name}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  {test.path} (Requires {test.requiredRoles.join(' or ')})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {test.result === 'pending' && (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  )}
                  {test.result === 'pass' && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                  {test.result === 'fail' && (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                  {test.result === 'error' && (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => runTest(test)}
                >
                  Test
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RoleProtectedRouteTest;
