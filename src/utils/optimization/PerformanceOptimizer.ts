// Performance optimization utilities for video sessions
export interface PerformanceSettings {
  adaptiveBitrate: boolean;
  autoQualityAdjustment: boolean;
  maxVideoResolution: '480p' | '720p' | '1080p' | '4K';
  maxFrameRate: 15 | 24 | 30 | 60;
  audioCodec: 'opus' | 'g711' | 'g722';
  videoCodec: 'vp8' | 'vp9' | 'h264' | 'av1';
}

export interface NetworkCondition {
  bandwidth: number; // kbps
  latency: number; // ms
  packetLoss: number; // percentage
  quality: 'poor' | 'fair' | 'good' | 'excellent';
}

export class PerformanceOptimizer {
  private settings: PerformanceSettings;
  private lastNetworkCheck: Date = new Date();
  private networkHistory: NetworkCondition[] = [];

  constructor(initialSettings: Partial<PerformanceSettings> = {}) {
    this.settings = {
      adaptiveBitrate: true,
      autoQualityAdjustment: true,
      maxVideoResolution: '720p',
      maxFrameRate: 30,
      audioCodec: 'opus',
      videoCodec: 'vp8',
      ...initialSettings
    };
  }

  async optimizeForNetwork(currentCondition: NetworkCondition): Promise<PerformanceSettings> {
    this.networkHistory.push(currentCondition);
    
    // Keep only last 10 measurements
    if (this.networkHistory.length > 10) {
      this.networkHistory.shift();
    }

    if (!this.settings.autoQualityAdjustment) {
      return this.settings;
    }

    const optimizedSettings = { ...this.settings };

    // Adjust based on network quality
    switch (currentCondition.quality) {
      case 'poor':
        optimizedSettings.maxVideoResolution = '480p';
        optimizedSettings.maxFrameRate = 15;
        break;
      case 'fair':
        optimizedSettings.maxVideoResolution = '720p';
        optimizedSettings.maxFrameRate = 24;
        break;
      case 'good':
        optimizedSettings.maxVideoResolution = '720p';
        optimizedSettings.maxFrameRate = 30;
        break;
      case 'excellent':
        optimizedSettings.maxVideoResolution = '1080p';
        optimizedSettings.maxFrameRate = 30;
        break;
    }

    // Adjust for high packet loss
    if (currentCondition.packetLoss > 5) {
      optimizedSettings.maxFrameRate = 15;
    }

    this.settings = optimizedSettings;
    return optimizedSettings;
  }

  getRecommendedConstraints(): MediaStreamConstraints {
    const video: MediaTrackConstraints = {
      width: this.getResolutionConstraints().width,
      height: this.getResolutionConstraints().height,
      frameRate: { ideal: this.settings.maxFrameRate }
    };

    const audio: MediaTrackConstraints = {
      sampleRate: 48000,
      channelCount: 1,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    };

    return { video, audio };
  }

  private getResolutionConstraints() {
    switch (this.settings.maxVideoResolution) {
      case '480p':
        return { width: 640, height: 480 };
      case '720p':
        return { width: 1280, height: 720 };
      case '1080p':
        return { width: 1920, height: 1080 };
      case '4K':
        return { width: 3840, height: 2160 };
      default:
        return { width: 1280, height: 720 };
    }
  }

  getOptimalCodecPreferences(): any[] {
    // Return codec preferences based on current settings
    const preferences: any[] = [];
    
    // Add video codecs
    if (this.settings.videoCodec === 'vp8') {
      preferences.push({
        mimeType: 'video/VP8',
        clockRate: 90000
      });
    }

    // Add audio codecs
    if (this.settings.audioCodec === 'opus') {
      preferences.push({
        mimeType: 'audio/opus',
        clockRate: 48000
      });
    }

    return preferences;
  }

  updateSettings(newSettings: Partial<PerformanceSettings>) {
    this.settings = { ...this.settings, ...newSettings };
  }

  getSettings(): PerformanceSettings {
    return { ...this.settings };
  }

  analyzePerformance(): {
    averageLatency: number;
    trendQuality: 'improving' | 'stable' | 'degrading';
    recommendation: string;
  } {
    if (this.networkHistory.length < 2) {
      return {
        averageLatency: 0,
        trendQuality: 'stable',
        recommendation: 'Collecting performance data...'
      };
    }

    const avgLatency = this.networkHistory.reduce((sum, condition) => sum + condition.latency, 0) / this.networkHistory.length;
    
    const recent = this.networkHistory.slice(-3);
    const earlier = this.networkHistory.slice(-6, -3);
    
    const recentAvg = recent.reduce((sum, c) => sum + c.latency, 0) / recent.length;
    const earlierAvg = earlier.length > 0 ? earlier.reduce((sum, c) => sum + c.latency, 0) / earlier.length : recentAvg;
    
    let trendQuality: 'improving' | 'stable' | 'degrading';
    if (recentAvg < earlierAvg * 0.9) {
      trendQuality = 'improving';
    } else if (recentAvg > earlierAvg * 1.1) {
      trendQuality = 'degrading';
    } else {
      trendQuality = 'stable';
    }

    let recommendation = '';
    if (avgLatency > 200) {
      recommendation = 'Consider reducing video quality for better performance';
    } else if (avgLatency < 50) {
      recommendation = 'Network conditions are excellent - you can increase quality';
    } else {
      recommendation = 'Current settings are optimal for your network';
    }

    return {
      averageLatency: avgLatency,
      trendQuality,
      recommendation
    };
  }
}
