
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

type QualityTier = 'low' | 'medium' | 'high';

export function useBandwidthAdaptation(
  peerConnection: RTCPeerConnection | null,
  getLocalStream: () => Promise<MediaStream | null>
) {
  const [currentQualityTier, setCurrentQualityTier] = useState<QualityTier>('high');
  const [isAdapting, setIsAdapting] = useState(false);
  const { toast } = useToast();

  // Check device capabilities on mount
  useEffect(() => {
    const checkDeviceCapabilities = () => {
      let recommendedTier: QualityTier = 'high';
      
      // Check if on mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      // Check device memory if available
      const memory = (navigator as any).deviceMemory;
      
      if (isMobile) {
        // Mobile devices start with medium quality by default
        recommendedTier = 'medium';
        
        // Further downgrade based on memory
        if (memory && memory < 4) {
          recommendedTier = 'low';
        }
      } else {
        // Desktop devices
        if (memory && memory < 4) {
          recommendedTier = 'medium';
        }
      }
      
      setCurrentQualityTier(recommendedTier);
    };
    
    checkDeviceCapabilities();
  }, []);

  // Adapt video quality based on bandwidth and CPU
  const adaptVideoQuality = useCallback(async (targetTier: QualityTier) => {
    try {
      setIsAdapting(true);
      
      const localStream = await getLocalStream();
      if (!localStream || !peerConnection) {
        return false;
      }
      
      // Get video track
      const videoTrack = localStream.getVideoTracks()[0];
      if (!videoTrack) {
        return false;
      }
      
      // Get current constraints
      const constraints = videoTrack.getConstraints();
      
      // Define quality tiers
      const qualitySettings = {
        low: { 
          width: { ideal: 320 }, 
          height: { ideal: 240 },
          frameRate: { max: 15 }
        },
        medium: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          frameRate: { max: 24 }
        },
        high: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          frameRate: { max: 30 }
        }
      };
      
      // Apply constraints based on target tier
      await videoTrack.applyConstraints({
        ...constraints,
        ...qualitySettings[targetTier]
      });
      
      // Adjust encoding parameters for WebRTC
      if (peerConnection.getSenders) {
        const sender = peerConnection.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        
        if (sender && sender.getParameters) {
          const params = sender.getParameters();
          
          if (!params.encodings) {
            params.encodings = [{}];
          }
          
          // Adjust bitrates based on tier
          if (targetTier === 'low') {
            params.encodings[0].maxBitrate = 250000; // 250 kbps
            params.encodings[0].scaleResolutionDownBy = 3.0;
          } else if (targetTier === 'medium') {
            params.encodings[0].maxBitrate = 700000; // 700 kbps
            params.encodings[0].scaleResolutionDownBy = 1.5;
          } else {
            params.encodings[0].maxBitrate = 2500000; // 2.5 Mbps
            params.encodings[0].scaleResolutionDownBy = 1.0;
          }
          
          try {
            await sender.setParameters(params);
          } catch (err) {
            console.error('Error setting encoding parameters:', err);
          }
        }
      }
      
      setCurrentQualityTier(targetTier);
      toast({
        title: "Video quality adjusted",
        description: `Quality set to ${targetTier}`,
      });
      
      return true;
    } catch (err) {
      console.error('Error adapting video quality:', err);
      return false;
    } finally {
      setIsAdapting(false);
    }
  }, [peerConnection, getLocalStream, toast]);

  // Force adaptation to specific quality tier
  const forceAdaptation = useCallback((targetTier: QualityTier) => {
    return adaptVideoQuality(targetTier);
  }, [adaptVideoQuality]);

  return {
    currentQualityTier,
    isAdapting,
    forceAdaptation
  };
}
