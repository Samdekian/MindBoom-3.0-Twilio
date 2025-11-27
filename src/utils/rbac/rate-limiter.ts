
/**
 * Simple in-memory rate limiter for RBAC operations
 */
class RBACRateLimiter {
  private operations: Map<string, { count: number, resetTime: number }> = new Map();
  private maxOperations: number = 10;
  private windowMs: number = 60 * 1000; // 1 minute
  
  /**
   * Check if an operation is allowed
   * @param operationKey Unique key for the operation
   * @returns True if the operation is allowed, false if rate limited
   */
  isAllowed(operationKey: string): boolean {
    const now = Date.now();
    const record = this.operations.get(operationKey);
    
    // If no record or window expired, create new record
    if (!record || now > record.resetTime) {
      this.operations.set(operationKey, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return true;
    }
    
    // Check if limit exceeded
    if (record.count >= this.maxOperations) {
      return false;
    }
    
    // Increment count
    record.count += 1;
    this.operations.set(operationKey, record);
    return true;
  }
  
  /**
   * Set rate limit parameters
   * @param maxOperations Maximum operations allowed in window
   * @param windowMs Window size in milliseconds
   */
  setLimits(maxOperations: number, windowMs: number): void {
    this.maxOperations = maxOperations;
    this.windowMs = windowMs;
  }
  
  /**
   * Reset rate limit for a specific operation
   * @param operationKey Operation key to reset
   */
  reset(operationKey: string): void {
    this.operations.delete(operationKey);
  }
  
  /**
   * Reset all rate limits
   */
  resetAll(): void {
    this.operations.clear();
  }
  
  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.operations.entries()) {
      if (now > record.resetTime) {
        this.operations.delete(key);
      }
    }
  }
  
  /**
   * Start automatic cleanup at intervals
   */
  startPeriodicCleanup(intervalMs: number = 60000): NodeJS.Timeout {
    return setInterval(() => this.cleanup(), intervalMs);
  }
}

// Export singleton instance
export const rbacRateLimiter = new RBACRateLimiter();
