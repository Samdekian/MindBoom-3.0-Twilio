
/**
 * Simple cache for calendar data to improve performance
 * and reduce duplicate requests
 */
class CalendarDataCache {
  private cache: Map<string, any> = new Map();
  private expiry: Map<string, number> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes
  
  /**
   * Set an item in the cache
   * @param key - Cache key
   * @param data - Data to cache
   * @param ttl - Time to live in milliseconds (optional)
   */
  set(key: string, data: any, ttl?: number): void {
    this.cache.set(key, data);
    const expiryTime = Date.now() + (ttl || this.defaultTTL);
    this.expiry.set(key, expiryTime);
  }
  
  /**
   * Get an item from the cache
   * @param key - Cache key
   * @returns The cached data or null if not found or expired
   */
  get<T = any>(key: string): T | null {
    // Check if key exists and not expired
    if (this.cache.has(key)) {
      const expiryTime = this.expiry.get(key);
      
      if (expiryTime && expiryTime > Date.now()) {
        return this.cache.get(key) as T;
      } else {
        // Expired, remove it
        this.remove(key);
      }
    }
    
    return null;
  }
  
  /**
   * Remove an item from the cache
   * @param key - Cache key
   */
  remove(key: string): void {
    this.cache.delete(key);
    this.expiry.delete(key);
  }
  
  /**
   * Invalidate a specific cache entry
   * @param key - Cache key to invalidate
   */
  invalidate(key: string): void {
    this.remove(key);
  }
  
  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache.clear();
    this.expiry.clear();
  }
  
  /**
   * Purge expired items from the cache
   */
  purgeExpired(): void {
    const now = Date.now();
    
    this.expiry.forEach((expiryTime, key) => {
      if (expiryTime <= now) {
        this.remove(key);
      }
    });
  }
}

export const calendarCache = new CalendarDataCache();
