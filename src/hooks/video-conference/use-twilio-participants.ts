/**
 * useTwilioParticipants Hook
 * React hook for managing Twilio room participants
 */

import { useState, useEffect, useCallback } from 'react';
import type { Room, RemoteParticipant } from 'twilio-video';
import type { TwilioParticipantInfo } from '@/types/twilio';

interface UseTwilioParticipantsReturn {
  participants: Map<string, TwilioParticipantInfo>;
  participantCount: number;
  getParticipant: (identity: string) => TwilioParticipantInfo | undefined;
  isParticipantSpeaking: (identity: string) => boolean;
}

export function useTwilioParticipants(room: Room | null): UseTwilioParticipantsReturn {
  const [participants, setParticipants] = useState<Map<string, TwilioParticipantInfo>>(new Map());
  const [speakingParticipants, setSpeakingParticipants] = useState<Set<string>>(new Set());

  /**
   * Map participant to info
   */
  const mapParticipant = useCallback((participant: RemoteParticipant, isLocal: boolean): TwilioParticipantInfo => {
    const audioTrack = Array.from(participant.audioTracks.values())[0];
    const videoTrack = Array.from(participant.videoTracks.values())[0];

    return {
      identity: participant.identity,
      sid: participant.sid,
      isLocal,
      state: participant.state,
      networkQualityLevel: participant.networkQualityLevel,
      audioTrackEnabled: audioTrack?.track?.isEnabled ?? false,
      videoTrackEnabled: videoTrack?.track?.isEnabled ?? false
    };
  }, []);

  /**
   * Update participants list
   */
  const updateParticipants = useCallback(() => {
    if (!room) {
      setParticipants(new Map());
      return;
    }

    const newParticipants = new Map<string, TwilioParticipantInfo>();

    // Add local participant
    const localParticipant = mapParticipant(room.localParticipant as any, true);
    newParticipants.set(localParticipant.identity, localParticipant);

    // Add remote participants
    room.participants.forEach((participant) => {
      const participantInfo = mapParticipant(participant, false);
      newParticipants.set(participantInfo.identity, participantInfo);
    });

    setParticipants(newParticipants);
  }, [room, mapParticipant]);

  /**
   * Setup room event listeners
   */
  useEffect(() => {
    if (!room) return;

    // Initial participants
    updateParticipants();

    // Participant events
    const handleParticipantConnected = (participant: RemoteParticipant) => {
      console.log('👤 Participant connected:', participant.identity);
      updateParticipants();
      
      // Setup track listeners
      participant.on('trackSubscribed', () => updateParticipants());
      participant.on('trackUnsubscribed', () => updateParticipants());
      participant.on('trackEnabled', () => updateParticipants());
      participant.on('trackDisabled', () => updateParticipants());
    };

    const handleParticipantDisconnected = (participant: RemoteParticipant) => {
      console.log('👤 Participant disconnected:', participant.identity);
      updateParticipants();
    };

    room.on('participantConnected', handleParticipantConnected);
    room.on('participantDisconnected', handleParticipantDisconnected);

    // Setup listeners for already connected participants
    room.participants.forEach(participant => {
      participant.on('trackSubscribed', () => updateParticipants());
      participant.on('trackUnsubscribed', () => updateParticipants());
      participant.on('trackEnabled', () => updateParticipants());
      participant.on('trackDisabled', () => updateParticipants());
    });

    // Dominant speaker (speaking indicator)
    const handleDominantSpeakerChanged = (participant: RemoteParticipant | null) => {
      if (participant) {
        setSpeakingParticipants(new Set([participant.identity]));
      } else {
        setSpeakingParticipants(new Set());
      }
    };

    if (room.dominantSpeaker) {
      handleDominantSpeakerChanged(room.dominantSpeaker);
    }

    room.on('dominantSpeakerChanged', handleDominantSpeakerChanged);

    return () => {
      room.off('participantConnected', handleParticipantConnected);
      room.off('participantDisconnected', handleParticipantDisconnected);
      room.off('dominantSpeakerChanged', handleDominantSpeakerChanged);
    };
  }, [room, updateParticipants]);

  /**
   * Get specific participant
   */
  const getParticipant = useCallback((identity: string): TwilioParticipantInfo | undefined => {
    return participants.get(identity);
  }, [participants]);

  /**
   * Check if participant is speaking
   */
  const isParticipantSpeaking = useCallback((identity: string): boolean => {
    return speakingParticipants.has(identity);
  }, [speakingParticipants]);

  return {
    participants,
    participantCount: participants.size,
    getParticipant,
    isParticipantSpeaking
  };
}

