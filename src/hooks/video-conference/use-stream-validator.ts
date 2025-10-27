import { useCallback, useEffect, useState, useRef } from 'react';

export interface StreamValidationResult {
  isValid: boolean;
  hasActiveVideo: boolean;
  hasActiveAudio: boolean;
  videoTracks: number;
  audioTracks: number;
  issues: string[];
}

export function useStreamValidator() {
  const validateStream = useCallback((stream: MediaStream | null): StreamValidationResult => {
    if (!stream) {
      return {
        isValid: false,
        hasActiveVideo: false,
        hasActiveAudio: false,
        videoTracks: 0,
        audioTracks: 0,
        issues: ['No stream provided']
      };
    }

    const videoTracks = stream.getVideoTracks();
    const audioTracks = stream.getAudioTracks();
    
    const activeVideoTracks = videoTracks.filter(track => 
      track.readyState === 'live' && track.enabled
    );
    const activeAudioTracks = audioTracks.filter(track => 
      track.readyState === 'live' && track.enabled
    );

    const issues: string[] = [];
    
    if (videoTracks.length === 0 && audioTracks.length === 0) {
      issues.push('Stream has no tracks');
    }
    
    if (videoTracks.length > 0 && activeVideoTracks.length === 0) {
      issues.push('Video tracks exist but are not active');
    }
    
    if (audioTracks.length > 0 && activeAudioTracks.length === 0) {
      issues.push('Audio tracks exist but are not active');
    }

    const hasActiveVideo = activeVideoTracks.length > 0;
    const hasActiveAudio = activeAudioTracks.length > 0;

    return {
      isValid: hasActiveVideo || hasActiveAudio,
      hasActiveVideo,
      hasActiveAudio,
      videoTracks: videoTracks.length,
      audioTracks: audioTracks.length,
      issues
    };
  }, []);

  const validateVideoElement = useCallback((videoElement: HTMLVideoElement | null): {
    hasSource: boolean;
    isPlaying: boolean;
    hasValidDimensions: boolean;
    issues: string[];
  } => {
    if (!videoElement) {
      return {
        hasSource: false,
        isPlaying: false,
        hasValidDimensions: false,
        issues: ['No video element']
      };
    }

    const issues: string[] = [];
    const hasSource = !!videoElement.srcObject;
    const isPlaying = !videoElement.paused && !videoElement.ended && videoElement.readyState > 2;
    const hasValidDimensions = videoElement.videoWidth > 0 && videoElement.videoHeight > 0;

    if (!hasSource) issues.push('No srcObject assigned');
    if (!isPlaying) issues.push('Video not playing');
    if (!hasValidDimensions) issues.push('Invalid video dimensions');

    return {
      hasSource,
      isPlaying,
      hasValidDimensions,
      issues
    };
  }, []);

  return {
    validateStream,
    validateVideoElement
  };
}

export function useStreamMonitor(
  localVideoRef: React.RefObject<HTMLVideoElement>,
  remoteVideoRef: React.RefObject<HTMLVideoElement>,
  localStream: MediaStream | null,
  remoteStreams: MediaStream[]
) {
  const { validateStream, validateVideoElement } = useStreamValidator();
  const [streamHealth, setStreamHealth] = useState<{
    local: StreamValidationResult;
    remote: StreamValidationResult;
    localElement: ReturnType<typeof validateVideoElement>;
    remoteElement: ReturnType<typeof validateVideoElement>;
  } | null>(null);

  // Use ref to avoid dependency loop
  const previousHealthRef = useRef<string | null>(null);

  const checkStreamHealth = useCallback(() => {
    const localValidation = validateStream(localStream);
    const remoteValidation = validateStream(remoteStreams[0] || null);
    const localElementValidation = validateVideoElement(localVideoRef.current);
    const remoteElementValidation = validateVideoElement(remoteVideoRef.current);

    const health = {
      local: localValidation,
      remote: remoteValidation,
      localElement: localElementValidation,
      remoteElement: remoteElementValidation
    };

    setStreamHealth(health);

    // Only log critical issues to reduce console spam
    if (localValidation.issues.some(issue => issue.includes('No stream provided') || issue.includes('no tracks'))) {
      console.warn('🔍 [StreamMonitor] Critical local stream issue:', localValidation.issues.filter(issue => 
        issue.includes('No stream provided') || issue.includes('no tracks')
      ));
    }
    if (remoteValidation.issues.some(issue => issue.includes('No stream provided') || issue.includes('no tracks'))) {
      console.warn('🔍 [StreamMonitor] Critical remote stream issue:', remoteValidation.issues.filter(issue => 
        issue.includes('No stream provided') || issue.includes('no tracks')
      ));
    }

    return health;
  }, [localStream, remoteStreams, validateStream, validateVideoElement]);

  useEffect(() => {
    // Disabled automatic monitoring to prevent loops
    // Only manual health checks via checkStreamHealth() function
    return () => {};
  }, []);

  return {
    streamHealth,
    checkStreamHealth,
    validateStream,
    validateVideoElement
  };
}