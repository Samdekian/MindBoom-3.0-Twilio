import { supabase } from '@/integrations/supabase/client';

export const FREE_TOKEN_LIMIT = 50;
const STORAGE_KEY = 'mindbloom_chat_tokens';

interface TokenData {
  tokens: number;
  lastReset: number;
}

export class TokenManager {
  private static instance: TokenManager;

  private constructor() {}

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  /**
   * Get remaining tokens for current user (anonymous or authenticated)
   */
  async getRemainingTokens(): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Authenticated user - check database
      return this.getAuthenticatedUserTokens(user.id);
    } else {
      // Anonymous user - check localStorage
      return this.getAnonymousUserTokens();
    }
  }

  /**
   * Consume tokens and persist the change
   */
  async consumeTokens(count: number): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      return this.consumeAuthenticatedTokens(user.id, count);
    } else {
      return this.consumeAnonymousTokens(count);
    }
  }

  /**
   * Reset tokens (called on signup/login)
   */
  async resetTokens(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // For authenticated users, they get unlimited tokens
      // No need to reset anything
    } else {
      // Reset anonymous tokens
      const tokenData: TokenData = {
        tokens: FREE_TOKEN_LIMIT,
        lastReset: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tokenData));
    }
  }

  /**
   * Check if user has tokens available
   */
  async hasTokens(): Promise<boolean> {
    const remaining = await this.getRemainingTokens();
    return remaining > 0;
  }

  /**
   * Get token data for anonymous users from localStorage
   */
  private getAnonymousUserTokens(): number {
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (!stored) {
      // First time user - initialize with free tokens
      const tokenData: TokenData = {
        tokens: FREE_TOKEN_LIMIT,
        lastReset: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tokenData));
      return FREE_TOKEN_LIMIT;
    }

    try {
      const tokenData: TokenData = JSON.parse(stored);
      return Math.max(0, tokenData.tokens);
    } catch (error) {
      console.error('Error parsing token data:', error);
      return 0;
    }
  }

  /**
   * Consume tokens for anonymous users
   */
  private consumeAnonymousTokens(count: number): boolean {
    const remaining = this.getAnonymousUserTokens();
    
    if (remaining < count) {
      return false;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return false;

    try {
      const tokenData: TokenData = JSON.parse(stored);
      tokenData.tokens = Math.max(0, tokenData.tokens - count);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tokenData));
      return true;
    } catch (error) {
      console.error('Error consuming tokens:', error);
      return false;
    }
  }

  /**
   * Get tokens for authenticated users (unlimited)
   */
  private async getAuthenticatedUserTokens(userId: string): Promise<number> {
    // Authenticated users have unlimited tokens
    // Return a large number to indicate unlimited
    return 999999;
  }

  /**
   * Consume tokens for authenticated users (always succeeds)
   */
  private async consumeAuthenticatedTokens(userId: string, count: number): Promise<boolean> {
    // Track usage in database but don't limit
    try {
      await supabase.from('chat_usage').insert({
        user_id: userId,
        tokens_used: count
      });
    } catch (error) {
      console.error('Error tracking token usage:', error);
      // Don't fail the operation if tracking fails
    }
    return true;
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  }
}

// Export singleton instance
export const tokenManager = TokenManager.getInstance();

