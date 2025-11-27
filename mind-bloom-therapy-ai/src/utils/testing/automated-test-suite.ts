import { runAllTests, TestResult } from './video-conference-testing';
import { supabase } from '@/integrations/supabase/client';

export interface AutomatedTestSuite {
  id: string;
  name: string;
  tests: AutomatedTest[];
  runAll: () => Promise<AutomatedTestResults>;
}

export interface AutomatedTest {
  id: string;
  name: string;
  description: string;
  run: () => Promise<TestResult>;
  category: 'critical' | 'important' | 'optional';
}

export interface AutomatedTestResults {
  suiteId: string;
  timestamp: Date;
  results: Record<string, TestResult>;
  summary: {
    total: number;
    passed: number;
    failed: number;
    passRate: number;
    criticalFailures: string[];
  };
}

// Permission validation test
const runPermissionValidationTest = async (): Promise<TestResult> => {
  try {
    // Test camera permission state
    const cameraPermission = await navigator.permissions?.query({ name: 'camera' as PermissionName });
    const micPermission = await navigator.permissions?.query({ name: 'microphone' as PermissionName });
    
    const permissions = {
      camera: cameraPermission?.state || 'unknown',
      microphone: micPermission?.state || 'unknown'
    };
    
    const hasRequiredPermissions = Object.values(permissions).every(
      state => state === 'granted' || state === 'prompt'
    );
    
    return {
      passed: hasRequiredPermissions,
      message: `Permission states: Camera ${permissions.camera}, Microphone ${permissions.microphone}`,
      details: { permissions }
    };
  } catch (error) {
    return {
      passed: false,
      message: 'Permission validation failed',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
};

// Health monitoring system test
const runHealthMonitoringTest = async (): Promise<TestResult> => {
  try {
    // Test health check endpoint
    const { data, error } = await supabase.functions.invoke('system-health');
    
    if (error) {
      return {
        passed: false,
        message: 'Health monitoring endpoint failed',
        details: { error: error.message }
      };
    }
    
    const healthData = data as any;
    const isHealthy = healthData?.status === 'healthy' || healthData?.status === 'degraded';
    
    return {
      passed: isHealthy,
      message: `Health monitoring: ${healthData?.status || 'unknown'}`,
      details: { healthData }
    };
  } catch (error) {
    return {
      passed: false,
      message: 'Health monitoring test error',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
};

// Session creation and validation test
const runSessionValidationTest = async (): Promise<TestResult> => {
  try {
    // Test instant session creation
    const { data, error } = await supabase
      .from('instant_sessions')
      .insert({
        session_name: 'Test Session',
        therapist_id: 'test-therapist-id',
        max_duration_minutes: 60
      })
      .select()
      .single();
    
    if (error) {
      return {
        passed: false,
        message: 'Session creation failed',
        details: { error: error.message }
      };
    }
    
    // Clean up test session
    await supabase
      .from('instant_sessions')
      .delete()
      .eq('id', data.id);
    
    return {
      passed: true,
      message: 'Session validation passed',
      details: { sessionId: data.id }
    };
  } catch (error) {
    return {
      passed: false,
      message: 'Session validation error',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
};

// Define test suite
export const videoConferenceTestSuite: AutomatedTestSuite = {
  id: 'video-conference-suite',
  name: 'Video Conference Comprehensive Test Suite',
  tests: [
    {
      id: 'basic-tests',
      name: 'Basic System Tests',
      description: 'Network, browser, and media device compatibility',
      run: async () => {
        const results = await runAllTests();
        const allPassed = Object.values(results).every(r => r.passed);
        return {
          passed: allPassed,
          message: `Basic tests: ${Object.values(results).filter(r => r.passed).length}/${Object.values(results).length} passed`,
          details: results
        };
      },
      category: 'critical'
    },
    {
      id: 'permission-validation',
      name: 'Permission Validation',
      description: 'Validate media permissions and access states',
      run: runPermissionValidationTest,
      category: 'critical'
    },
    {
      id: 'health-monitoring',
      name: 'Health Monitoring System',
      description: 'Test health monitoring endpoints and data collection',
      run: runHealthMonitoringTest,
      category: 'important'
    },
    {
      id: 'session-validation',
      name: 'Session Management',
      description: 'Test session creation and validation flows',
      run: runSessionValidationTest,
      category: 'critical'
    }
  ],
  runAll: async function(): Promise<AutomatedTestResults> {
    console.log('[AutomatedTestSuite] Starting comprehensive test suite...');
    const startTime = performance.now();
    
    const results: Record<string, TestResult> = {};
    
    // Run all tests in parallel for efficiency
    const testPromises = this.tests.map(async (test) => {
      try {
        const result = await test.run();
        results[test.id] = result;
        console.log(`[AutomatedTestSuite] ${test.name}: ${result.passed ? 'PASS' : 'FAIL'}`);
      } catch (error) {
        results[test.id] = {
          passed: false,
          message: 'Test execution failed',
          details: {
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        };
        console.error(`[AutomatedTestSuite] ${test.name}: ERROR`, error);
      }
    });
    
    await Promise.all(testPromises);
    
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    
    // Calculate summary
    const total = this.tests.length;
    const passed = Object.values(results).filter(r => r.passed).length;
    const failed = total - passed;
    const passRate = Math.round((passed / total) * 100);
    
    // Identify critical failures
    const criticalFailures = this.tests
      .filter(test => test.category === 'critical' && !results[test.id]?.passed)
      .map(test => test.name);
    
    const summary = {
      total,
      passed,
      failed,
      passRate,
      criticalFailures
    };
    
    console.log(`[AutomatedTestSuite] Complete in ${duration}ms: ${passed}/${total} passed (${passRate}%)`);
    if (criticalFailures.length > 0) {
      console.warn('[AutomatedTestSuite] Critical failures:', criticalFailures);
    }
    
    return {
      suiteId: this.id,
      timestamp: new Date(),
      results,
      summary
    };
  }
};

// Export individual test runners for selective testing
export {
  runPermissionValidationTest,
  runHealthMonitoringTest,
  runSessionValidationTest
};