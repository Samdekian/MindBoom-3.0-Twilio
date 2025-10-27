
import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

// Quality tiers for bandwidth management
export enum QualityTier {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  AUDIO_ONLY = 'audio-only'
}

// Quality tier configuration
const QUALITY_TIERS = {
  [QualityTier.HIGH]: {
    maxBitrate: 2500000, // 2.5 Mbps
    maxFramerate: 30,
    maxResolution: { width: 1280, height: 720 } // 720p
  },
  [QualityTier.MEDIUM]: {
    maxBitrate: 1000000, // 1 Mbps
    maxFramerate: 20,
    maxResolution: { width: 640, height: 480 } // 480p
  },
  [QualityTier.LOW]: {
    maxBitrate: 350000, // 350 Kbps
    maxFramerate: 15,
    maxResolution: { width: 320, height: 240 } // 240p
  },
  [QualityTier.AUDIO_ONLY]: {
    maxBitrate: 0, // No video
    maxFramerate: 0,
    maxResolution: { width: 0, height: 0 }
  }
};

export function useAdaptiveBandwidth(
  peerConnection: RTCPeerConnection | null,
  getLocalStream: () => Promise<MediaStream | null>
) {
  const [currentQualityTier, setCurrentQualityTier] = useState<QualityTier>(QualityTier.HIGH);
  const [isAdapting, setIsAdapting] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Apply bandwidth constraints to the connection
  const applyBandwidthConstraints = useCallback(async (tier: QualityTier) => {
    if (!peerConnection) return false;
    
    try {
      setIsAdapting(true);
      
      // Get sender for video tracks
      const senders = peerConnection.getSenders();
      const videoSender = senders.find(sender => 
        sender.track && sender.track.kind === 'video'
      );
      
      if (!videoSender) {
        console.log("No video sender found");
        return false;
      }
      
      // Get current parameters
      const parameters = videoSender.getParameters();
      
      // Check if we're going to audio-only mode
      if (tier === QualityTier.AUDIO_ONLY) {
        // Stop video track to save bandwidth completely
        const localStream = await getLocalStream();
        localStream?.getVideoTracks().forEach(track => {
          track.enabled = false;
        });
        
        toast({
          title: "Video Disabled",
          description: "Switched to audio-only mode to preserve call quality"
        });
      } else {
        // Re-enable video if needed
        const localStream = await getLocalStream();
        localStream?.getVideoTracks().forEach(track => {
          track.enabled = true;
        });
        
        // Set encoding parameters for video quality
        if (parameters.encodings && parameters.encodings.length > 0) {
          parameters.encodings.forEach(encoding => {
            encoding.maxBitrate = QUALITY_TIERS[tier].maxBitrate;
            encoding.maxFramerate = QUALITY_TIERS[tier].maxFramerate;
          });
          
          // Apply the parameters
          await videoSender.setParameters(parameters);
        }
        
        // Apply constraints to the track if needed
        if (videoSender.track) {
          const { width, height } = QUALITY_TIERS[tier].maxResolution;
          try {
            await videoSender.track.applyConstraints({
              width: { max: width },
              height: { max: height },
              frameRate: { max: QUALITY_TIERS[tier].maxFramerate }
            });
          } catch (err) {
            console.warn("Failed to apply constraints:", err);
          }
        }
      }
      
      // Update state with the new tier
      setCurrentQualityTier(tier);
      
      // Show toast for quality change if not going back to high quality
      if (tier !== QualityTier.HIGH) {
        toast({
          title: "Video Quality Adjusted",
          description: `Adjusted to ${tier} quality due to network conditions`
        });
      }
      
      return true;
    } catch (err) {
      console.error("Error applying bandwidth constraints:", err);
      return false;
    } finally {
      setIsAdapting(false);
    }
  }, [peerConnection, getLocalStream, toast]);
  
  // Automatic adaptation based on connection quality
  const adaptToNetworkQuality = useCallback(async (qualityScore: number) => {
    // Don't adapt if already adapting
    if (isAdapting) return;
    
    let targetTier = currentQualityTier;
    
    // Determine target quality tier based on quality score
    if (qualityScore < 30) {
      targetTier = QualityTier.AUDIO_ONLY;
    } else if (qualityScore < 50) {
      targetTier = QualityTier.LOW;
    } else if (qualityScore < 70) {
      targetTier = QualityTier.MEDIUM;
    } else if (qualityScore >= 85) {
      targetTier = QualityTier.HIGH;
    }
    
    // Only change if needed
    if (targetTier !== currentQualityTier) {
      console.log(`Adapting bandwidth: ${currentQualityTier} -> ${targetTier} (score: ${qualityScore})`);
      await applyBandwidthConstraints(targetTier);
    }
  }, [applyBandwidthConstraints, currentQualityTier, isAdapting]);
  
  // Force adaptation to a specific tier
  const forceAdaptation = useCallback(async (tier: QualityTier) => {
    return applyBandwidthConstraints(tier);
  }, [applyBandwidthConstraints]);
  
  return {
    currentQualityTier,
    isAdapting,
    adaptToNetworkQuality,
    forceAdaptation
  };
}
