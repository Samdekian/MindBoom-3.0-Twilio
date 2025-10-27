// Core Connection Pool with Health Monitoring and Circuit Breaker
import { supabase } from '@/integrations/supabase/client';

export interface ConnectionHealth {
  id: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'dead';
  lastPing: number;
  pingLatency: number;
  consecutiveFailures: number;
  createdAt: number;
  lastActivity: number;
}

export interface ConnectionMetrics {
  totalConnections: number;
  activeConnections: number;
  queuedRequests: number;
  averageLatency: number;
  errorRate: number;
  circuitBreakerState: 'closed' | 'open' | 'half-open';
}

export class ConnectionPool {
  private static instance: ConnectionPool;
  private connections = new Map<string, any>();
  private healthMap = new Map<string, ConnectionHealth>();
  private circuitBreaker = {
    state: 'closed' as 'closed' | 'open' | 'half-open',
    failures: 0,
    lastFailure: 0,
    timeout: 30000, // 30s
    threshold: 5
  };
  private metrics: ConnectionMetrics = {
    totalConnections: 0,
    activeConnections: 0,
    queuedRequests: 0,
    averageLatency: 0,
    errorRate: 0,
    circuitBreakerState: 'closed'
  };
  private heartbeatInterval?: NodeJS.Timeout;
  private retryBudget = new Map<string, { count: number; resetTime: number }>();
  private maxConnections = 3;
  private maxRetryBudget = 5;
  private budgetWindowMs = 60000; // 1 minute

  static getInstance(): ConnectionPool {
    if (!ConnectionPool.instance) {
      ConnectionPool.instance = new ConnectionPool();
    }
    return ConnectionPool.instance;
  }

  private constructor() {
    this.startHealthMonitoring();
    this.startMetricsCollection();
  }

  async getConnection(connectionId: string): Promise<any | null> {
    // Circuit breaker check
    if (this.circuitBreaker.state === 'open') {
      if (Date.now() - this.circuitBreaker.lastFailure > this.circuitBreaker.timeout) {
        this.circuitBreaker.state = 'half-open';
        console.log('🔌 Circuit breaker entering half-open state');
      } else {
        console.warn('🔌 Circuit breaker is open, rejecting connection request');
        return null;
      }
    }

    // Check retry budget
    if (!this.hasRetryBudget(connectionId)) {
      console.warn(`🔌 Retry budget exceeded for ${connectionId}`);
      return null;
    }

    // Reuse existing healthy connection
    const existing = this.connections.get(connectionId);
    const health = this.healthMap.get(connectionId);
    
    if (existing && health?.status === 'healthy') {
      health.lastActivity = Date.now();
      console.log(`🔌 Reusing healthy connection: ${connectionId}`);
      return existing;
    }

    // Check connection limit
    if (this.connections.size >= this.maxConnections) {
      // Try to clean up dead connections first
      this.cleanupDeadConnections();
      
      if (this.connections.size >= this.maxConnections) {
        console.warn(`🔌 Connection limit reached (${this.maxConnections})`);
        this.metrics.queuedRequests++;
        return null;
      }
    }

    // Create new connection
    return this.createConnection(connectionId);
  }

  private async createConnection(connectionId: string): Promise<any | null> {
    try {
      const startTime = Date.now();
      const channel = supabase.channel(connectionId);
      
      this.connections.set(connectionId, channel);
      this.healthMap.set(connectionId, {
        id: connectionId,
        status: 'healthy',
        lastPing: Date.now(),
        pingLatency: 0,
        consecutiveFailures: 0,
        createdAt: Date.now(),
        lastActivity: Date.now()
      });

      this.metrics.totalConnections++;
      this.metrics.activeConnections = this.connections.size;

      // Success - reset circuit breaker
      if (this.circuitBreaker.state === 'half-open') {
        this.circuitBreaker.state = 'closed';
        this.circuitBreaker.failures = 0;
        console.log('🔌 Circuit breaker closed after successful connection');
      }

      console.log(`🔌 Created new connection: ${connectionId} (${Date.now() - startTime}ms)`);
      return channel;
    } catch (error) {
      console.error(`🔌 Failed to create connection ${connectionId}:`, error);
      this.handleConnectionFailure(connectionId);
      return null;
    }
  }

  private handleConnectionFailure(connectionId: string) {
    // Update health status
    const health = this.healthMap.get(connectionId);
    if (health) {
      health.consecutiveFailures++;
      health.status = health.consecutiveFailures > 2 ? 'dead' : 'degraded';
    }

    // Update circuit breaker
    this.circuitBreaker.failures++;
    this.circuitBreaker.lastFailure = Date.now();
    
    if (this.circuitBreaker.failures >= this.circuitBreaker.threshold) {
      this.circuitBreaker.state = 'open';
      console.warn('🔌 Circuit breaker opened due to failures');
    }

    // Consume retry budget
    this.consumeRetryBudget(connectionId);
  }

  private hasRetryBudget(connectionId: string): boolean {
    const now = Date.now();
    const budget = this.retryBudget.get(connectionId);
    
    if (!budget || now > budget.resetTime) {
      this.retryBudget.set(connectionId, {
        count: this.maxRetryBudget,
        resetTime: now + this.budgetWindowMs
      });
      return true;
    }
    
    return budget.count > 0;
  }

  private consumeRetryBudget(connectionId: string) {
    const budget = this.retryBudget.get(connectionId);
    if (budget) {
      budget.count = Math.max(0, budget.count - 1);
    }
  }

  private startHealthMonitoring() {
    this.heartbeatInterval = setInterval(() => {
      this.performHealthChecks();
      this.cleanupDeadConnections();
    }, 10000); // Every 10 seconds
  }

  private async performHealthChecks() {
    const promises = Array.from(this.healthMap.entries()).map(async ([id, health]) => {
      const connection = this.connections.get(id);
      if (!connection) return;

      const startTime = Date.now();
      try {
        // Simple ping - check if channel is still subscribed
        const isHealthy = connection.state === 'joined' || connection.state === 'subscribed';
        const latency = Date.now() - startTime;
        
        health.lastPing = Date.now();
        health.pingLatency = latency;
        
        if (isHealthy) {
          health.consecutiveFailures = 0;
          health.status = 'healthy';
        } else {
          health.consecutiveFailures++;
          health.status = health.consecutiveFailures > 3 ? 'dead' : 'degraded';
        }
      } catch (error) {
        health.consecutiveFailures++;
        health.status = 'dead';
        console.warn(`🔌 Health check failed for ${id}:`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  private cleanupDeadConnections() {
    const now = Date.now();
    const toRemove: string[] = [];

    this.healthMap.forEach((health, id) => {
      const isStale = now - health.lastActivity > 300000; // 5 minutes
      const isDead = health.status === 'dead';
      const hasNoActivity = health.consecutiveFailures > 5;

      if (isStale || isDead || hasNoActivity) {
        toRemove.push(id);
      }
    });

    toRemove.forEach(id => {
      console.log(`🔌 Cleaning up dead connection: ${id}`);
      this.removeConnection(id);
    });
  }

  removeConnection(connectionId: string) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      try {
        supabase.removeChannel(connection);
      } catch (error) {
        console.warn(`🔌 Error removing channel ${connectionId}:`, error);
      }
    }

    this.connections.delete(connectionId);
    this.healthMap.delete(connectionId);
    this.retryBudget.delete(connectionId);
    this.metrics.activeConnections = this.connections.size;
  }

  private startMetricsCollection() {
    setInterval(() => {
      const latencies = Array.from(this.healthMap.values()).map(h => h.pingLatency);
      const totalFailures = Array.from(this.healthMap.values()).reduce((sum, h) => sum + h.consecutiveFailures, 0);
      
      this.metrics = {
        ...this.metrics,
        activeConnections: this.connections.size,
        averageLatency: latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0,
        errorRate: this.healthMap.size > 0 ? totalFailures / this.healthMap.size : 0,
        circuitBreakerState: this.circuitBreaker.state
      };
    }, 5000);
  }

  getMetrics(): ConnectionMetrics {
    return { ...this.metrics };
  }

  getHealthStatus(): ConnectionHealth[] {
    return Array.from(this.healthMap.values());
  }

  cleanup() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    this.connections.forEach((connection, id) => {
      this.removeConnection(id);
    });
    
    this.connections.clear();
    this.healthMap.clear();
    this.retryBudget.clear();
  }
}