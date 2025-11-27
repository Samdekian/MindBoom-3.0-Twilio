
/**
 * Performance Monitoring Service
 * 
 * Tracks key performance metrics for the application to identify
 * potential bottlenecks and areas for optimization.
 */

type PerformanceMetric = {
  name: string;
  startTime: number;
  duration?: number;
  metadata?: Record<string, any>;
};

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private maxMetrics: number = 100; // Maximum number of metrics to store
  private enabled: boolean = true;
  
  private constructor() {
    // Listen for browser performance entries if supported
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Track large layout shifts, long tasks, and resource load times
          if (entry.entryType === 'layout-shift' && (entry as any).value > 0.1) {
            this.trackEvent('large-layout-shift', { value: (entry as any).value });
          }
          
          if (entry.entryType === 'longtask' && entry.duration > 50) {
            this.trackEvent('long-task', { duration: entry.duration });
          }
          
          if (entry.entryType === 'resource' && entry.duration > 1000) {
            this.trackEvent('slow-resource', { 
              url: (entry as PerformanceResourceTiming).name,
              duration: entry.duration
            });
          }
        }
      });
      
      // Observe different performance entry types
      observer.observe({ entryTypes: ['longtask', 'layout-shift', 'resource'] });
    }
    
    // Track page load metrics
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        setTimeout(() => {
          if (window.performance && window.performance.timing) {
            const timing = window.performance.timing;
            const domComplete = timing.domComplete - timing.navigationStart;
            const loadTime = timing.loadEventEnd - timing.navigationStart;
            
            this.trackEvent('page-load', {
              domComplete,
              loadTime,
              domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart
            });
          }
        }, 0);
      });
    }
  }
  
  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  /**
   * Start timing a performance metric
   * @param name - Name of the metric to track
   * @returns A function to stop and record the timing
   */
  public startTiming(name: string): () => (metadata?: Record<string, any>) => void {
    if (!this.enabled) return () => () => {};
    
    const startTime = performance.now();
    
    return () => (metadata?: Record<string, any>) => {
      const duration = performance.now() - startTime;
      this.metrics.push({
        name,
        startTime,
        duration,
        metadata
      });
      
      // Trim old metrics if we have too many
      if (this.metrics.length > this.maxMetrics) {
        this.metrics = this.metrics.slice(-this.maxMetrics);
      }
      
      // Log in development
      if (process.env.NODE_ENV === 'development') {
        console.debug(`[Performance] ${name}: ${duration.toFixed(2)}ms`, metadata);
      }
    };
  }
  
  /**
   * Track a one-time event
   * @param name - Name of the event
   * @param metadata - Additional data to record
   */
  public trackEvent(name: string, metadata?: Record<string, any>): void {
    if (!this.enabled) return;
    
    this.metrics.push({
      name,
      startTime: performance.now(),
      metadata
    });
    
    // Trim old metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
    
    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[Performance] Event: ${name}`, metadata);
    }
  }
  
  /**
   * Get all collected metrics
   */
  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }
  
  /**
   * Clear all stored metrics
   */
  public clearMetrics(): void {
    this.metrics = [];
  }
  
  /**
   * Enable or disable monitoring
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// React hook for performance monitoring
import { useEffect, useRef, useCallback } from 'react';

export function usePerformanceMonitor(componentName: string) {
  const isMounted = useRef(false);
  
  useEffect(() => {
    const startTime = performance.now();
    isMounted.current = true;
    
    return () => {
      if (isMounted.current) {
        const duration = performance.now() - startTime;
        performanceMonitor.trackEvent('component-lifecycle', {
          component: componentName,
          duration,
          type: 'unmount'
        });
      }
    };
  }, [componentName]);
  
  const trackRender = useCallback((reason?: string) => {
    performanceMonitor.trackEvent('component-render', {
      component: componentName,
      reason
    });
  }, [componentName]);
  
  const trackOperation = useCallback((operation: string) => {
    return performanceMonitor.startTiming(`${componentName}-${operation}`);
  }, [componentName]);
  
  return { trackRender, trackOperation };
}
