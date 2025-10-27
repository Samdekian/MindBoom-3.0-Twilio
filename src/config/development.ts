
import { ENVIRONMENT } from './environment';

// Development mode configuration that works reliably in production
export const isDevelopmentMode = ENVIRONMENT.isDevelopment;

// Development-only features
export const DEV_FEATURES = {
  // Show dev navigation only in development
  showDevNavigation: () => ENVIRONMENT.isDevelopment(),
  
  // Show RBAC testing only in development
  showRBACTesting: () => ENVIRONMENT.isDevelopment(),
  
  // Show debug logs only in development
  enableDebugLogs: () => ENVIRONMENT.isDevelopment(),
  
  // Enable mock data only in development
  enableMockData: () => ENVIRONMENT.isDevelopment(),
  
  // Skip certain validations in development
  skipValidations: () => ENVIRONMENT.isDevelopment()
};

// Production-safe configuration
export const PROD_CONFIG = {
  // Disable console logs in production (except errors)
  enableLogs: (level: 'log' | 'warn' | 'error' = 'log') => {
    if (ENVIRONMENT.isProduction() && level === 'log') {
      return false;
    }
    return true;
  },
  
  // Enable strict mode in production
  strictMode: () => ENVIRONMENT.isProduction(),
  
  // Production error reporting
  enableErrorReporting: () => ENVIRONMENT.isProduction()
};

// Safe console logging that respects environment
export const safeConsole = {
  log: (...args: any[]) => {
    if (PROD_CONFIG.enableLogs('log')) {
      console.log(...args);
    }
  },
  warn: (...args: any[]) => {
    if (PROD_CONFIG.enableLogs('warn')) {
      console.warn(...args);
    }
  },
  error: (...args: any[]) => {
    if (PROD_CONFIG.enableLogs('error')) {
      console.error(...args);
    }
  }
};
