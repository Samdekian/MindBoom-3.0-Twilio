
import { supabase } from '@/integrations/supabase/client';

// Define test result interface
export interface TestResult {
  passed: boolean;
  message: string;
  details?: {
    skipped?: boolean;
    tracks?: any[];
    latency?: number;
    error?: any;
    userAgentInfo?: string;
    // Network test details
    successRate?: number;
    testsRun?: number;
    successful?: number;
    // Media device details
    cameraAccess?: boolean;
    microphoneAccess?: boolean;
    videoDevices?: number;
    audioDevices?: number;
    deviceLabels?: Array<{ kind: string; label: string }>;
    devicesDetected?: number;
    // Browser compatibility details
    browserInfo?: any;
    features?: any;
    compatibilityScore?: number;
    missingEssential?: string[];
    recommendedBrowser?: boolean;
    // WebRTC details
    connectionSuccess?: boolean;
    // Supabase details
    responseTime?: number;
    recordsFound?: number;
    // Permission details
    permissions?: any;
    // Health monitoring details
    healthData?: any;
    // Session details
    sessionId?: string;
  };
}

// Real network connectivity test
const runNetworkTest = async (): Promise<TestResult> => {
  try {
    const startTime = performance.now();
    
    // Test multiple endpoints for comprehensive network validation
    const testUrls = [
      'https://www.google.com/favicon.ico',
      'https://cloudflare.com/favicon.ico',
      'https://httpbin.org/get'
    ];
    
    const results = await Promise.allSettled(
      testUrls.map(async (url) => {
        const response = await fetch(url, { 
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-cache'
        });
        return response;
      })
    );
    
    const endTime = performance.now();
    const latency = Math.round(endTime - startTime);
    const successfulTests = results.filter(r => r.status === 'fulfilled').length;
    const successRate = (successfulTests / testUrls.length) * 100;
    
    return {
      passed: successRate >= 50, // At least 50% success rate
      message: `Network connectivity: ${successRate.toFixed(0)}% success rate`,
      details: {
        latency,
        successRate,
        testsRun: testUrls.length,
        successful: successfulTests
      }
    };
  } catch (error) {
    return {
      passed: false,
      message: 'Network test failed',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        latency: 0
      }
    };
  }
};

// Real media devices access test
const runMediaDevicesTest = async (): Promise<TestResult> => {
  try {
    // Check if navigator.mediaDevices is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return {
        passed: false,
        message: 'Media devices not supported in this browser',
        details: {
          error: 'mediaDevices API not available'
        }
      };
    }
    
    // Test camera access
    let cameraAccess = false;
    let microphoneAccess = false;
    let devices: MediaDeviceInfo[] = [];
    
    try {
      // Enumerate devices first
      devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      const audioDevices = devices.filter(d => d.kind === 'audioinput');
      
      // Test actual media access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();
      
      cameraAccess = videoTracks.length > 0;
      microphoneAccess = audioTracks.length > 0;
      
      // Clean up stream
      stream.getTracks().forEach(track => track.stop());
      
      return {
        passed: cameraAccess && microphoneAccess,
        message: `Media access: Camera ${cameraAccess ? 'granted' : 'denied'}, Microphone ${microphoneAccess ? 'granted' : 'denied'}`,
        details: {
          cameraAccess,
          microphoneAccess,
          videoDevices: videoDevices.length,
          audioDevices: audioDevices.length,
          deviceLabels: devices.map(d => ({ kind: d.kind, label: d.label || 'Unknown' }))
        }
      };
    } catch (permissionError) {
      // Try without requesting permissions
      const basicTest = devices.some(d => d.kind === 'videoinput') && 
                       devices.some(d => d.kind === 'audioinput');
      
      return {
        passed: false,
        message: 'Media devices detected but access denied',
        details: {
          error: permissionError instanceof Error ? permissionError.message : 'Permission denied',
          devicesDetected: devices.length,
          videoDevices: devices.filter(d => d.kind === 'videoinput').length,
          audioDevices: devices.filter(d => d.kind === 'audioinput').length
        }
      };
    }
  } catch (error) {
    return {
      passed: false,
      message: 'Error testing media devices',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
};

// Comprehensive browser compatibility test
const runBrowserCompatibilityTest = async (): Promise<TestResult> => {
  const features = {
    webRTC: !!(window.RTCPeerConnection),
    mediaDevices: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    getDisplayMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia),
    dataChannels: !!(window.RTCPeerConnection && RTCPeerConnection.prototype.createDataChannel),
    modernJS: !!(window.Promise && window.fetch && window.WebSocket),
    indexedDB: !!(window.indexedDB),
    webGL: (() => {
      try {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
      } catch {
        return false;
      }
    })(),
    audioContext: !!(window.AudioContext || (window as any).webkitAudioContext)
  };
  
  const browserInfo = {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine
  };
  
  // Detect browser type and version
  const isChrome = /Chrome\/(\d+)/.test(navigator.userAgent);
  const isFirefox = /Firefox\/(\d+)/.test(navigator.userAgent);
  const isSafari = /Safari\/(\d+)/.test(navigator.userAgent) && !isChrome;
  const isEdge = /Edg\/(\d+)/.test(navigator.userAgent);
  
  const essentialFeatures = ['webRTC', 'mediaDevices', 'modernJS'];
  const missingEssential = essentialFeatures.filter(feature => !features[feature]);
  const totalFeatures = Object.keys(features).length;
  const supportedFeatures = Object.values(features).filter(Boolean).length;
  const compatibilityScore = (supportedFeatures / totalFeatures) * 100;
  
  return {
    passed: missingEssential.length === 0 && compatibilityScore >= 70,
    message: `Browser compatibility: ${compatibilityScore.toFixed(0)}% (${supportedFeatures}/${totalFeatures} features)`,
    details: {
      browserInfo,
      features,
      compatibilityScore,
      missingEssential,
      recommendedBrowser: !isChrome && !isFirefox && !isEdge
    }
  };
};

// WebRTC connection test
const runWebRTCTest = async (): Promise<TestResult> => {
  try {
    if (!window.RTCPeerConnection) {
      return {
        passed: false,
        message: 'WebRTC not supported',
        details: { error: 'RTCPeerConnection not available' }
      };
    }
    
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    
    let connectionSuccess = false;
    let error: any = null;
    
    try {
      // Test basic peer connection creation
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      connectionSuccess = true;
    } catch (e) {
      error = e;
    } finally {
      pc.close();
    }
    
    return {
      passed: connectionSuccess,
      message: connectionSuccess ? 'WebRTC connection test passed' : 'WebRTC connection test failed',
      details: {
        connectionSuccess,
        error: error ? error.message : null
      }
    };
  } catch (error) {
    return {
      passed: false,
      message: 'WebRTC test error',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
};

// Supabase connectivity test
const runSupabaseTest = async (): Promise<TestResult> => {
  try {
    const startTime = performance.now();
    
    // Test basic Supabase connectivity
    const { data, error } = await supabase
      .from('health_checks')
      .select('id')
      .limit(1);
    
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);
    
    if (error) {
      return {
        passed: false,
        message: 'Supabase connection failed',
        details: {
          error: error.message,
          responseTime
        }
      };
    }
    
    return {
      passed: true,
      message: 'Supabase connection successful',
      details: {
        responseTime,
        recordsFound: data?.length || 0
      }
    };
  } catch (error) {
    return {
      passed: false,
      message: 'Supabase test error',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
};

// Function that runs all tests and returns results
export const runAllTests = async (): Promise<Record<string, TestResult>> => {
  console.log('[Testing] Starting comprehensive video conference tests...');
  
  const testPromises = [
    runNetworkTest(),
    runMediaDevicesTest(),
    runBrowserCompatibilityTest(),
    runWebRTCTest(),
    runSupabaseTest()
  ];
  
  const [
    networkResult,
    mediaDevicesResult,
    browserCompatibilityResult,
    webRTCResult,
    supabaseResult
  ] = await Promise.all(testPromises);
  
  const results = {
    network: networkResult,
    mediaDevices: mediaDevicesResult,
    browser: browserCompatibilityResult,
    webRTC: webRTCResult,
    supabase: supabaseResult
  };
  
  // Log summary
  const passed = Object.values(results).filter(r => r.passed).length;
  const total = Object.values(results).length;
  console.log(`[Testing] Complete: ${passed}/${total} tests passed`);
  
  return results;
};
