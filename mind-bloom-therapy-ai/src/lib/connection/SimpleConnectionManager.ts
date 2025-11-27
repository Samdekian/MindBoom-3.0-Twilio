/**
 * Simple Connection Manager - Replaces complex ConnectionPool
 * Focuses on reliability over complexity
 */

interface SimpleConnection {
  id: string;
  channel: any;
  lastActivity: number;
  retryCount: number;
}

interface ConnectionStatus {
  connected: number;
  total: number;
  errors: number;
}

export class SimpleConnectionManager {
  private static instance: SimpleConnectionManager;
  private connections = new Map<string, SimpleConnection>();
  private maxConnections = 10;
  private maxRetries = 3;
  private retryDelay = 1000;
  private connectionTimeout = 10000;
  private errorCount = 0;

  static getInstance(): SimpleConnectionManager {
    if (!SimpleConnectionManager.instance) {
      SimpleConnectionManager.instance = new SimpleConnectionManager();
    }
    return SimpleConnectionManager.instance;
  }

  async getConnection(connectionId: string): Promise<any> {
    console.log(`[SimpleConnectionManager] Getting connection: ${connectionId}`);
    
    // Check if we already have this connection
    const existing = this.connections.get(connectionId);
    if (existing && existing.channel) {
      existing.lastActivity = Date.now();
      console.log(`[SimpleConnectionManager] Reusing existing connection: ${connectionId}`);
      return existing.channel;
    }

    // Check connection limits
    if (this.connections.size >= this.maxConnections) {
      this.cleanup();
    }

    try {
      // Import supabase here to avoid circular dependencies
      const { supabase } = await import('@/integrations/supabase/client');
      
      console.log(`[SimpleConnectionManager] Creating new channel: ${connectionId}`);
      const channel = supabase.channel(connectionId, {
        config: {
          presence: {
            key: connectionId,
          },
        },
      });

      // Create connection record
      const connection: SimpleConnection = {
        id: connectionId,
        channel,
        lastActivity: Date.now(),
        retryCount: 0,
      };

      this.connections.set(connectionId, connection);
      console.log(`[SimpleConnectionManager] Connection created successfully: ${connectionId}`);
      
      return channel;
    } catch (error) {
      this.errorCount++;
      console.error(`[SimpleConnectionManager] Failed to create connection ${connectionId}:`, error);
      throw error;
    }
  }

  removeConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection?.channel) {
      try {
        connection.channel.unsubscribe();
      } catch (error) {
        console.warn(`[SimpleConnectionManager] Error unsubscribing channel ${connectionId}:`, error);
      }
    }
    this.connections.delete(connectionId);
    console.log(`[SimpleConnectionManager] Connection removed: ${connectionId}`);
  }

  getStatus(): ConnectionStatus {
    const connectedCount = Array.from(this.connections.values()).filter(
      conn => conn.channel && conn.channel.state === 'joined'
    ).length;

    return {
      connected: connectedCount,
      total: this.connections.size,
      errors: this.errorCount,
    };
  }

  cleanup(): void {
    const now = Date.now();
    const staleThreshold = 5 * 60 * 1000; // 5 minutes

    for (const [id, connection] of this.connections.entries()) {
      if (now - connection.lastActivity > staleThreshold) {
        console.log(`[SimpleConnectionManager] Cleaning up stale connection: ${id}`);
        this.removeConnection(id);
      }
    }
  }

  reset(): void {
    console.log(`[SimpleConnectionManager] Resetting all connections`);
    for (const connectionId of this.connections.keys()) {
      this.removeConnection(connectionId);
    }
    this.errorCount = 0;
  }
}