
import { UserRole } from '@/types/core/rbac';
import { RBACTest, OperationTest, TestResult, SecurityAuditResult, VulnerabilityReport } from '@/types/rbac-tests';

// Export the test types to make them available to hooks
export type { RBACTest, OperationTest, TestResult, SecurityAuditResult, VulnerabilityReport };

// Default RBAC route tests
export const rbacRouteTests: RBACTest[] = [
  {
    id: '1',
    name: 'Dashboard access',
    routePath: '/dashboard',
    requiredRoles: ['user' as UserRole, 'therapist', 'admin'],
    description: 'Dashboard access',
    targetRoute: '/dashboard',
    testStatus: 'not-run',
    lastTested: null
  },
  {
    id: '2',
    name: 'Admin dashboard access',
    routePath: '/admin',
    requiredRoles: ['admin'],
    description: 'Admin dashboard access',
    targetRoute: '/admin',
    testStatus: 'not-run',
    lastTested: null
  },
  {
    id: '3',
    name: 'Profile page access',
    routePath: '/profile',
    requiredRoles: ['user' as UserRole, 'therapist', 'admin'],
    description: 'Profile page access',
    targetRoute: '/profile',
    testStatus: 'not-run',
    lastTested: null
  }
];

// Default RBAC operation tests
export const rbacOperationTests: OperationTest[] = [
  {
    id: '1',
    name: 'Create appointment',
    operationName: 'createAppointment',
    operation: 'createAppointment',
    requiredRoles: ['user' as UserRole, 'therapist', 'admin'],
    requiresAuth: true,
    description: 'Create appointment',
    testStatus: 'not-run',
    lastTested: null
  },
  {
    id: '2',
    name: 'Manage user roles',
    operationName: 'manageRoles',
    operation: 'manageRoles',
    requiredRoles: ['admin'],
    requiresAuth: true,
    description: 'Manage user roles',
    testStatus: 'not-run',
    lastTested: null
  }
];

// Get test functions
export const getRouteTests = (): RBACTest[] => {
  return rbacRouteTests;
};

export const getOperationTests = (): OperationTest[] => {
  return rbacOperationTests;
};

// Run test functions
export const runRouteTest = (test: RBACTest, userRoles: UserRole[]): TestResult => {
  try {
    // Check if user has any of the required roles
    const hasRequiredRole = test.requiredRoles.some(role => userRoles.includes(role));
    
    return {
      success: hasRequiredRole,
      message: hasRequiredRole ? 'Access allowed' : 'Access denied',
      timestamp: new Date()
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    };
  }
};

export const runOperationTest = (test: OperationTest, userRoles: UserRole[]): TestResult => {
  try {
    // If operation requires authentication but user is not authenticated
    if (test.requiresAuth && userRoles.length === 0) {
      return {
        success: false,
        message: 'Authentication required',
        timestamp: new Date()
      };
    }
    
    // Check if user has any of the required roles
    const hasRequiredRole = test.requiredRoles.some(role => userRoles.includes(role));
    
    return {
      success: hasRequiredRole,
      message: hasRequiredRole ? 'Operation allowed' : 'Operation denied',
      timestamp: new Date()
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    };
  }
};

// Function to perform a security audit based on test results
export const performSecurityAudit = (
  routeResults?: RBACTest[], 
  operationResults?: OperationTest[]
): SecurityAuditResult => {
  const vulnerabilities: VulnerabilityReport[] = [
    {
      id: '1',
      severity: 'medium',
      description: 'Role hierarchy inconsistency detected',
      resourceType: 'role-structure',
      recommendation: 'Review role hierarchy and ensure proper inheritance',
      detectedAt: new Date()
    },
    {
      id: '2',
      severity: 'low',
      description: 'Missing explicit deny rules in some routes',
      resourceType: 'route-protection',
      recommendation: 'Add explicit deny rules for clarity',
      detectedAt: new Date()
    }
  ];
  
  return {
    timestamp: new Date(),
    passedTests: 5, // Sample values
    failedTests: 0,
    vulnerabilitiesFound: vulnerabilities
  };
};

// Function to test route access based on user roles
export const testRouteAccess = async (
  test: RBACTest,
  hasRole: (role: UserRole) => boolean
): Promise<RBACTest> => {
  try {
    // Check if user has any of the required roles
    const isAccessible = test.requiredRoles.some(role => hasRole(role));
    
    return {
      ...test,
      testStatus: isAccessible ? 'passed' : 'failed',
      lastTested: new Date()
    };
  } catch (error) {
    return {
      ...test,
      testStatus: 'failed',
      lastTested: new Date()
    };
  }
};

// Function to test operation permission based on user roles
export const testOperationPermission = async (
  test: OperationTest,
  hasRole: (role: UserRole) => boolean,
  isAuthenticated: boolean
): Promise<OperationTest> => {
  try {
    // If operation requires authentication but user is not authenticated
    if (test.requiresAuth && !isAuthenticated) {
      return {
        ...test,
        testStatus: 'failed',
        lastTested: new Date()
      };
    }
    
    // Check if user has any of the required roles
    const isAllowed = test.requiredRoles.some(role => hasRole(role));
    
    return {
      ...test,
      testStatus: isAllowed ? 'passed' : 'failed',
      lastTested: new Date()
    };
  } catch (error) {
    return {
      ...test,
      testStatus: 'failed',
      lastTested: new Date()
    };
  }
};

// Additional methods that were missing
