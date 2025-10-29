/**
 * Conditional logging utility for development/production environments
 * Automatically disables verbose logs in production to improve performance
 */

const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development';
const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production';

export const logger = {
  /**
   * Log general information (only in development)
   */
  log: (...args: any[]) => {
    if (isDev) {
      console.log(...args);
    }
  },

  /**
   * Log errors (always shown, even in production)
   */
  error: (...args: any[]) => {
    console.error(...args);
  },

  /**
   * Log warnings (only in development)
   */
  warn: (...args: any[]) => {
    if (isDev) {
      console.warn(...args);
    }
  },

  /**
   * Log debug information (only in development)
   */
  debug: (...args: any[]) => {
    if (isDev) {
      console.debug(...args);
    }
  },

  /**
   * Log information messages (only in development)
   */
  info: (...args: any[]) => {
    if (isDev) {
      console.info(...args);
    }
  },

  /**
   * Log a table (only in development)
   */
  table: (data: any) => {
    if (isDev) {
      console.table(data);
    }
  },

  /**
   * Group logs (only in development)
   */
  group: (label: string) => {
    if (isDev) {
      console.group(label);
    }
  },

  /**
   * End log group (only in development)
   */
  groupEnd: () => {
    if (isDev) {
      console.groupEnd();
    }
  },

  /**
   * Force log in production (use sparingly for critical info)
   */
  force: (...args: any[]) => {
    console.log(...args);
  },

  /**
   * Performance timing utility
   */
  time: (label: string) => {
    if (isDev) {
      console.time(label);
    }
  },

  timeEnd: (label: string) => {
    if (isDev) {
      console.timeEnd(label);
    }
  },

  /**
   * Get environment info
   */
  getEnvironment: () => ({
    isDev,
    isProduction,
    mode: import.meta.env.MODE,
  }),
};

// Export for backward compatibility
export default logger;

