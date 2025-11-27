
/**
 * Global Cache Service
 * 
 * A centralized caching mechanism for the application to improve performance
 * by storing and retrieving frequently accessed data.
 */

type CacheOptions = {
  ttl: number; // Time to live in milliseconds
};

type CacheItem<T> = {
  value: T;
  expiry: number | null;
};

export class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheItem<any>> = new Map();
  private defaultOptions: CacheOptions = { ttl: 5 * 60 * 1000 }; // 5 minutes default

  private constructor() {
    // Initialize cache cleanup interval
    setInterval(() => this.cleanup(), 60 * 1000); // Run cleanup every minute
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Set a value in the cache
   * @param key - Cache key
   * @param value - Value to cache
   * @param options - Caching options
   */
  public set<T>(key: string, value: T, options?: Partial<CacheOptions>): void {
    const opts = { ...this.defaultOptions, ...options };
    const expiry = opts.ttl ? Date.now() + opts.ttl : null;
    
    this.cache.set(key, { value, expiry });
    
    // Log cache operation in development
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[Cache] Set: ${key}`);
    }
  }

  /**
   * Get a value from the cache
   * @param key - Cache key
   * @returns The cached value or null if not found or expired
   */
  public get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if the item has expired
    if (item.expiry && Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    // Log cache hit in development
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[Cache] Hit: ${key}`);
    }

    return item.value as T;
  }

  /**
   * Check if a key exists in the cache and is not expired
   * @param key - Cache key to check
   */
  public has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    // Check expiration
    if (item.expiry && Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Remove a specific item from the cache
   * @param key - Cache key to remove
   */
  public invalidate(key: string): void {
    this.cache.delete(key);
    
    // Log cache invalidation in development
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[Cache] Invalidate: ${key}`);
    }
  }

  /**
   * Remove all items from the cache
   */
  public clear(): void {
    this.cache.clear();
    
    // Log cache clear in development
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[Cache] Clear all`);
    }
  }

  /**
   * Remove expired items from the cache
   */
  private cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;
    
    this.cache.forEach((item, key) => {
      if (item.expiry && now > item.expiry) {
        this.cache.delete(key);
        cleanedCount++;
      }
    });
    
    // Log cleanup in development
    if (process.env.NODE_ENV === 'development' && cleanedCount > 0) {
      console.debug(`[Cache] Cleaned up ${cleanedCount} expired items`);
    }
  }
}

// Export a singleton instance
export const cacheService = CacheService.getInstance();

// Create a simple hook for components to use the cache
import { useCallback } from 'react';

export function useCache() {
  const getItem = useCallback(<T>(key: string): T | null => {
    return cacheService.get<T>(key);
  }, []);

  const setItem = useCallback(<T>(key: string, value: T, ttl?: number): void => {
    cacheService.set<T>(key, value, ttl ? { ttl } : undefined);
  }, []);

  const invalidateItem = useCallback((key: string): void => {
    cacheService.invalidate(key);
  }, []);

  const clearCache = useCallback((): void => {
    cacheService.clear();
  }, []);

  return {
    getItem,
    setItem,
    invalidateItem,
    clearCache
  };
}
