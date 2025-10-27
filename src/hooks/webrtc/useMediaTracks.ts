
import { useCallback } from "react";

/**
 * Hook for managing media tracks in a WebRTC connection
 */
export function useMediaTracks() {
  /**
   * Add tracks from a media stream to a peer connection
   */
  const addTracks = useCallback((pc: RTCPeerConnection, stream: MediaStream) => {
    try {
      // Remove existing senders first
      const senders = pc.getSenders();
      
      // Add all tracks from the stream to the peer connection
      stream.getTracks().forEach(track => {
        const existingSender = senders.find(s => 
          s.track && s.track.kind === track.kind
        );
        
        if (existingSender) {
          // Replace the track in the existing sender
          existingSender.replaceTrack(track);
        } else {
          // Add a new track
          pc.addTrack(track, stream);
        }
      });
      
      return true;
    } catch (err) {
      console.error("Error adding tracks to peer connection:", err);
      return false;
    }
  }, []);
  
  /**
   * Replace a specific track in a peer connection
   */
  const replaceTrack = useCallback((pc: RTCPeerConnection, track: MediaStreamTrack) => {
    try {
      const senders = pc.getSenders();
      const sender = senders.find(s => s.track && s.track.kind === track.kind);
      
      if (sender) {
        sender.replaceTrack(track);
        return true;
      } else {
        console.warn("No sender found for track kind:", track.kind);
        return false;
      }
    } catch (err) {
      console.error("Error replacing track:", err);
      return false;
    }
  }, []);
  
  return { addTracks, replaceTrack };
}
