
/**
 * Performance Monitoring Service
 * 
 * This service provides methods to track and measure application performance.
 */

// Configuration
const ENABLE_LOGGING = process.env.NODE_ENV === 'development';
const METRICS_ENDPOINT = '/api/metrics'; // Replace with your metrics endpoint if available

// Initialize performance monitoring
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.timers = new Map();
  }

  /**
   * Start timing a specific operation
   * @param {string} name - The name of the operation to time
   * @returns {Function} A function to call when the operation is complete
   */
  startTiming(name) {
    const start = performance.now();
    
    return (metadata = {}) => {
      const duration = performance.now() - start;
      
      // Log the timing in development
      if (ENABLE_LOGGING) {
        console.log(`⏱️ [Performance] ${name}: ${duration.toFixed(2)}ms`, metadata);
      }
      
      // Store the metric
      if (!this.metrics[name]) {
        this.metrics[name] = [];
      }
      
      this.metrics[name].push({ 
        duration, 
        timestamp: new Date().toISOString(),
        ...metadata
      });
      
      return duration;
    };
  }

  /**
   * Track a specific event that occurred
   * @param {string} eventName - The name of the event
   * @param {Object} metadata - Additional information about the event
   */
  trackEvent(eventName, metadata = {}) {
    const event = {
      name: eventName,
      timestamp: new Date().toISOString(),
      ...metadata
    };
    
    if (ENABLE_LOGGING) {
      console.log(`📊 [Event] ${eventName}`, metadata);
    }
    
    // Store the event
    if (!this.metrics[eventName]) {
      this.metrics[eventName] = [];
    }
    
    this.metrics[eventName].push(event);
  }

  /**
   * Get all collected performance metrics
   * @returns {Object} The collected metrics
   */
  getMetrics() {
    return this.metrics;
  }

  /**
   * Clear all collected metrics
   */
  clearMetrics() {
    this.metrics = {};
  }

  /**
   * Send metrics to a server endpoint
   * @returns {Promise} A promise that resolves when metrics are sent
   */
  async sendMetrics() {
    try {
      const response = await fetch(METRICS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.metrics)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to send metrics: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error sending metrics:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export helper functions for components
export const usePerformanceTracking = (componentName) => {
  const renderTimer = performanceMonitor.startTiming(`${componentName}_render`);
  
  return {
    trackRender: () => renderTimer({ component: componentName }),
    trackEvent: (event, metadata) => 
      performanceMonitor.trackEvent(`${componentName}_${event}`, metadata)
  };
};

// Add the missing hook that PerformanceDashboard is trying to import
export const usePerformanceMonitor = (componentName) => {
  const trackOperation = (operation) => {
    return performanceMonitor.startTiming(`${componentName}-${operation}`);
  };
  
  return {
    trackOperation,
    trackRender: () => {
      const endTimer = performanceMonitor.startTiming(`${componentName}-render`);
      setTimeout(() => endTimer(), 0); // Execute after render completes
    },
    trackEvent: (event, metadata = {}) => {
      performanceMonitor.trackEvent(`${componentName}-${event}`, metadata);
    }
  };
};
