// Session performance metrics collection and analysis
export interface SessionMetrics {
  connectionTime: number;
  audioQuality: number;
  videoQuality: number;
  packetLoss: number;
  jitter: number;
  latency: number;
  bandwidth: {
    upload: number;
    download: number;
  };
  errors: SessionError[];
}

export interface SessionError {
  timestamp: Date;
  type: 'connection' | 'media' | 'signaling' | 'permission';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class SessionMetricsCollector {
  private metrics: SessionMetrics;
  private startTime: number;
  private metricsInterval?: NodeJS.Timeout;

  constructor() {
    this.metrics = {
      connectionTime: 0,
      audioQuality: 0,
      videoQuality: 0,
      packetLoss: 0,
      jitter: 0,
      latency: 0,
      bandwidth: { upload: 0, download: 0 },
      errors: []
    };
    this.startTime = Date.now();
  }

  startCollection() {
    this.metricsInterval = setInterval(() => {
      this.collectRealTimeMetrics();
    }, 5000); // Collect every 5 seconds
  }

  stopCollection() {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
  }

  private async collectRealTimeMetrics() {
    // In a real implementation, this would collect actual WebRTC stats
    // For now, we'll generate mock metrics
    this.metrics.latency = Math.random() * 100;
    this.metrics.packetLoss = Math.random() * 5;
    this.metrics.jitter = Math.random() * 20;
  }

  addError(error: Omit<SessionError, 'timestamp'>) {
    this.metrics.errors.push({
      ...error,
      timestamp: new Date()
    });
  }

  getMetrics(): SessionMetrics {
    return { ...this.metrics };
  }

  getConnectionTime(): number {
    return Date.now() - this.startTime;
  }

  exportMetrics(): string {
    return JSON.stringify(this.metrics, null, 2);
  }
}