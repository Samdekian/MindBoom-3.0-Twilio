import { useState, useEffect, useCallback, useRef } from 'react';
import { ConnectionQualityMetrics } from './useConnectionQualityMonitor';

export interface VideoConstraints {
  width: number;
  height: number;
  frameRate: number;
  bitrate?: number;
}

export interface AdaptationConfig {
  enableAdaptation: boolean;
  minQuality: VideoConstraints;
  maxQuality: VideoConstraints;
  adaptationThresholds: {
    excellent: number; // score threshold
    good: number;
    fair: number;
    poor: number;
  };
  enableAudioFallback: boolean;
  fallbackThreshold: number; // score below which to suggest audio-only
}

export interface NetworkAdaptationState {
  currentConstraints: VideoConstraints;
  adaptationLevel: 'max' | 'high' | 'medium' | 'low' | 'audio-only';
  isAdapting: boolean;
  lastAdaptation: Date | null;
  adaptationReason: string;
}

const DEFAULT_CONFIG: AdaptationConfig = {
  enableAdaptation: true,
  minQuality: { width: 320, height: 240, frameRate: 15 },
  maxQuality: { width: 1280, height: 720, frameRate: 30 },
  adaptationThresholds: {
    excellent: 85,
    good: 70,
    fair: 50,
    poor: 30
  },
  enableAudioFallback: true,
  fallbackThreshold: 25
};

const QUALITY_PRESETS: Record<string, VideoConstraints> = {
  'max': { width: 1280, height: 720, frameRate: 30 },
  'high': { width: 960, height: 540, frameRate: 30 },
  'medium': { width: 640, height: 480, frameRate: 24 },
  'low': { width: 320, height: 240, frameRate: 15 }
};

interface UseNetworkAdaptationOptions {
  onQualityChange?: (constraints: VideoConstraints) => Promise<boolean>;
  onAudioOnlyMode?: (enable: boolean) => Promise<boolean>;
  config?: Partial<AdaptationConfig>;
  cooldownMs?: number; // Minimum time between adaptations
}

export function useNetworkAdaptation({
  onQualityChange,
  onAudioOnlyMode,
  config: userConfig = {},
  cooldownMs = 10000 // 10 seconds cooldown
}: UseNetworkAdaptationOptions) {
  const config = { ...DEFAULT_CONFIG, ...userConfig };
  
  const [adaptationState, setAdaptationState] = useState<NetworkAdaptationState>({
    currentConstraints: config.maxQuality,
    adaptationLevel: 'max',
    isAdapting: false,
    lastAdaptation: null,
    adaptationReason: 'Initial quality'
  });

  const [isAudioOnlyMode, setIsAudioOnlyMode] = useState(false);
  const [adaptationHistory, setAdaptationHistory] = useState<Array<{
    timestamp: Date;
    from: string;
    to: string;
    reason: string;
    score: number;
  }>>([]);

  const cooldownRef = useRef<NodeJS.Timeout | null>(null);

  const determineOptimalQuality = useCallback((quality: ConnectionQualityMetrics): {
    level: NetworkAdaptationState['adaptationLevel'];
    constraints: VideoConstraints;
    reason: string;
  } => {
    const { score, packetLoss, rtt, bandwidth } = quality;

    // Check for audio-only fallback
    if (config.enableAudioFallback && score < config.fallbackThreshold) {
      return {
        level: 'audio-only',
        constraints: config.minQuality,
        reason: `Very poor connection (score: ${score}) - audio-only recommended`
      };
    }

    // Determine quality level based on score and specific metrics
    let level: NetworkAdaptationState['adaptationLevel'] = 'max';
    let reason = '';

    if (score >= config.adaptationThresholds.excellent && packetLoss < 0.5 && rtt < 100) {
      level = 'max';
      reason = 'Excellent connection quality';
    } else if (score >= config.adaptationThresholds.good && packetLoss < 2 && rtt < 200) {
      level = 'high';
      reason = 'Good connection - slight reduction for stability';
    } else if (score >= config.adaptationThresholds.fair && packetLoss < 5) {
      level = 'medium';
      reason = 'Fair connection - reducing quality for reliability';
    } else if (score >= config.adaptationThresholds.poor) {
      level = 'low';
      reason = 'Poor connection - minimum video quality';
    } else {
      level = 'audio-only';
      reason = 'Connection too poor for reliable video';
    }

    // Apply additional constraints based on specific metrics
    if (rtt > 300 && level !== 'audio-only') {
      level = 'low';
      reason = 'High latency detected - using low quality';
    }

    if (packetLoss > 8 && level !== 'audio-only') {
      level = 'low';
      reason = 'High packet loss - using minimum quality';
    }

    return {
      level,
      constraints: QUALITY_PRESETS[level] || config.minQuality,
      reason: `${reason} (Score: ${score}, RTT: ${rtt}ms, Loss: ${packetLoss.toFixed(1)}%)`
    };
  }, [config]);

  const adaptQuality = useCallback(async (qualityMetrics: ConnectionQualityMetrics): Promise<boolean> => {
    if (!config.enableAdaptation || adaptationState.isAdapting) {
      return false;
    }

    // Check cooldown period
    if (adaptationState.lastAdaptation) {
      const timeSinceLastAdaptation = Date.now() - adaptationState.lastAdaptation.getTime();
      if (timeSinceLastAdaptation < cooldownMs) {
        console.log(`⏳ [NetworkAdaptation] Cooldown active (${Math.round((cooldownMs - timeSinceLastAdaptation) / 1000)}s remaining)`);
        return false;
      }
    }

    const optimal = determineOptimalQuality(qualityMetrics);
    const currentLevel = adaptationState.adaptationLevel;

    // Don't adapt if already at optimal level
    if (optimal.level === currentLevel) {
      return false;
    }

    console.log(`📊 [NetworkAdaptation] Adapting from ${currentLevel} to ${optimal.level}: ${optimal.reason}`);

    setAdaptationState(prev => ({ ...prev, isAdapting: true }));

    try {
      let success = false;

      // Handle audio-only mode
      if (optimal.level === 'audio-only') {
        if (!isAudioOnlyMode) {
          success = await onAudioOnlyMode?.(true) ?? false;
          if (success) {
            setIsAudioOnlyMode(true);
          }
        }
      } else {
        // Disable audio-only mode if active
        if (isAudioOnlyMode) {
          await onAudioOnlyMode?.(false);
          setIsAudioOnlyMode(false);
        }

        // Apply new video constraints
        success = await onQualityChange?.(optimal.constraints) ?? false;
      }

      if (success) {
        const now = new Date();
        
        setAdaptationState({
          currentConstraints: optimal.constraints,
          adaptationLevel: optimal.level,
          isAdapting: false,
          lastAdaptation: now,
          adaptationReason: optimal.reason
        });

        // Add to history
        setAdaptationHistory(prev => [
          ...prev.slice(-9), // Keep last 10 entries
          {
            timestamp: now,
            from: currentLevel,
            to: optimal.level,
            reason: optimal.reason,
            score: qualityMetrics.score
          }
        ]);

        return true;
      } else {
        console.warn('⚠️ [NetworkAdaptation] Failed to apply quality changes');
        setAdaptationState(prev => ({ ...prev, isAdapting: false }));
        return false;
      }
    } catch (error) {
      console.error('❌ [NetworkAdaptation] Error during adaptation:', error);
      setAdaptationState(prev => ({ ...prev, isAdapting: false }));
      return false;
    }
  }, [config.enableAdaptation, adaptationState.isAdapting, adaptationState.lastAdaptation, adaptationState.adaptationLevel, cooldownMs, determineOptimalQuality, isAudioOnlyMode, onAudioOnlyMode, onQualityChange]);

  const forceQualityLevel = useCallback(async (level: NetworkAdaptationState['adaptationLevel']): Promise<boolean> => {
    if (level === 'audio-only') {
      return await onAudioOnlyMode?.(true) ?? false;
    }

    const constraints = QUALITY_PRESETS[level];
    if (!constraints) return false;

    const success = await onQualityChange?.(constraints) ?? false;
    
    if (success) {
      setAdaptationState({
        currentConstraints: constraints,
        adaptationLevel: level,
        isAdapting: false,
        lastAdaptation: new Date(),
        adaptationReason: `Manual override to ${level}`
      });

      if (isAudioOnlyMode) {
        await onAudioOnlyMode?.(false);
        setIsAudioOnlyMode(false);
      }
    }

    return success;
  }, [onQualityChange, onAudioOnlyMode, isAudioOnlyMode]);

  const resetToMaxQuality = useCallback(async (): Promise<boolean> => {
    return await forceQualityLevel('max');
  }, [forceQualityLevel]);

  const toggleAdaptation = useCallback((enabled: boolean) => {
    config.enableAdaptation = enabled;
    console.log(`🔧 [NetworkAdaptation] Adaptation ${enabled ? 'enabled' : 'disabled'}`);
  }, [config]);

  const getAdaptationSuggestion = useCallback((qualityMetrics: ConnectionQualityMetrics): string => {
    const optimal = determineOptimalQuality(qualityMetrics);
    
    if (optimal.level === adaptationState.adaptationLevel) {
      return 'Current quality is optimal for your connection';
    }

    return `Consider switching to ${optimal.level} quality: ${optimal.reason}`;
  }, [determineOptimalQuality, adaptationState.adaptationLevel]);

  // Clear cooldown on unmount
  useEffect(() => {
    return () => {
      if (cooldownRef.current) {
        clearTimeout(cooldownRef.current);
      }
    };
  }, []);

  return {
    // State
    adaptationState,
    isAudioOnlyMode,
    adaptationHistory,
    
    // Controls
    adaptQuality,
    forceQualityLevel,
    resetToMaxQuality,
    toggleAdaptation,
    
    // Info
    getAdaptationSuggestion,
    determineOptimalQuality,
    
    // Config
    config
  };
}