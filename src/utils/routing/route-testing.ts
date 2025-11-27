
import { UserRole } from '@/types/core/rbac';
import { ROUTE_PATHS, getRoleBasedDashboard } from './unified-route-config';
import { validateRouteAccess } from './route-validator';

export interface RouteTestCase {
  description: string;
  currentPath: string;
  userRoles: UserRole[];
  isAuthenticated: boolean;
  expectedValid: boolean;
  expectedRedirect?: string;
}

/**
 * Comprehensive route test cases for Phase 4 validation
 */
export const routeTestCases: RouteTestCase[] = [
  // Public routes
  {
    description: 'Unauthenticated user can access home page',
    currentPath: '/',
    userRoles: [],
    isAuthenticated: false,
    expectedValid: true
  },
  {
    description: 'Unauthenticated user can access login page',
    currentPath: '/login',
    userRoles: [],
    isAuthenticated: false,
    expectedValid: true
  },
  
  // Authentication redirects
  {
    description: 'Unauthenticated user redirected from protected route',
    currentPath: '/profile',
    userRoles: [],
    isAuthenticated: false,
    expectedValid: false,
    expectedRedirect: '/login'
  },
  
  // Role-based dashboard redirects
  {
    description: 'Admin user redirected to admin dashboard from generic dashboard',
    currentPath: '/dashboard',
    userRoles: ['admin'],
    isAuthenticated: true,
    expectedValid: false,
    expectedRedirect: '/admin'
  },
  {
    description: 'Therapist user redirected to therapist dashboard from generic dashboard',
    currentPath: '/dashboard',
    userRoles: ['therapist'],
    isAuthenticated: true,
    expectedValid: false,
    expectedRedirect: '/therapist'
  },
  {
    description: 'Patient user redirected to patient dashboard from generic dashboard',
    currentPath: '/dashboard',
    userRoles: ['patient'],
    isAuthenticated: true,
    expectedValid: false,
    expectedRedirect: '/patient'
  },
  
  // Role access validation
  {
    description: 'Admin can access admin routes',
    currentPath: '/admin',
    userRoles: ['admin'],
    isAuthenticated: true,
    expectedValid: true
  },
  {
    description: 'Non-admin cannot access admin routes',
    currentPath: '/admin',
    userRoles: ['patient'],
    isAuthenticated: true,
    expectedValid: false,
    expectedRedirect: '/patient'
  },
  {
    description: 'Therapist can access therapist routes',
    currentPath: '/therapist',
    userRoles: ['therapist'],
    isAuthenticated: true,
    expectedValid: true
  },
  {
    description: 'Patient cannot access therapist routes',
    currentPath: '/therapist',
    userRoles: ['patient'],
    isAuthenticated: true,
    expectedValid: false,
    expectedRedirect: '/patient'
  }
];

/**
 * Runs all route test cases and returns results
 */
export function runRouteTests(): { passed: number; failed: number; results: any[] } {
  const results = routeTestCases.map(testCase => {
    const validation = validateRouteAccess(
      testCase.currentPath,
      testCase.userRoles,
      testCase.isAuthenticated
    );
    
    const passed = validation.isValid === testCase.expectedValid &&
      (!testCase.expectedRedirect || validation.expectedPath === testCase.expectedRedirect);
    
    return {
      ...testCase,
      passed,
      actualValid: validation.isValid,
      actualRedirect: validation.expectedPath,
      errors: validation.errors
    };
  });
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.length - passed;
  
  return {
    passed,
    failed,
    results
  };
}

/**
 * Console-friendly test runner for development
 */
export function logRouteTestResults(): void {
  console.group('🧪 Route Architecture Validation Tests');
  
  const { passed, failed, results } = runRouteTests();
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${results.length}`);
  
  if (failed > 0) {
    console.group('Failed Tests:');
    results.filter(r => !r.passed).forEach(test => {
      console.log(`❌ ${test.description}`);
      console.log(`   Expected: ${test.expectedValid ? 'Valid' : 'Invalid'} ${test.expectedRedirect ? `-> ${test.expectedRedirect}` : ''}`);
      console.log(`   Actual: ${test.actualValid ? 'Valid' : 'Invalid'} ${test.actualRedirect ? `-> ${test.actualRedirect}` : ''}`);
    });
    console.groupEnd();
  }
  
  console.groupEnd();
}
