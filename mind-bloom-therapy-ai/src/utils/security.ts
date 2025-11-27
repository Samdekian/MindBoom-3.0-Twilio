
/**
 * Security utilities for production
 */

// CSRF token management
export class CSRFProtection {
  private static token: string | null = null;

  static generateToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    this.token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    return this.token;
  }

  static getToken(): string | null {
    return this.token;
  }

  static validateToken(token: string): boolean {
    return this.token === token;
  }
}

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

// Content Security Policy helpers
export const generateNonce = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
};

// Rate limiting for client-side
export class ClientRateLimit {
  private requests: Map<string, number[]> = new Map();

  isAllowed(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get existing requests for this key
    const keyRequests = this.requests.get(key) || [];
    
    // Filter out old requests
    const recentRequests = keyRequests.filter(time => time > windowStart);
    
    // Check if under limit
    if (recentRequests.length < maxRequests) {
      recentRequests.push(now);
      this.requests.set(key, recentRequests);
      return true;
    }
    
    return false;
  }

  reset(key?: string) {
    if (key) {
      this.requests.delete(key);
    } else {
      this.requests.clear();
    }
  }
}

export const clientRateLimit = new ClientRateLimit();

// Secure session storage
export class SecureStorage {
  private static encrypt(data: string): string {
    // Simple encoding - in production, use proper encryption
    return btoa(data);
  }

  private static decrypt(data: string): string {
    try {
      return atob(data);
    } catch {
      return '';
    }
  }

  static setItem(key: string, value: string): void {
    try {
      sessionStorage.setItem(key, this.encrypt(value));
    } catch (error) {
      console.warn('Failed to store secure item:', error);
    }
  }

  static getItem(key: string): string | null {
    try {
      const item = sessionStorage.getItem(key);
      return item ? this.decrypt(item) : null;
    } catch (error) {
      console.warn('Failed to retrieve secure item:', error);
      return null;
    }
  }

  static removeItem(key: string): void {
    sessionStorage.removeItem(key);
  }

  static clear(): void {
    sessionStorage.clear();
  }
}
