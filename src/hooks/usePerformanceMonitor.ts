import React, { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  loadTime: number;
  renderTime: number;
  isSlowDevice: boolean;
}

interface PerformanceConfig {
  enableFPSMonitoring?: boolean;
  enableMemoryMonitoring?: boolean;
  fpsThreshold?: number;
  memoryThreshold?: number;
  reportingInterval?: number;
}

export const usePerformanceMonitor = (config: PerformanceConfig = {}) => {
  const {
    enableFPSMonitoring = true,
    enableMemoryMonitoring = true,
    fpsThreshold = 30,
    memoryThreshold = 50, // MB
    reportingInterval = 5000
  } = config;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    loadTime: 0,
    renderTime: 0,
    isSlowDevice: false
  });

  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const animationRef = useRef<number>();

  // FPS Monitoring
  useEffect(() => {
    if (!enableFPSMonitoring) return;

    const measureFPS = () => {
      frameCount.current++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime.current + 1000) {
        const fps = Math.round((frameCount.current * 1000) / (currentTime - lastTime.current));
        
        setMetrics(prev => ({
          ...prev,
          fps,
          isSlowDevice: fps < fpsThreshold
        }));
        
        frameCount.current = 0;
        lastTime.current = currentTime;
      }
      
      animationRef.current = requestAnimationFrame(measureFPS);
    };

    animationRef.current = requestAnimationFrame(measureFPS);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enableFPSMonitoring, fpsThreshold]);

  // Memory Monitoring
  useEffect(() => {
    if (!enableMemoryMonitoring || !('memory' in performance)) return;

    const measureMemory = () => {
      const memory = (performance as any).memory;
      if (memory) {
        const memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024);
        
        setMetrics(prev => ({
          ...prev,
          memoryUsage
        }));
      }
    };

    const interval = setInterval(measureMemory, reportingInterval);
    measureMemory(); // Initial measurement

    return () => clearInterval(interval);
  }, [enableMemoryMonitoring, reportingInterval]);

  // Load Time Monitoring
  useEffect(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      const loadTime = navigation.loadEventEnd - navigation.fetchStart;
      
      setMetrics(prev => ({
        ...prev,
        loadTime: Math.round(loadTime)
      }));
    }
  }, []);

  // Performance optimization recommendations
  const getOptimizationRecommendations = () => {
    const recommendations: string[] = [];

    if (metrics.fps < fpsThreshold) {
      recommendations.push('Consider reducing animation complexity or frame rate');
    }

    if (metrics.memoryUsage > memoryThreshold) {
      recommendations.push('High memory usage detected - consider cleanup optimizations');
    }

    if (metrics.loadTime > 3000) {
      recommendations.push('Page load time is slow - consider code splitting or lazy loading');
    }

    return recommendations;
  };

  // Performance-based component rendering decisions
  const shouldUseReducedMotion = () => {
    return metrics.isSlowDevice || metrics.fps < fpsThreshold;
  };

  const shouldUseLightweightComponents = () => {
    return metrics.memoryUsage > memoryThreshold || metrics.isSlowDevice;
  };

  return {
    metrics,
    recommendations: getOptimizationRecommendations(),
    shouldUseReducedMotion,
    shouldUseLightweightComponents,
    isSlowDevice: metrics.isSlowDevice
  };
};