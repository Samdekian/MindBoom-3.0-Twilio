import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface MediaStreamValidationResult {
  isValid: boolean;
  hasActiveVideo: boolean;
  hasActiveAudio: boolean;
  videoTracks: number;
  audioTracks: number;
  errors: string[];
  warnings: string[];
}

export interface MediaStreamHealth {
  overall: 'healthy' | 'degraded' | 'failed';
  video: {
    status: 'active' | 'inactive' | 'missing';
    quality: 'good' | 'poor' | 'unknown';
    resolution?: { width: number; height: number };
    frameRate?: number;
  };
  audio: {
    status: 'active' | 'inactive' | 'missing';
    quality: 'good' | 'poor' | 'unknown';
    sampleRate?: number;
  };
}

export function useMediaStreamValidator() {
  const { toast } = useToast();
  const [streamHealth, setStreamHealth] = useState<MediaStreamHealth>({
    overall: 'failed',
    video: { status: 'missing', quality: 'unknown' },
    audio: { status: 'missing', quality: 'unknown' }
  });

  // Validate media stream integrity
  const validateStream = useCallback((stream: MediaStream | null): MediaStreamValidationResult => {
    const result: MediaStreamValidationResult = {
      isValid: false,
      hasActiveVideo: false,
      hasActiveAudio: false,
      videoTracks: 0,
      audioTracks: 0,
      errors: [],
      warnings: []
    };

    if (!stream) {
      result.errors.push('No media stream provided');
      return result;
    }

    const videoTracks = stream.getVideoTracks();
    const audioTracks = stream.getAudioTracks();

    result.videoTracks = videoTracks.length;
    result.audioTracks = audioTracks.length;

    // Validate video tracks
    if (videoTracks.length > 0) {
      const activeVideoTracks = videoTracks.filter(track => 
        track.readyState === 'live' && track.enabled
      );
      
      result.hasActiveVideo = activeVideoTracks.length > 0;
      
      if (activeVideoTracks.length === 0) {
        if (videoTracks.some(track => track.readyState === 'ended')) {
          result.errors.push('Video tracks have ended');
        } else {
          result.warnings.push('Video tracks are not active');
        }
      }
    } else {
      result.warnings.push('No video tracks found');
    }

    // Validate audio tracks
    if (audioTracks.length > 0) {
      const activeAudioTracks = audioTracks.filter(track => 
        track.readyState === 'live' && track.enabled
      );
      
      result.hasActiveAudio = activeAudioTracks.length > 0;
      
      if (activeAudioTracks.length === 0) {
        if (audioTracks.some(track => track.readyState === 'ended')) {
          result.errors.push('Audio tracks have ended');
        } else {
          result.warnings.push('Audio tracks are not active');
        }
      }
    } else {
      result.warnings.push('No audio tracks found');
    }

    // Stream is valid if it has at least one active track
    result.isValid = result.hasActiveVideo || result.hasActiveAudio;

    // Log comprehensive validation result
    console.log('🔍 [MediaStreamValidator] Stream validation:', {
      streamId: stream.id,
      active: stream.active,
      videoTracks: videoTracks.map(track => ({
        id: track.id,
        readyState: track.readyState,
        enabled: track.enabled,
        kind: track.kind,
        label: track.label
      })),
      audioTracks: audioTracks.map(track => ({
        id: track.id,
        readyState: track.readyState,
        enabled: track.enabled,
        kind: track.kind,
        label: track.label
      })),
      result
    });

    return result;
  }, []);

  // Get detailed stream health information
  const analyzeStreamHealth = useCallback(async (stream: MediaStream | null): Promise<MediaStreamHealth> => {
    const health: MediaStreamHealth = {
      overall: 'failed',
      video: { status: 'missing', quality: 'unknown' },
      audio: { status: 'missing', quality: 'unknown' }
    };

    if (!stream) {
      return health;
    }

    const videoTracks = stream.getVideoTracks();
    const audioTracks = stream.getAudioTracks();

    // Analyze video health
    if (videoTracks.length > 0) {
      const videoTrack = videoTracks[0];
      health.video.status = videoTrack.readyState === 'live' && videoTrack.enabled ? 'active' : 'inactive';
      
      // Get video capabilities if available
      const settings = videoTrack.getSettings();
      if (settings.width && settings.height) {
        health.video.resolution = { width: settings.width, height: settings.height };
        health.video.quality = settings.width >= 640 && settings.height >= 480 ? 'good' : 'poor';
      }
      if (settings.frameRate) {
        health.video.frameRate = settings.frameRate;
      }
    }

    // Analyze audio health
    if (audioTracks.length > 0) {
      const audioTrack = audioTracks[0];
      health.audio.status = audioTrack.readyState === 'live' && audioTrack.enabled ? 'active' : 'inactive';
      
      const settings = audioTrack.getSettings();
      if (settings.sampleRate) {
        health.audio.sampleRate = settings.sampleRate;
        health.audio.quality = settings.sampleRate >= 44100 ? 'good' : 'poor';
      }
    }

    // Determine overall health
    const hasActiveVideo = health.video.status === 'active';
    const hasActiveAudio = health.audio.status === 'active';

    if (hasActiveVideo && hasActiveAudio) {
      health.overall = 'healthy';
    } else if (hasActiveVideo || hasActiveAudio) {
      health.overall = 'degraded';
    } else {
      health.overall = 'failed';
    }

    setStreamHealth(health);
    return health;
  }, []);

  // Verify stream is actually producing media (not just connected)
  const verifyMediaFlow = useCallback(async (
    videoElement: HTMLVideoElement | null,
    timeoutMs: number = 5000
  ): Promise<boolean> => {
    if (!videoElement) {
      console.warn('🔍 [MediaStreamValidator] No video element provided for verification');
      return false;
    }

    return new Promise((resolve) => {
      let resolved = false;
      
      const cleanup = () => {
        if (!resolved) {
          resolved = true;
          videoElement.removeEventListener('loadedmetadata', onLoadedMetadata);
          videoElement.removeEventListener('error', onError);
        }
      };

      const onLoadedMetadata = () => {
        console.log('✅ [MediaStreamValidator] Video metadata loaded, media flow verified');
        cleanup();
        resolve(true);
      };

      const onError = (error: Event) => {
        console.error('❌ [MediaStreamValidator] Video element error:', error);
        cleanup();
        resolve(false);
      };

      videoElement.addEventListener('loadedmetadata', onLoadedMetadata);
      videoElement.addEventListener('error', onError);

      // Timeout fallback
      setTimeout(() => {
        if (!resolved) {
          console.warn('⏰ [MediaStreamValidator] Media flow verification timeout');
          cleanup();
          resolve(false);
        }
      }, timeoutMs);

      // If video already has metadata, resolve immediately
      if (videoElement.readyState >= HTMLMediaElement.HAVE_METADATA) {
        console.log('✅ [MediaStreamValidator] Video already has metadata');
        cleanup();
        resolve(true);
      }
    });
  }, []);

  // Test if device can actually produce media (not just enumerate)
  const testDeviceMediaProduction = useCallback(async (deviceId?: string): Promise<{
    canProduceVideo: boolean;
    canProduceAudio: boolean;
    errors: string[];
  }> => {
    const result = {
      canProduceVideo: false,
      canProduceAudio: false,
      errors: [] as string[]
    };

    // Test video production
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: 'user' },
        audio: false
      });

      const videoTracks = videoStream.getVideoTracks();
      if (videoTracks.length > 0 && videoTracks[0].readyState === 'live') {
        result.canProduceVideo = true;
        console.log('✅ [MediaStreamValidator] Video production test passed');
      }
      
      videoStream.getTracks().forEach(track => track.stop());
    } catch (error: any) {
      result.errors.push(`Video test failed: ${error.message}`);
      console.error('❌ [MediaStreamValidator] Video production test failed:', error);
    }

    // Test audio production
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: deviceId ? { deviceId: { exact: deviceId } } : true
      });

      const audioTracks = audioStream.getAudioTracks();
      if (audioTracks.length > 0 && audioTracks[0].readyState === 'live') {
        result.canProduceAudio = true;
        console.log('✅ [MediaStreamValidator] Audio production test passed');
      }
      
      audioStream.getTracks().forEach(track => track.stop());
    } catch (error: any) {
      result.errors.push(`Audio test failed: ${error.message}`);
      console.error('❌ [MediaStreamValidator] Audio production test failed:', error);
    }

    return result;
  }, []);

  return {
    streamHealth,
    validateStream,
    analyzeStreamHealth,
    verifyMediaFlow,
    testDeviceMediaProduction,
  };
}