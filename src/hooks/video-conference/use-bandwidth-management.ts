
import { useCallback, useEffect, useState } from "react";

interface BandwidthConstraints {
  maxBitrate: number;  // in bps
  maxFramerate: number;
  maxResolution: {
    width: number;
    height: number;
  };
}

export function useBandwidthManagement(peerConnection: RTCPeerConnection | null) {
  const [currentConstraints, setCurrentConstraints] = useState<BandwidthConstraints>({
    maxBitrate: 2500000, // 2.5 Mbps (high quality)
    maxFramerate: 30,
    maxResolution: { width: 1280, height: 720 }
  });
  
  // Function to detect network conditions
  const detectNetworkConditions = useCallback(async () => {
    // In a real implementation, use Navigator.connection API or WebRTC stats
    // For this demo, we'll simulate network conditions
    const randomValue = Math.random();
    
    if (randomValue < 0.15) {
      return 'low';
    } else if (randomValue < 0.4) {
      return 'medium';
    } else {
      return 'high';
    }
  }, []);
  
  // Apply bandwidth restrictions to peer connection
  const applyBandwidthRestriction = useCallback(async (bitrate: number) => {
    if (!peerConnection) return;
    
    try {
      const senders = peerConnection.getSenders();
      for (const sender of senders) {
        if (sender.track?.kind === 'video') {
          const params = sender.getParameters();
          
          if (!params.encodings) {
            params.encodings = [{}];
          }
          
          params.encodings[0].maxBitrate = bitrate;
          
          await sender.setParameters(params);
          console.log(`Applied bandwidth restriction: ${bitrate / 1000} kbps`);
        }
      }
    } catch (err) {
      console.error('Error applying bandwidth restriction:', err);
    }
  }, [peerConnection]);
  
  // Set video constraints based on network conditions
  const setVideoConstraintsByNetworkCondition = useCallback(async (condition: 'low' | 'medium' | 'high') => {
    let constraints: BandwidthConstraints;
    
    switch (condition) {
      case 'low':
        constraints = {
          maxBitrate: 250000, // 250 kbps
          maxFramerate: 15,
          maxResolution: { width: 320, height: 240 }
        };
        break;
      case 'medium':
        constraints = {
          maxBitrate: 750000, // 750 kbps
          maxFramerate: 20,
          maxResolution: { width: 640, height: 480 }
        };
        break;
      case 'high':
        constraints = {
          maxBitrate: 2500000, // 2.5 Mbps
          maxFramerate: 30,
          maxResolution: { width: 1280, height: 720 }
        };
        break;
    }
    
    setCurrentConstraints(constraints);
    await applyBandwidthRestriction(constraints.maxBitrate);
  }, [applyBandwidthRestriction]);
  
  // Monitor network conditions and adapt
  useEffect(() => {
    if (!peerConnection) return;
    
    const checkNetworkInterval = setInterval(async () => {
      const networkCondition = await detectNetworkConditions();
      await setVideoConstraintsByNetworkCondition(networkCondition);
    }, 10000); // Check every 10 seconds
    
    return () => {
      clearInterval(checkNetworkInterval);
    };
  }, [peerConnection, detectNetworkConditions, setVideoConstraintsByNetworkCondition]);
  
  // Function to explicitly set quality
  const setQualityLevel = useCallback(async (level: 'low' | 'medium' | 'high') => {
    await setVideoConstraintsByNetworkCondition(level);
  }, [setVideoConstraintsByNetworkCondition]);
  
  return {
    currentConstraints,
    setQualityLevel,
  };
}
