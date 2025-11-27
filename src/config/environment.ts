
// Environment configuration for proper dev/prod detection
export const ENVIRONMENT = {
  // More reliable way to detect development vs production
  isDevelopment: () => {
    // Check multiple indicators for development mode
    const isDev = 
      import.meta.env.DEV || 
      import.meta.env.MODE === 'development' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.port === '5173' ||
      window.location.port === '3000';
    
    console.log('Environment detection:', {
      isDev,
      mode: import.meta.env.MODE,
      hostname: window.location.hostname,
      port: window.location.port,
      url: window.location.href
    });
    
    return isDev;
  },
  
  isProduction: () => {
    return !ENVIRONMENT.isDevelopment();
  },
  
  // Get the base URL for the current environment
  getBaseUrl: () => {
    if (ENVIRONMENT.isDevelopment()) {
      return window.location.origin;
    }
    // For production, use the actual deployed URL
    return window.location.origin;
  }
};

// Export individual functions for backward compatibility
export const isDevelopmentMode = ENVIRONMENT.isDevelopment;
export const isProductionMode = ENVIRONMENT.isProduction;
