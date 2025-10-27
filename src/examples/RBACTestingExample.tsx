
/**
 * Example Component: Testing RBAC Components
 * 
 * This file demonstrates best practices for testing components
 * that use the RBAC system. It shows how to mock the RBAC context
 * and simulate different role scenarios.
 */
import React from 'react';
import { useRBAC } from '@/hooks/useRBAC';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertCircle, Check } from 'lucide-react';

interface Props {
  requiredRole: string;
  children: React.ReactNode;
}

/**
 * Example of a component that uses RBAC for conditional rendering
 */
export const RoleRestrictedContent: React.FC<Props> = ({ requiredRole, children }) => {
  const { hasRole, isLoading } = useRBAC();
  
  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-pulse">Loading role information...</div>
      </div>
    );
  }
  
  if (!hasRole(requiredRole)) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You need the {requiredRole} role to access this content.
        </AlertDescription>
      </Alert>
    );
  }
  
  return <>{children}</>;
};

/**
 * Example of how to test with the RBAC system
 */
export const RBACTestingExample: React.FC = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          RBAC Testing Example
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <section>
          <h3 className="font-medium text-lg mb-2">Testing RBAC Components</h3>
          <p className="text-sm text-muted-foreground">
            This example shows how to test components that use the RBAC system.
          </p>
        </section>
        
        <section className="space-y-4">
          <div className="p-4 border rounded-md bg-muted">
            <h4 className="font-medium">Component Usage:</h4>
            <pre className="text-xs mt-2 overflow-auto">
{`// Example usage of the component:
<RoleRestrictedContent requiredRole="admin">
  <AdminDashboard />
</RoleRestrictedContent>`}
            </pre>
          </div>
          
          <div className="p-4 border rounded-md bg-muted">
            <h4 className="font-medium">Test Example:</h4>
            <pre className="text-xs mt-2 overflow-auto whitespace-pre-wrap">
{`// Example test for RBAC components:
import { render, screen } from '@testing-library/react';
import { RoleRestrictedContent } from './RoleRestrictedContent';

// Mock the RBAC hook
jest.mock('@/hooks/useRBAC', () => ({
  useRBAC: () => ({
    hasRole: (role) => role === 'admin',
    isLoading: false
  })
}));

test('renders content when user has required role', () => {
  render(
    <RoleRestrictedContent requiredRole="admin">
      <div data-testid="admin-content">Admin Content</div>
    </RoleRestrictedContent>
  );
  
  expect(screen.getByTestId('admin-content')).toBeInTheDocument();
});

test('shows access denied when user lacks required role', () => {
  render(
    <RoleRestrictedContent requiredRole="therapist">
      <div>Therapist Content</div>
    </RoleRestrictedContent>
  );
  
  expect(screen.getByText(/Access Denied/i)).toBeInTheDocument();
});`}
            </pre>
          </div>
        </section>
        
        <section>
          <h3 className="font-medium text-lg mb-2">Testing Best Practices</h3>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900">
                <Check className="h-4 w-4 mr-1" />
                Do
              </Badge>
              <span className="text-sm">Mock the entire useRBAC hook for isolated component tests</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900">
                <Check className="h-4 w-4 mr-1" />
                Do
              </Badge>
              <span className="text-sm">Test both authorized and unauthorized states</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900">
                <Check className="h-4 w-4 mr-1" />
                Do
              </Badge>
              <span className="text-sm">Use the IntegrationTestProvider for integration tests</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className="bg-red-100 text-red-800 hover:bg-red-200 hover:text-red-900">
                <AlertCircle className="h-4 w-4 mr-1" />
                Don't
              </Badge>
              <span className="text-sm">Query Supabase directly in component tests</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className="bg-red-100 text-red-800 hover:bg-red-200 hover:text-red-900">
                <AlertCircle className="h-4 w-4 mr-1" />
                Don't
              </Badge>
              <span className="text-sm">Skip testing loading states in RBAC components</span>
            </div>
          </div>
        </section>
      </CardContent>
    </Card>
  );
};

export default RBACTestingExample;
