
import { useRef } from "react";

/**
 * Hook for managing video element references
 */
export function useVideoRefs() {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  return {
    localVideoRef,
    remoteVideoRef
  };
}
