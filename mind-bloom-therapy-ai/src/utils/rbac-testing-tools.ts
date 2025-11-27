
import { renderHook } from '@testing-library/react-hooks';
import React from 'react';
import { render } from '@testing-library/react';

/**
 * Test if a component renders efficiently without unnecessary re-renders
 */
export function testComponentRenders(
  componentName: string,
  renderComponent: () => JSX.Element,
  updateProps: () => void,
  maxRenders = 2
) {
  // Create a counter for renders
  let renderCount = 0;
  
  // Create a wrapped component to track renders
  const TrackedComponent = () => {
    renderCount++;
    return renderComponent();
  };
  
  // Initial render
  const { rerender } = render(React.createElement(TrackedComponent));
  
  // Update props
  updateProps();
  
  // Re-render
  rerender(React.createElement(TrackedComponent));
  
  // Determine if the component is optimized
  const isOptimized = renderCount <= maxRenders;
  
  return {
    componentName,
    renderCount,
    isOptimized,
  };
}

/**
 * Test toast system performance
 */
export function testToastPerformance(
  showToast: () => void,
  iterations = 3
) {
  const times: number[] = [];
  
  // Measure toast rendering times
  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    showToast();
    const endTime = performance.now();
    times.push(endTime - startTime);
  }
  
  // Calculate stats
  const totalTime = times.reduce((sum, time) => sum + time, 0);
  const averageTime = totalTime / times.length;
  
  return {
    times,
    averageTime,
    totalTime,
    iterations,
  };
}

/**
 * Test hook performance
 */
export function testHookPerformance<T>(
  hookName: string,
  useTestHook: () => T,
  performAction: (hook: T) => Promise<void> | void
) {
  // Skip test when running in browser environment
  if (typeof window !== 'undefined' && !window.process) {
    console.info('Hook performance test skipped in browser environment');
    return {
      hookName,
      initialRenderTime: 0,
      actionTime: 0,
      skipped: true
    };
  }

  // Measure initial render time
  const startRender = performance.now();
  const { result } = renderHook(() => useTestHook());
  const endRender = performance.now();
  
  // Measure action time - wrap in try/catch to prevent errors in browser
  let actionTime = 0;
  try {
    const startAction = performance.now();
    performAction(result.current);
    const endAction = performance.now();
    actionTime = endAction - startAction;
  } catch (err) {
    console.warn('Error in hook performance test:', err);
  }
  
  return {
    hookName,
    initialRenderTime: endRender - startRender,
    actionTime,
  };
}

/**
 * Test access control for RBAC components with different roles
 */
export function testRbacComponentAccess<T extends Element>(
  renderWithRole: (role: string | null) => { 
    isAccessGranted: boolean;
    output: T;
  },
  roles: string[]
) {
  // Skip test when running in browser environment
  if (typeof window !== 'undefined' && !window.process) {
    console.info('RBAC component access test skipped in browser environment');
    return { skipped: true };
  }

  const results: Record<string, { isAccessGranted: boolean; output: T }> = {};
  
  // Test with each role
  roles.forEach(role => {
    results[role] = renderWithRole(role);
  });
  
  // Test with no role
  results.no_role = renderWithRole(null);
  
  return results;
}
