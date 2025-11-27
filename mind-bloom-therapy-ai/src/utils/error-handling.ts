
/**
 * Comprehensive error handling utilities for system hardening
 */

interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

interface SafeOperationOptions {
  retries?: number;
  retryDelay?: number;
  fallback?: any;
  context?: ErrorContext;
}

/**
 * Safely execute an async operation with retries and fallback
 */
export async function safeAsyncOperation<T>(
  operation: () => Promise<T>,
  options: SafeOperationOptions = {}
): Promise<T> {
  const { retries = 0, retryDelay = 1000, fallback, context } = options;
  
  let lastError: Error;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Log error with context
      console.error(`[SafeOperation] Attempt ${attempt + 1} failed:`, {
        error: lastError.message,
        context,
        stack: lastError.stack
      });
      
      // If not the last attempt, wait before retrying
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
  
  // All retries failed
  if (fallback !== undefined) {
    console.warn(`[SafeOperation] Using fallback after ${retries + 1} attempts:`, {
      context,
      fallback
    });
    return fallback;
  }
  
  throw lastError!;
}

/**
 * Safely execute a sync operation with error boundary
 */
export function safeSyncOperation<T>(
  operation: () => T,
  fallback: T,
  context?: ErrorContext
): T {
  try {
    return operation();
  } catch (error) {
    console.error('[SafeSyncOperation] Error:', {
      error: error instanceof Error ? error.message : String(error),
      context
    });
    return fallback;
  }
}

/**
 * Create a circuit breaker to prevent cascading failures
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime?: number;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private readonly threshold: number = 5,
    private readonly timeout: number = 60000
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - (this.lastFailureTime || 0) > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
    }
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime
    };
  }
}

/**
 * Rate limiter to prevent abuse
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  constructor(
    private readonly maxRequests: number = 10,
    private readonly windowMs: number = 60000
  ) {}

  isAllowed(key: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Get existing requests for this key
    const keyRequests = this.requests.get(key) || [];
    
    // Filter out old requests
    const recentRequests = keyRequests.filter(time => time > windowStart);
    
    // Check if under limit
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    
    return true;
  }

  getRemainingRequests(key: string): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const keyRequests = this.requests.get(key) || [];
    const recentRequests = keyRequests.filter(time => time > windowStart);
    
    return Math.max(0, this.maxRequests - recentRequests.length);
  }
}

/**
 * Global error boundary for unhandled errors
 */
export function setupGlobalErrorHandling() {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[GlobalErrorHandler] Unhandled promise rejection:', {
      reason: event.reason,
      promise: event.promise
    });
    
    // Log to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error monitoring service
    }
  });

  // Handle global errors
  window.addEventListener('error', (event) => {
    console.error('[GlobalErrorHandler] Global error:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    });
    
    // Log to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error monitoring service
    }
  });
}
