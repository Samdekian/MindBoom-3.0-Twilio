
import { useRef, useCallback } from 'react';

interface RateLimiterOptions {
  maxRequests: number;
  windowMs: number;
}

export function useRateLimit(options: RateLimiterOptions) {
  const requests = useRef<number[]>([]);

  const isAllowed = useCallback(() => {
    const now = Date.now();
    const windowStart = now - options.windowMs;
    
    // Remove old requests outside the window
    requests.current = requests.current.filter(time => time > windowStart);
    
    // Check if under limit
    if (requests.current.length < options.maxRequests) {
      requests.current.push(now);
      return true;
    }
    
    return false;
  }, [options.maxRequests, options.windowMs]);

  const executeWithLimit = useCallback(async <T>(
    fn: () => Promise<T>
  ): Promise<T> => {
    if (!isAllowed()) {
      throw new Error('Rate limit exceeded');
    }
    
    return fn();
  }, [isAllowed]);

  return {
    isAllowed,
    executeWithLimit
  };
}
