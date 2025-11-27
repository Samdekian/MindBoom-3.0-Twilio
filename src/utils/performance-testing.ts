
/**
 * Performance Testing Utilities
 * 
 * Tools for measuring and analyzing application performance metrics.
 */

type PerformanceResult = {
  operationName: string;
  iterations: number;
  totalDuration: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
};

/**
 * Benchmark a function's performance
 * 
 * @param operationName - Name of the operation being tested
 * @param fn - Function to benchmark
 * @param iterations - Number of iterations to run (default: 100)
 * @returns Performance results
 */
export const benchmark = async (
  operationName: string, 
  fn: () => any | Promise<any>,
  iterations: number = 100
): Promise<PerformanceResult> => {
  const durations: number[] = [];
  let totalDuration = 0;
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    
    try {
      // Handle both sync and async functions
      const result = fn();
      if (result instanceof Promise) {
        await result;
      }
    } catch (err) {
      console.error(`Error in iteration ${i}:`, err);
    }
    
    const duration = performance.now() - start;
    durations.push(duration);
    totalDuration += duration;
  }
  
  // Calculate statistics
  const averageDuration = totalDuration / iterations;
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);
  
  const result = {
    operationName,
    iterations,
    totalDuration,
    averageDuration,
    minDuration,
    maxDuration,
  };
  
  // Log results in development
  if (process.env.NODE_ENV === 'development') {
    console.table(result);
  }
  
  return result;
};

/**
 * Time a single operation (useful for ad-hoc performance testing)
 * 
 * @param name - Name of the operation
 * @returns Function to stop timing and log result
 */
export const timeOperation = (name: string) => {
  const start = performance.now();
  
  return () => {
    const duration = performance.now() - start;
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    return duration;
  };
};

/**
 * Monitor component render performance
 * 
 * @param componentName - Name of the component
 * @returns Render monitor object
 */
export const createRenderMonitor = (componentName: string) => {
  let renderCount = 0;
  let lastRenderTime = performance.now();
  
  return {
    onRender: () => {
      const now = performance.now();
      const timeSinceLastRender = now - lastRenderTime;
      renderCount++;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `[Render] ${componentName} rendered ${renderCount} times. ` + 
          `Time since last render: ${timeSinceLastRender.toFixed(2)}ms`
        );
      }
      
      lastRenderTime = now;
      return timeSinceLastRender;
    },
    getRenderStats: () => {
      const now = performance.now();
      const timeSinceLastRender = now - lastRenderTime;
      return {
        componentName,
        renderCount,
        lastRenderTime,
        timeSinceMount: now - lastRenderTime + timeSinceLastRender
      };
    }
  };
};

/**
 * Check if the browser supports specific performance APIs
 */
export const getPerformanceCapabilities = () => {
  if (typeof window === 'undefined') return {};
  
  return {
    supportsUserTiming: !!window.performance?.mark,
    supportsPerformanceObserver: !!window.PerformanceObserver,
    supportsResourceTiming: !!window.performance?.getEntriesByType,
    supportsPaintTiming: !!window.performance?.getEntriesByType('paint').length,
  };
};
