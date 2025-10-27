// WebRTC connection quality monitoring and analytics
export interface ConnectionStats {
  bytesReceived: number;
  bytesSent: number;
  packetsReceived: number;
  packetsSent: number;
  packetsLost: number;
  jitter: number;
  roundTripTime: number;
  availableOutgoingBitrate?: number;
  availableIncomingBitrate?: number;
  connectionState: RTCPeerConnectionState;
  iceConnectionState: RTCIceConnectionState;
  iceGatheringState: RTCIceGatheringState;
}

export interface ConnectionQuality {
  overall: 'excellent' | 'good' | 'fair' | 'poor' | 'disconnected';
  video: 'excellent' | 'good' | 'fair' | 'poor' | 'none';
  audio: 'excellent' | 'good' | 'fair' | 'poor' | 'none';
  network: 'excellent' | 'good' | 'fair' | 'poor' | 'disconnected';
  details: {
    bandwidth: number;
    latency: number;
    packetLoss: number;
    jitter: number;
  };
}

export interface ConnectionEvent {
  timestamp: string;
  userId: string;
  sessionId: string;
  eventType: 'connection_state_change' | 'ice_state_change' | 'quality_change' | 'error';
  data: any;
}

export class ConnectionMonitor {
  private peerConnection: RTCPeerConnection;
  private userId: string;
  private sessionId: string;
  private statsInterval?: NodeJS.Timeout;
  private lastStats?: ConnectionStats;
  private qualityHistory: ConnectionQuality[] = [];
  private eventHandlers: {
    onQualityChange?: (quality: ConnectionQuality) => void;
    onConnectionEvent?: (event: ConnectionEvent) => void;
    onStatsUpdate?: (stats: ConnectionStats) => void;
  } = {};

  constructor(
    peerConnection: RTCPeerConnection,
    userId: string,
    sessionId: string,
    options?: {
      statsInterval?: number;
      onQualityChange?: (quality: ConnectionQuality) => void;
      onConnectionEvent?: (event: ConnectionEvent) => void;
      onStatsUpdate?: (stats: ConnectionStats) => void;
    }
  ) {
    this.peerConnection = peerConnection;
    this.userId = userId;
    this.sessionId = sessionId;
    this.eventHandlers = {
      onQualityChange: options?.onQualityChange,
      onConnectionEvent: options?.onConnectionEvent,
      onStatsUpdate: options?.onStatsUpdate
    };

    this.setupEventListeners();
    this.startStatsCollection(options?.statsInterval || 5000);
  }

  private setupEventListeners(): void {
    this.peerConnection.onconnectionstatechange = () => {
      const event: ConnectionEvent = {
        timestamp: new Date().toISOString(),
        userId: this.userId,
        sessionId: this.sessionId,
        eventType: 'connection_state_change',
        data: {
          state: this.peerConnection.connectionState,
          iceState: this.peerConnection.iceConnectionState
        }
      };
      
      console.log('🔗 [ConnectionMonitor] Connection state change:', event.data);
      this.eventHandlers.onConnectionEvent?.(event);
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      const event: ConnectionEvent = {
        timestamp: new Date().toISOString(),
        userId: this.userId,
        sessionId: this.sessionId,
        eventType: 'ice_state_change',
        data: {
          iceState: this.peerConnection.iceConnectionState,
          connectionState: this.peerConnection.connectionState
        }
      };
      
      console.log('🧊 [ConnectionMonitor] ICE state change:', event.data);
      this.eventHandlers.onConnectionEvent?.(event);

      // Handle connection failures and recovery
      if (this.peerConnection.iceConnectionState === 'failed') {
        this.handleConnectionFailure();
      } else if (this.peerConnection.iceConnectionState === 'connected') {
        this.handleConnectionRecovery();
      }
    };
  }

  private startStatsCollection(interval: number): void {
    this.statsInterval = setInterval(async () => {
      try {
        const stats = await this.collectStats();
        if (stats) {
          this.lastStats = stats;
          this.eventHandlers.onStatsUpdate?.(stats);
          
          const quality = this.calculateQuality(stats);
          this.qualityHistory.push(quality);
          
          // Keep only last 60 quality measurements (5 minutes at 5-second intervals)
          if (this.qualityHistory.length > 60) {
            this.qualityHistory.shift();
          }
          
          this.eventHandlers.onQualityChange?.(quality);
        }
      } catch (error) {
        console.error('❌ [ConnectionMonitor] Error collecting stats:', error);
      }
    }, interval);
  }

  private async collectStats(): Promise<ConnectionStats | null> {
    try {
      const stats = await this.peerConnection.getStats();
      let bytesReceived = 0;
      let bytesSent = 0;
      let packetsReceived = 0;
      let packetsSent = 0;
      let packetsLost = 0;
      let jitter = 0;
      let roundTripTime = 0;
      let availableOutgoingBitrate = 0;
      let availableIncomingBitrate = 0;

      stats.forEach((report) => {
        if (report.type === 'inbound-rtp') {
          bytesReceived += report.bytesReceived || 0;
          packetsReceived += report.packetsReceived || 0;
          packetsLost += report.packetsLost || 0;
          jitter = Math.max(jitter, report.jitter || 0);
        } else if (report.type === 'outbound-rtp') {
          bytesSent += report.bytesSent || 0;
          packetsSent += report.packetsSent || 0;
        } else if (report.type === 'candidate-pair' && report.state === 'succeeded') {
          roundTripTime = Math.max(roundTripTime, report.currentRoundTripTime || 0);
          availableOutgoingBitrate = Math.max(availableOutgoingBitrate, report.availableOutgoingBitrate || 0);
          availableIncomingBitrate = Math.max(availableIncomingBitrate, report.availableIncomingBitrate || 0);
        }
      });

      return {
        bytesReceived,
        bytesSent,
        packetsReceived,
        packetsSent,
        packetsLost,
        jitter,
        roundTripTime,
        availableOutgoingBitrate,
        availableIncomingBitrate,
        connectionState: this.peerConnection.connectionState,
        iceConnectionState: this.peerConnection.iceConnectionState,
        iceGatheringState: this.peerConnection.iceGatheringState
      };
    } catch (error) {
      console.error('❌ [ConnectionMonitor] Failed to collect stats:', error);
      return null;
    }
  }

  private calculateQuality(stats: ConnectionStats): ConnectionQuality {
    // Calculate packet loss percentage
    const totalPackets = stats.packetsReceived + stats.packetsLost;
    const packetLossPercentage = totalPackets > 0 ? (stats.packetsLost / totalPackets) * 100 : 0;

    // Determine network quality based on metrics
    let networkQuality: ConnectionQuality['network'] = 'excellent';
    if (stats.connectionState === 'failed' || stats.iceConnectionState === 'failed') {
      networkQuality = 'disconnected';
    } else if (packetLossPercentage > 5 || stats.roundTripTime > 500) {
      networkQuality = 'poor';
    } else if (packetLossPercentage > 2 || stats.roundTripTime > 200) {
      networkQuality = 'fair';
    } else if (packetLossPercentage > 0.5 || stats.roundTripTime > 100) {
      networkQuality = 'good';
    }

    // Determine video quality (simplified based on bandwidth and network quality)
    let videoQuality: ConnectionQuality['video'] = 'none';
    if (stats.availableOutgoingBitrate && stats.availableIncomingBitrate) {
      const avgBitrate = (stats.availableOutgoingBitrate + stats.availableIncomingBitrate) / 2;
      if (networkQuality === 'disconnected') {
        videoQuality = 'none';
      } else if (avgBitrate > 1000000 && networkQuality === 'excellent') {
        videoQuality = 'excellent';
      } else if (avgBitrate > 500000 && networkQuality !== 'poor') {
        videoQuality = 'good';
      } else if (avgBitrate > 200000) {
        videoQuality = 'fair';
      } else {
        videoQuality = 'poor';
      }
    }

    // Determine audio quality (audio is more resilient than video)
    let audioQuality: ConnectionQuality['audio'] = 'none';
    if (stats.availableOutgoingBitrate && stats.availableIncomingBitrate) {
      if (networkQuality === 'disconnected') {
        audioQuality = 'none';
      } else if (packetLossPercentage > 10) {
        audioQuality = 'poor';
      } else if (packetLossPercentage > 5 || stats.jitter > 50) {
        audioQuality = 'fair';
      } else if (packetLossPercentage > 1 || stats.jitter > 20) {
        audioQuality = 'good';
      } else {
        audioQuality = 'excellent';
      }
    }

    // Overall quality is the worst of video and audio
    let overall: ConnectionQuality['overall'] = 'excellent';
    if (networkQuality === 'disconnected') {
      overall = 'disconnected';
    } else if (videoQuality === 'poor' || audioQuality === 'poor') {
      overall = 'poor';
    } else if (videoQuality === 'fair' || audioQuality === 'fair') {
      overall = 'fair';
    } else if (videoQuality === 'good' || audioQuality === 'good') {
      overall = 'good';
    }

    return {
      overall,
      video: videoQuality,
      audio: audioQuality,
      network: networkQuality,
      details: {
        bandwidth: (stats.availableOutgoingBitrate || 0) + (stats.availableIncomingBitrate || 0),
        latency: stats.roundTripTime * 1000, // Convert to ms
        packetLoss: packetLossPercentage,
        jitter: stats.jitter * 1000 // Convert to ms
      }
    };
  }

  private handleConnectionFailure(): void {
    console.warn('⚠️ [ConnectionMonitor] Connection failed, attempting recovery...');
    
    const event: ConnectionEvent = {
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId,
      eventType: 'error',
      data: {
        type: 'connection_failure',
        state: this.peerConnection.connectionState,
        iceState: this.peerConnection.iceConnectionState
      }
    };
    
    this.eventHandlers.onConnectionEvent?.(event);
  }

  private handleConnectionRecovery(): void {
    console.log('✅ [ConnectionMonitor] Connection recovered');
    
    const event: ConnectionEvent = {
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId,
      eventType: 'connection_state_change',
      data: {
        type: 'connection_recovery',
        state: this.peerConnection.connectionState,
        iceState: this.peerConnection.iceConnectionState
      }
    };
    
    this.eventHandlers.onConnectionEvent?.(event);
  }

  getCurrentStats(): ConnectionStats | null {
    return this.lastStats || null;
  }

  getQualityHistory(): ConnectionQuality[] {
    return [...this.qualityHistory];
  }

  getCurrentQuality(): ConnectionQuality | null {
    return this.qualityHistory[this.qualityHistory.length - 1] || null;
  }

  getAverageQuality(periodMinutes = 5): ConnectionQuality | null {
    const samplesPerMinute = 60 / 5; // 5-second intervals = 12 samples per minute
    const sampleCount = Math.min(periodMinutes * samplesPerMinute, this.qualityHistory.length);
    
    if (sampleCount === 0) return null;
    
    const recentHistory = this.qualityHistory.slice(-sampleCount);
    
    // Calculate averages
    const avgBandwidth = recentHistory.reduce((sum, q) => sum + q.details.bandwidth, 0) / sampleCount;
    const avgLatency = recentHistory.reduce((sum, q) => sum + q.details.latency, 0) / sampleCount;
    const avgPacketLoss = recentHistory.reduce((sum, q) => sum + q.details.packetLoss, 0) / sampleCount;
    const avgJitter = recentHistory.reduce((sum, q) => sum + q.details.jitter, 0) / sampleCount;

    // Determine average overall quality
    const qualityScores = recentHistory.map(q => {
      switch (q.overall) {
        case 'excellent': return 5;
        case 'good': return 4;
        case 'fair': return 3;
        case 'poor': return 2;
        case 'disconnected': return 1;
        default: return 1;
      }
    });
    
    const avgScore = qualityScores.reduce((sum, score) => sum + score, 0) / sampleCount;
    let avgOverall: ConnectionQuality['overall'] = 'poor';
    
    if (avgScore >= 4.5) avgOverall = 'excellent';
    else if (avgScore >= 3.5) avgOverall = 'good';
    else if (avgScore >= 2.5) avgOverall = 'fair';
    else if (avgScore >= 1.5) avgOverall = 'poor';
    else avgOverall = 'disconnected';

    return {
      overall: avgOverall,
      video: recentHistory[recentHistory.length - 1]?.video || 'none',
      audio: recentHistory[recentHistory.length - 1]?.audio || 'none',
      network: recentHistory[recentHistory.length - 1]?.network || 'disconnected',
      details: {
        bandwidth: avgBandwidth,
        latency: avgLatency,
        packetLoss: avgPacketLoss,
        jitter: avgJitter
      }
    };
  }

  destroy(): void {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = undefined;
    }
    
    this.qualityHistory = [];
    console.log('🧹 [ConnectionMonitor] Monitor destroyed');
  }
}
