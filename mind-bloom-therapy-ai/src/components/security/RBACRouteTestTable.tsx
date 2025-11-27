import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, MinusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RBACTest, TestResult } from '@/types/rbac-tests';

interface RBACRouteTestTableProps {
  tests: RBACTest[];
  onRunTest: (test: RBACTest) => Promise<TestResult>;
  onRunAll: () => Promise<void>;
  isLoading: boolean;
}

export function RBACRouteTestTable({ 
  tests, 
  onRunTest, 
  onRunAll,
  isLoading 
}: RBACRouteTestTableProps) {
  const getStatusIcon = (status: 'passed' | 'failed' | 'pending' | 'not-run') => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'not-run':
      default:
        return <MinusCircle className="h-4 w-4 text-gray-400" />;
    }
  };
  
  const getStatusBadge = (status: 'passed' | 'failed' | 'pending' | 'not-run') => {
    switch (status) {
      case 'passed':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Passed
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Failed
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pending
          </Badge>
        );
      case 'not-run':
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Not Run
          </Badge>
        );
    }
  };
  
  const handleRunTest = async (test: RBACTest) => {
    try {
      await onRunTest(test);
    } catch (error) {
      console.error(`Error running test ${test.id}:`, error);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Route Access Tests</h3>
        <Button 
          onClick={onRunAll} 
          disabled={isLoading}
          size="sm"
          variant="outline"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Run All Tests
            </>
          )}
        </Button>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Test</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Required Roles</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tests.map((test) => (
              <TableRow key={test.id}>
                <TableCell>
                  <div className="flex items-center">
                    <div className="mr-2">{getStatusIcon(test.testStatus)}</div>
                    <div>
                      <div className="font-medium">{test.name}</div>
                      <div className="text-xs text-gray-500">{test.description}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">{test.targetRoute}</code>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {test.requiredRoles.map((role) => (
                      <Badge key={role} variant="secondary" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(test.testStatus)}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleRunTest(test)}
                    disabled={isLoading}
                  >
                    Run Test
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
