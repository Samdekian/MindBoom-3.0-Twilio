/**
 * useTwilioVideoDisplay Hook
 * Manages Twilio Video track rendering and participant display
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Room, RemoteParticipant, RemoteTrack, RemoteVideoTrack, RemoteAudioTrack, LocalVideoTrack, LocalAudioTrack } from 'twilio-video';

export interface TwilioTrackInfo {
  participantIdentity: string;
  participantSid: string;
  isLocal: boolean;
  videoTrack: RemoteVideoTrack | LocalVideoTrack | null;
  audioTrack: RemoteAudioTrack | LocalAudioTrack | null;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  networkQuality: number | null;
}

interface UseTwilioVideoDisplayOptions {
  room: Room | null;
  enabled?: boolean;
}

interface UseTwilioVideoDisplayReturn {
  localTrackInfo: TwilioTrackInfo | null;
  remoteTrackInfos: TwilioTrackInfo[];
  dominantSpeaker: string | null;
  attachTrackToElement: (track: RemoteVideoTrack | LocalVideoTrack, element: HTMLVideoElement) => void;
  detachTrackFromElement: (track: RemoteVideoTrack | LocalVideoTrack, element: HTMLVideoElement) => void;
}

export function useTwilioVideoDisplay(
  options: UseTwilioVideoDisplayOptions
): UseTwilioVideoDisplayReturn {
  const { room, enabled = true } = options;
  
  const [localTrackInfo, setLocalTrackInfo] = useState<TwilioTrackInfo | null>(null);
  const [remoteTrackInfos, setRemoteTrackInfos] = useState<TwilioTrackInfo[]>([]);
  const [dominantSpeaker, setDominantSpeaker] = useState<string | null>(null);
  
  // Track attached elements for cleanup
  const attachedElementsRef = useRef<Map<string, HTMLVideoElement>>(new Map());

  /**
   * Attach a video track to a DOM element
   */
  const attachTrackToElement = useCallback((
    track: RemoteVideoTrack | LocalVideoTrack,
    element: HTMLVideoElement
  ) => {
    if (!track || !element) return;
    
    try {
      // Detach from any previous element first
      track.detach().forEach(el => {
        el.srcObject = null;
      });
      
      // Attach to new element
      track.attach(element);
      // Use track name or a unique identifier (local tracks don't have sid)
      const trackId = 'sid' in track ? track.sid : track.name || `local-${Date.now()}`;
      attachedElementsRef.current.set(trackId, element);
      
      console.log('📹 [TwilioVideoDisplay] Track attached:', trackId, {
        kind: track.kind,
        isEnabled: track.isEnabled,
        isLocal: !('sid' in track)
      });
    } catch (error) {
      console.error('❌ [TwilioVideoDisplay] Failed to attach track:', error);
    }
  }, []);

  /**
   * Detach a video track from a DOM element
   */
  const detachTrackFromElement = useCallback((
    track: RemoteVideoTrack | LocalVideoTrack,
    element: HTMLVideoElement
  ) => {
    if (!track || !element) return;
    
    try {
      track.detach(element);
      // Use track name or a unique identifier (local tracks don't have sid)
      const trackId = 'sid' in track ? track.sid : track.name || `local-${Date.now()}`;
      attachedElementsRef.current.delete(trackId);
      element.srcObject = null;
      
      console.log('📹 [TwilioVideoDisplay] Track detached:', trackId);
    } catch (error) {
      console.error('❌ [TwilioVideoDisplay] Failed to detach track:', error);
    }
  }, []);

  /**
   * Extract track info from local participant
   */
  const getLocalTrackInfo = useCallback((): TwilioTrackInfo | null => {
    if (!room?.localParticipant) {
      console.log('📋 [TwilioVideoDisplay] No local participant');
      return null;
    }
    
    const localParticipant = room.localParticipant;
    let videoTrack: LocalVideoTrack | null = null;
    let audioTrack: LocalAudioTrack | null = null;
    
    console.log('📋 [TwilioVideoDisplay] Local participant videoTracks:', localParticipant.videoTracks.size);
    localParticipant.videoTracks.forEach((publication, trackName) => {
      console.log('📋 [TwilioVideoDisplay] Video publication:', trackName, {
        isTrackEnabled: publication.isTrackEnabled,
        track: publication.track ? 'exists' : 'null',
        trackEnabled: publication.track?.isEnabled
      });
      if (publication.track) {
        videoTrack = publication.track as LocalVideoTrack;
      }
    });
    
    localParticipant.audioTracks.forEach((publication, trackName) => {
      if (publication.track) {
        audioTrack = publication.track as LocalAudioTrack;
      }
    });
    
    const trackInfo = {
      participantIdentity: localParticipant.identity,
      participantSid: localParticipant.sid,
      isLocal: true,
      videoTrack,
      audioTrack,
      isVideoEnabled: videoTrack?.isEnabled ?? false,
      isAudioEnabled: audioTrack?.isEnabled ?? false,
      networkQuality: localParticipant.networkQualityLevel ?? null
    };
    
    console.log('📋 [TwilioVideoDisplay] Local track info:', {
      hasVideoTrack: !!videoTrack,
      isVideoEnabled: trackInfo.isVideoEnabled,
      hasAudioTrack: !!audioTrack,
      isAudioEnabled: trackInfo.isAudioEnabled
    });
    
    return trackInfo;
  }, [room]);

  /**
   * Extract track info from remote participant
   */
  const getRemoteTrackInfo = useCallback((participant: RemoteParticipant): TwilioTrackInfo => {
    let videoTrack: RemoteVideoTrack | null = null;
    let audioTrack: RemoteAudioTrack | null = null;
    
    participant.videoTracks.forEach(publication => {
      if (publication.isSubscribed && publication.track) {
        videoTrack = publication.track as RemoteVideoTrack;
      }
    });
    
    participant.audioTracks.forEach(publication => {
      if (publication.isSubscribed && publication.track) {
        audioTrack = publication.track as RemoteAudioTrack;
      }
    });
    
    return {
      participantIdentity: participant.identity,
      participantSid: participant.sid,
      isLocal: false,
      videoTrack,
      audioTrack,
      isVideoEnabled: videoTrack?.isEnabled ?? false,
      isAudioEnabled: audioTrack?.isEnabled ?? false,
      networkQuality: participant.networkQualityLevel ?? null
    };
  }, []);

  /**
   * Update all track infos
   */
  const updateTrackInfos = useCallback(() => {
    if (!room || !enabled) {
      setLocalTrackInfo(null);
      setRemoteTrackInfos([]);
      return;
    }
    
    // Update local
    setLocalTrackInfo(getLocalTrackInfo());
    
    // Update remote
    const remotes: TwilioTrackInfo[] = [];
    room.participants.forEach(participant => {
      remotes.push(getRemoteTrackInfo(participant));
    });
    setRemoteTrackInfos(remotes);
    
    console.log('📋 [TwilioVideoDisplay] Updated track infos:', {
      local: !!room.localParticipant,
      remoteCount: remotes.length
    });
  }, [room, enabled, getLocalTrackInfo, getRemoteTrackInfo]);

  /**
   * Setup room event listeners
   */
  useEffect(() => {
    if (!room || !enabled) {
      setLocalTrackInfo(null);
      setRemoteTrackInfos([]);
      return;
    }

    console.log('🎥 [TwilioVideoDisplay] Setting up room listeners for:', room.sid);
    console.log('🎥 [TwilioVideoDisplay] Local participant:', {
      identity: room.localParticipant?.identity,
      sid: room.localParticipant?.sid,
      videoTracksSize: room.localParticipant?.videoTracks.size,
      audioTracksSize: room.localParticipant?.audioTracks.size
    });

    // Initial update
    updateTrackInfos();
    
    // Also listen for local track publication events
    const handleLocalTrackPublished = (publication: any) => {
      console.log('📹 [TwilioVideoDisplay] Local track published:', publication.trackName, {
        kind: publication.kind,
        isTrackEnabled: publication.isTrackEnabled,
        hasTrack: !!publication.track
      });
      updateTrackInfos();
    };
    
    const handleLocalTrackUnpublished = (publication: any) => {
      console.log('📹 [TwilioVideoDisplay] Local track unpublished:', publication.trackName);
      updateTrackInfos();
    };
    
    // Listen for local track publication events
    const handleLocalTrackEnabled = () => {
      console.log('📹 [TwilioVideoDisplay] Local track enabled');
      updateTrackInfos();
    };
    
    const handleLocalTrackDisabled = () => {
      console.log('📹 [TwilioVideoDisplay] Local track disabled');
      updateTrackInfos();
    };
    
    room.localParticipant.on('trackPublished', handleLocalTrackPublished);
    room.localParticipant.on('trackUnpublished', handleLocalTrackUnpublished);
    room.localParticipant.on('trackEnabled', handleLocalTrackEnabled);
    room.localParticipant.on('trackDisabled', handleLocalTrackDisabled);

    // Participant events
    const handleParticipantConnected = (participant: RemoteParticipant) => {
      console.log('👤 [TwilioVideoDisplay] Participant connected:', participant.identity);
      
      // Setup track subscription listeners for this participant
      participant.on('trackSubscribed', handleTrackSubscribed);
      participant.on('trackUnsubscribed', handleTrackUnsubscribed);
      participant.on('trackEnabled', handleTrackUpdate);
      participant.on('trackDisabled', handleTrackUpdate);
      
      updateTrackInfos();
    };

    const handleParticipantDisconnected = (participant: RemoteParticipant) => {
      console.log('👤 [TwilioVideoDisplay] Participant disconnected:', participant.identity);
      
      // Remove listeners
      participant.off('trackSubscribed', handleTrackSubscribed);
      participant.off('trackUnsubscribed', handleTrackUnsubscribed);
      participant.off('trackEnabled', handleTrackUpdate);
      participant.off('trackDisabled', handleTrackUpdate);
      
      updateTrackInfos();
    };

    const handleTrackSubscribed = (track: RemoteTrack) => {
      console.log('📹 [TwilioVideoDisplay] Track subscribed:', track.kind, track.sid);
      updateTrackInfos();
    };

    const handleTrackUnsubscribed = (track: RemoteTrack) => {
      console.log('📹 [TwilioVideoDisplay] Track unsubscribed:', track.kind, track.sid);
      updateTrackInfos();
    };

    const handleTrackUpdate = () => {
      updateTrackInfos();
    };

    const handleDominantSpeakerChanged = (participant: RemoteParticipant | null) => {
      setDominantSpeaker(participant?.identity ?? null);
    };

    const handleLocalTrackUpdate = () => {
      setLocalTrackInfo(getLocalTrackInfo());
    };

    // Subscribe to room events
    room.on('participantConnected', handleParticipantConnected);
    room.on('participantDisconnected', handleParticipantDisconnected);
    room.on('dominantSpeakerChanged', handleDominantSpeakerChanged);
    room.on('trackPublished', handleTrackUpdate);
    room.on('trackUnpublished', handleTrackUpdate);

    // Subscribe to existing participants
    room.participants.forEach(participant => {
      participant.on('trackSubscribed', handleTrackSubscribed);
      participant.on('trackUnsubscribed', handleTrackUnsubscribed);
      participant.on('trackEnabled', handleTrackUpdate);
      participant.on('trackDisabled', handleTrackUpdate);
    });

    // Cleanup
    return () => {
      console.log('🧹 [TwilioVideoDisplay] Cleaning up room listeners');
      
      room.off('participantConnected', handleParticipantConnected);
      room.off('participantDisconnected', handleParticipantDisconnected);
      room.off('dominantSpeakerChanged', handleDominantSpeakerChanged);
      room.off('trackPublished', handleTrackUpdate);
      room.off('trackUnpublished', handleTrackUpdate);

      room.participants.forEach(participant => {
        participant.off('trackSubscribed', handleTrackSubscribed);
        participant.off('trackUnsubscribed', handleTrackUnsubscribed);
        participant.off('trackEnabled', handleTrackUpdate);
        participant.off('trackDisabled', handleTrackUpdate);
      });

      room.localParticipant.off('trackPublished', handleLocalTrackPublished);
      room.localParticipant.off('trackUnpublished', handleLocalTrackUnpublished);
      room.localParticipant.off('trackEnabled', handleLocalTrackEnabled);
      room.localParticipant.off('trackDisabled', handleLocalTrackDisabled);

      // Detach all tracks
      attachedElementsRef.current.forEach((element, trackSid) => {
        element.srcObject = null;
      });
      attachedElementsRef.current.clear();
    };
  }, [room, enabled, updateTrackInfos, getLocalTrackInfo]);

  return {
    localTrackInfo,
    remoteTrackInfos,
    dominantSpeaker,
    attachTrackToElement,
    detachTrackFromElement
  };
}

