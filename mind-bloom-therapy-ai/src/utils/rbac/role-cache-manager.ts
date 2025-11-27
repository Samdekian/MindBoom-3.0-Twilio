import { UserRole } from '@/types/core/rbac';
import { Permission } from '@/contexts/AuthRBACContext';

export interface CachedRoleData {
  roles: UserRole[];
  permissions: Permission[];
  timestamp: number;
  version: string;
}

interface CacheOptions {
  ttl: number; // Time to live in milliseconds
  version: string;
  useLocalStorage: boolean;
  useSessionStorage: boolean;
}

const DEFAULT_CACHE_OPTIONS: CacheOptions = {
  ttl: 5 * 60 * 1000, // 5 minutes
  version: "1.0.0",
  useLocalStorage: true,
  useSessionStorage: true
};

// Cache statistics
interface CacheStats {
  hits: number;
  misses: number;
  writes: number;
  expirations: number;
}

/**
 * Manages role and permission caching for improved performance
 */
export class RoleCacheManager {
  private memoryCache: Map<string, CachedRoleData> = new Map();
  private options: CacheOptions;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    writes: 0,
    expirations: 0
  };

  constructor(options: Partial<CacheOptions> = {}) {
    this.options = { ...DEFAULT_CACHE_OPTIONS, ...options };
    
    // Try to load cache stats from storage
    this.loadStats();
  }
  
  /**
   * Get roles and permissions from cache
   */
  public getData(userId: string): { roles: UserRole[]; permissions: Permission[] } | null {
    // Try memory cache first
    const memoryData = this.getFromMemoryCache(userId);
    if (memoryData) {
      this.stats.hits++;
      return memoryData;
    }
    
    // Try session storage
    if (this.options.useSessionStorage) {
      const sessionData = this.getFromSessionStorage(userId);
      if (sessionData) {
        // Add to memory cache for faster access
        this.setInMemoryCache(userId, sessionData.roles, sessionData.permissions);
        this.stats.hits++;
        return sessionData;
      }
    }
    
    // Try local storage
    if (this.options.useLocalStorage) {
      const localData = this.getFromLocalStorage(userId);
      if (localData) {
        // Add to memory and session storage for faster access
        this.setInMemoryCache(userId, localData.roles, localData.permissions);
        if (this.options.useSessionStorage) {
          this.setInSessionStorage(userId, localData.roles, localData.permissions);
        }
        this.stats.hits++;
        return localData;
      }
    }
    
    // Cache miss
    this.stats.misses++;
    return null;
  }
  
  /**
   * Store roles and permissions in cache
   */
  public setData(userId: string, roles: UserRole[], permissions: Permission[]): void {
    // Update memory cache
    this.setInMemoryCache(userId, roles, permissions);
    
    // Update session storage
    if (this.options.useSessionStorage) {
      this.setInSessionStorage(userId, roles, permissions);
    }
    
    // Update local storage
    if (this.options.useLocalStorage) {
      this.setInLocalStorage(userId, roles, permissions);
    }
    
    this.stats.writes++;
    this.saveStats();
  }
  
  /**
   * Clear all cache entries for a user
   */
  public clearUserCache(userId: string): void {
    // Clear memory cache
    this.memoryCache.delete(userId);
    
    // Clear session storage
    if (this.options.useSessionStorage) {
      try {
        sessionStorage.removeItem(`rbac_${userId}`);
      } catch (error) {
        console.error("Error clearing session storage cache:", error);
      }
    }
    
    // Clear local storage
    if (this.options.useLocalStorage) {
      try {
        localStorage.removeItem(`rbac_${userId}`);
      } catch (error) {
        console.error("Error clearing local storage cache:", error);
      }
    }
  }
  
  /**
   * Clear all cache entries
   */
  public clearAllCache(): void {
    // Clear memory cache
    this.memoryCache.clear();
    
    if (typeof window === 'undefined') return;
    
    // Clear session storage
    if (this.options.useSessionStorage) {
      try {
        const keys = Object.keys(sessionStorage);
        for (const key of keys) {
          if (key.startsWith('rbac_')) {
            sessionStorage.removeItem(key);
          }
        }
      } catch (error) {
        console.error("Error clearing session storage cache:", error);
      }
    }
    
    // Clear local storage
    if (this.options.useLocalStorage) {
      try {
        const keys = Object.keys(localStorage);
        for (const key of keys) {
          if (key.startsWith('rbac_')) {
            localStorage.removeItem(key);
          }
        }
      } catch (error) {
        console.error("Error clearing local storage cache:", error);
      }
    }
  }
  
  /**
   * Get cache statistics
   */
  public getStats(): CacheStats {
    return { ...this.stats };
  }
  
  /**
   * Reset cache statistics
   */
  public resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      writes: 0,
      expirations: 0
    };
    this.saveStats();
  }
  
  /**
   * Update cache options
   */
  public setOptions(options: Partial<CacheOptions>): void {
    this.options = { ...this.options, ...options };
  }
  
  // Private helper methods
  private getFromMemoryCache(userId: string): { roles: UserRole[]; permissions: Permission[] } | null {
    const cached = this.memoryCache.get(userId);
    
    if (!cached) return null;
    
    if (this.isExpired(cached.timestamp)) {
      this.memoryCache.delete(userId);
      this.stats.expirations++;
      return null;
    }
    
    return {
      roles: cached.roles,
      permissions: cached.permissions
    };
  }
  
  private setInMemoryCache(userId: string, roles: UserRole[], permissions: Permission[]): void {
    this.memoryCache.set(userId, {
      roles: [...roles],
      permissions: [...permissions],
      timestamp: Date.now(),
      version: this.options.version
    });
  }
  
  private getFromSessionStorage(userId: string): { roles: UserRole[]; permissions: Permission[] } | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const cached = sessionStorage.getItem(`rbac_${userId}`);
      
      if (!cached) return null;
      
      const parsed = JSON.parse(cached) as CachedRoleData;
      
      if (this.isExpired(parsed.timestamp) || parsed.version !== this.options.version) {
        sessionStorage.removeItem(`rbac_${userId}`);
        this.stats.expirations++;
        return null;
      }
      
      return {
        roles: parsed.roles,
        permissions: parsed.permissions
      };
    } catch (error) {
      console.error("Error reading from session storage:", error);
      return null;
    }
  }
  
  private setInSessionStorage(userId: string, roles: UserRole[], permissions: Permission[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      const data: CachedRoleData = {
        roles: [...roles],
        permissions: [...permissions],
        timestamp: Date.now(),
        version: this.options.version
      };
      
      sessionStorage.setItem(`rbac_${userId}`, JSON.stringify(data));
    } catch (error) {
      console.error("Error writing to session storage:", error);
    }
  }
  
  private getFromLocalStorage(userId: string): { roles: UserRole[]; permissions: Permission[] } | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const cached = localStorage.getItem(`rbac_${userId}`);
      
      if (!cached) return null;
      
      const parsed = JSON.parse(cached) as CachedRoleData;
      
      if (this.isExpired(parsed.timestamp) || parsed.version !== this.options.version) {
        localStorage.removeItem(`rbac_${userId}`);
        this.stats.expirations++;
        return null;
      }
      
      return {
        roles: parsed.roles,
        permissions: parsed.permissions
      };
    } catch (error) {
      console.error("Error reading from local storage:", error);
      return null;
    }
  }
  
  private setInLocalStorage(userId: string, roles: UserRole[], permissions: Permission[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      const data: CachedRoleData = {
        roles: [...roles],
        permissions: [...permissions],
        timestamp: Date.now(),
        version: this.options.version
      };
      
      localStorage.setItem(`rbac_${userId}`, JSON.stringify(data));
    } catch (error) {
      console.error("Error writing to local storage:", error);
    }
  }
  
  private isExpired(timestamp: number): boolean {
    return Date.now() - timestamp > this.options.ttl;
  }
  
  private saveStats(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('rbac_cache_stats', JSON.stringify(this.stats));
    } catch (error) {
      console.error("Error saving cache stats:", error);
    }
  }
  
  private loadStats(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const saved = localStorage.getItem('rbac_cache_stats');
      if (saved) {
        this.stats = JSON.parse(saved);
      }
    } catch (error) {
      console.error("Error loading cache stats:", error);
    }
  }
}

// Export singleton instance
export const roleCacheManager = new RoleCacheManager();
