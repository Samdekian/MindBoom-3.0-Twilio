/**
 * Enhanced input validation and sanitization utilities
 * Part of Phase 2: Authentication and Input Security
 */

import { z } from 'zod';

// XSS Protection - Enhanced sanitization
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    // Remove HTML tags more comprehensively
    .replace(/<[^>]*>/g, '')
    // Remove javascript: and data: protocols
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    // Remove event handlers more comprehensively
    .replace(/on\w+\s*=/gi, '')
    // Remove potential script content
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    // Remove common XSS vectors
    .replace(/expression\s*\(/gi, '')
    .replace(/eval\s*\(/gi, '')
    .replace(/setTimeout\s*\(/gi, '')
    .replace(/setInterval\s*\(/gi, '')
    .trim();
};

// SQL Injection Protection - Input validation schemas
export const secureInputSchemas = {
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(100).regex(/^[a-zA-Z\s\-'\.]+$/),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]{10,15}$/),
  message: z.string().min(1).max(5000),
  sessionId: z.string().uuid(),
  userId: z.string().uuid(),
  notes: z.string().max(10000),
  appointmentId: z.string().uuid(),
  // Therapy-specific validations
  therapyGoals: z.string().max(2000),
  symptoms: z.string().max(2000),
  medications: z.string().max(1000),
  medicalHistory: z.string().max(3000),
};

// Validate and sanitize user input
export function validateAndSanitize<T>(
  input: unknown,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: string } {
  try {
    // First sanitize if it's a string
    let processedInput = input;
    if (typeof input === 'string') {
      processedInput = sanitizeInput(input);
    } else if (typeof input === 'object' && input !== null) {
      // Recursively sanitize object properties
      processedInput = sanitizeObject(input as Record<string, unknown>);
    }

    const result = schema.safeParse(processedInput);
    
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return {
        success: false,
        error: `Validation failed: ${result.error.errors.map(e => e.message).join(', ')}`
      };
    }
  } catch (error) {
    return {
      success: false,
      error: 'Invalid input format'
    };
  }
}

// Recursively sanitize object properties
function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeInput(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

// Rate limiting for sensitive operations
export class SecurityRateLimit {
  private attempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;
  private readonly blockDurationMs: number;

  constructor(maxAttempts = 5, windowMs = 15 * 60 * 1000, blockDurationMs = 30 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.blockDurationMs = blockDurationMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return true;
    }

    // Check if we're still in the blocking period
    if (record.count >= this.maxAttempts) {
      if (now - record.lastAttempt < this.blockDurationMs) {
        return false; // Still blocked
      } else {
        // Reset after block period
        this.attempts.set(identifier, { count: 1, lastAttempt: now });
        return true;
      }
    }

    // Check if we're in a new window
    if (now - record.lastAttempt > this.windowMs) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return true;
    }

    // Increment count in current window
    record.count++;
    record.lastAttempt = now;
    
    return record.count <= this.maxAttempts;
  }

  recordFailedAttempt(identifier: string): void {
    const now = Date.now();
    const record = this.attempts.get(identifier) || { count: 0, lastAttempt: now };
    record.count++;
    record.lastAttempt = now;
    this.attempts.set(identifier, record);
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

// Create rate limiters for different operations
export const authRateLimit = new SecurityRateLimit(5, 15 * 60 * 1000, 30 * 60 * 1000); // 5 attempts per 15min, 30min block
export const passwordResetRateLimit = new SecurityRateLimit(3, 60 * 60 * 1000, 60 * 60 * 1000); // 3 attempts per hour
export const sessionCreationRateLimit = new SecurityRateLimit(10, 60 * 60 * 1000, 30 * 60 * 1000); // 10 sessions per hour

// Password strength validation
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password must be less than 128 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

// CSRF Protection
export class CSRFProtection {
  private static token: string | null = null;

  static generateToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    this.token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    
    // Store in session storage for validation
    try {
      sessionStorage.setItem('csrf_token', this.token);
    } catch (error) {
      console.warn('Failed to store CSRF token:', error);
    }
    
    return this.token;
  }

  static getToken(): string | null {
    if (!this.token) {
      try {
        this.token = sessionStorage.getItem('csrf_token');
      } catch (error) {
        console.warn('Failed to retrieve CSRF token:', error);
      }
    }
    return this.token;
  }

  static validateToken(token: string): boolean {
    const storedToken = this.getToken();
    return storedToken === token && token.length === 64;
  }

  static clearToken(): void {
    this.token = null;
    try {
      sessionStorage.removeItem('csrf_token');
    } catch (error) {
      console.warn('Failed to clear CSRF token:', error);
    }
  }
}

export default {
  sanitizeInput,
  validateAndSanitize,
  secureInputSchemas,
  SecurityRateLimit,
  authRateLimit,
  passwordResetRateLimit,
  sessionCreationRateLimit,
  passwordSchema,
  CSRFProtection,
};