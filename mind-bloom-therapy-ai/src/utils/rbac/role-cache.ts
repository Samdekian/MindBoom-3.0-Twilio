
import { UserRole } from "./types";
import { RBACPerformanceMetrics } from "./types";

/**
 * Cache for storing user roles to reduce database queries
 */
class RoleCache {
  private cache: Map<string, { roles: UserRole[], timestamp: number }> = new Map();
  private maxCacheAge = 5 * 60 * 1000; // 5 minutes
  private metrics = {
    hits: 0,
    misses: 0,
    totalQueries: 0,
    totalSyncAttempts: 0,
    successfulSyncs: 0,
    lastSyncTime: null as Date | null,
    syncDurations: [] as number[]
  };
  
  /**
   * Set roles for a user in the cache
   * @param userId User ID
   * @param roles Array of roles
   */
  setRoles(userId: string, roles: UserRole[]): void {
    this.cache.set(userId, {
      roles: [...roles],
      timestamp: Date.now()
    });
  }
  
  /**
   * Get cached roles for a user if available and not expired
   * @param userId User ID
   * @returns Array of roles or null if not cached or expired
   */
  getRoles(userId: string): UserRole[] | null {
    this.metrics.totalQueries++;
    
    const cached = this.cache.get(userId);
    
    if (!cached) {
      this.metrics.misses++;
      return null;
    }
    
    // Check if cache is expired
    const now = Date.now();
    if (now - cached.timestamp > this.maxCacheAge) {
      this.cache.delete(userId);
      this.metrics.misses++;
      return null;
    }
    
    this.metrics.hits++;
    return [...cached.roles];
  }
  
  /**
   * Record a synchronization attempt
   * @param duration Duration in milliseconds
   * @param success Whether the sync was successful
   */
  recordSync(duration: number, success: boolean): void {
    this.metrics.totalSyncAttempts++;
    if (success) {
      this.metrics.successfulSyncs++;
    }
    this.metrics.lastSyncTime = new Date();
    this.metrics.syncDurations.push(duration);
    
    // Keep only the last 100 sync durations to avoid memory issues
    if (this.metrics.syncDurations.length > 100) {
      this.metrics.syncDurations.shift();
    }
  }
  
  /**
   * Get performance metrics for the role cache
   */
  getMetrics(): RBACPerformanceMetrics {
    const averageDuration = this.metrics.syncDurations.length > 0
      ? this.metrics.syncDurations.reduce((sum, duration) => sum + duration, 0) / this.metrics.syncDurations.length
      : 0;
    
    const successRate = this.metrics.totalSyncAttempts > 0
      ? (this.metrics.successfulSyncs / this.metrics.totalSyncAttempts) * 100
      : 100;
      
    return {
      cacheHits: this.metrics.hits,
      cacheMisses: this.metrics.misses,
      averageSyncDuration: averageDuration,
      totalSyncAttempts: this.metrics.totalSyncAttempts,
      successRate: successRate,
      lastSyncTime: this.metrics.lastSyncTime,
      fetchDuration: 0,
      lastFetchTime: Date.now(),
      roleOperations: {
        successful: this.metrics.successfulSyncs,
        failed: this.metrics.totalSyncAttempts - this.metrics.successfulSyncs
      }
    };
  }
  
  /**
   * Clear cached roles for a user
   * @param userId User ID
   */
  clearRoles(userId: string): void {
    this.cache.delete(userId);
  }
  
  /**
   * Clear all cached roles
   */
  clearAll(): void {
    this.cache.clear();
  }
  
  /**
   * Set cache expiration time
   * @param maxAgeMs Maximum age in milliseconds
   */
  setCacheExpiration(maxAgeMs: number): void {
    if (maxAgeMs < 1000) {
      console.warn("Cache expiration cannot be less than 1000ms");
      maxAgeMs = 1000;
    }
    this.maxCacheAge = maxAgeMs;
  }
}

// Export singleton instance
export const roleCache = new RoleCache();
