import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ParticipantManager } from '@/lib/multi-participant/participant-manager';
import { ParticipantInfo, ConnectionQuality } from '@/types/video-session';

interface UseMultiParticipantSessionOptions {
  sessionId: string;
  currentUserId: string;
  currentUserName: string;
  isHost?: boolean;
  maxParticipants?: number;
}

export function useMultiParticipantSession(options: UseMultiParticipantSessionOptions) {
  const { toast } = useToast();
  const [participants, setParticipants] = useState<ParticipantInfo[]>([]);
  const [layout, setLayout] = useState<"grid" | "speaker" | "sidebar">("grid");
  const [dominantSpeaker, setDominantSpeaker] = useState<string | null>(null);
  const [pinnedParticipant, setPinnedParticipant] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const participantManagerRef = useRef<ParticipantManager | null>(null);
  const videoRefsRef = useRef<Map<string, React.RefObject<HTMLVideoElement>>>(new Map());

  // Initialize participant manager
  useEffect(() => {
    const manager = new ParticipantManager({
      onParticipantUpdate: (participant) => {
        setParticipants(prev => 
          prev.map(p => p.id === participant.id ? participant : p)
        );
      },
      onSpeakerDetected: (participantId) => {
        console.log('Speaker detected:', participantId);
      },
      onDominantSpeakerChanged: (participantId) => {
        setDominantSpeaker(participantId);
        
        // Auto-switch to speaker layout if not already in grid with pinned participant
        if (layout !== "speaker" && !pinnedParticipant && participants.length > 2) {
          setLayout("speaker");
        }
      }
    });

    participantManagerRef.current = manager;

    // Add current user as participant
    manager.addParticipant({
      id: options.currentUserId,
      name: options.currentUserName,
      isCurrentUser: true,
      isHost: options.isHost || false,
      isVideoEnabled: true,
      isAudioEnabled: true,
      isSpeaking: false,
      connectionQuality: 'good',
      lastSpeakingTime: 0
    });

    return () => {
      manager.destroy();
    };
  }, [options.currentUserId, options.currentUserName, options.isHost]);

  // Update layout based on participant count
  useEffect(() => {
    if (!participantManagerRef.current) return;
    
    const count = participants.length;
    if (count <= 2 && layout === "speaker") {
      setLayout("sidebar");
    }
  }, [participants.length, layout]);

  // Participant management functions
  const addParticipant = useCallback((participant: Omit<ParticipantInfo, 'isCurrentUser'>) => {
    if (!participantManagerRef.current) return;
    
    const maxParticipants = options.maxParticipants || 12;
    if (participants.length >= maxParticipants) {
      toast({
        title: "Maximum participants reached",
        description: `Cannot add more than ${maxParticipants} participants`,
        variant: "destructive"
      });
      return;
    }

    const fullParticipant: ParticipantInfo = {
      ...participant,
      isCurrentUser: false,
      isSpeaking: false,
      connectionQuality: 'good',
      lastSpeakingTime: 0
    };

    participantManagerRef.current.addParticipant(fullParticipant);
    setParticipants(prev => [...prev, fullParticipant]);

    // Create video ref for new participant
    if (!videoRefsRef.current.has(participant.id)) {
      videoRefsRef.current.set(participant.id, { current: null });
    }

    toast({
      title: "Participant joined",
      description: `${participant.name} has joined the session`
    });
  }, [participants.length, options.maxParticipants, toast]);

  const removeParticipant = useCallback((participantId: string) => {
    if (!participantManagerRef.current) return;
    
    const participant = participants.find(p => p.id === participantId);
    if (!participant) return;

    participantManagerRef.current.removeParticipant(participantId);
    setParticipants(prev => prev.filter(p => p.id !== participantId));
    videoRefsRef.current.delete(participantId);

    // Clear pinned/dominant speaker if it was the removed participant
    if (pinnedParticipant === participantId) {
      setPinnedParticipant(null);
    }
    if (dominantSpeaker === participantId) {
      setDominantSpeaker(null);
    }

    toast({
      title: "Participant left",
      description: `${participant.name} has left the session`
    });
  }, [participants, pinnedParticipant, dominantSpeaker, toast]);

  const updateParticipant = useCallback((participantId: string, updates: Partial<ParticipantInfo>) => {
    if (!participantManagerRef.current) return;
    
    participantManagerRef.current.updateParticipant(participantId, updates);
  }, []);

  // Media stream management
  const attachAudioStream = useCallback((participantId: string, stream: MediaStream) => {
    if (!participantManagerRef.current) return;
    
    participantManagerRef.current.attachAudioStream(participantId, stream);
  }, []);

  // Participant actions
  const muteParticipant = useCallback((participantId: string) => {
    if (!participantManagerRef.current) return;
    
    participantManagerRef.current.muteParticipant(participantId);
    
    const participant = participants.find(p => p.id === participantId);
    toast({
      title: "Participant muted",
      description: `${participant?.name || 'Participant'} has been muted`
    });
  }, [participants, toast]);

  const makeHost = useCallback((participantId: string) => {
    if (!participantManagerRef.current) return;
    
    participantManagerRef.current.makeHost(participantId);
    
    const participant = participants.find(p => p.id === participantId);
    toast({
      title: "Host changed",
      description: `${participant?.name || 'Participant'} is now the host`
    });
  }, [participants, toast]);

  const pinParticipant = useCallback((participantId: string) => {
    const newPinnedId = pinnedParticipant === participantId ? null : participantId;
    setPinnedParticipant(newPinnedId);
    
    if (newPinnedId) {
      setLayout("speaker");
      setDominantSpeaker(newPinnedId); // Override automatic speaker detection
    }
  }, [pinnedParticipant]);

  // Layout controls
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  // Get video refs for rendering
  const getVideoRef = useCallback((participantId: string) => {
    if (!videoRefsRef.current.has(participantId)) {
      videoRefsRef.current.set(participantId, { current: null });
    }
    return videoRefsRef.current.get(participantId)!;
  }, []);

  const getRemoteVideoRefs = useCallback(() => {
    return participants
      .filter(p => !p.isCurrentUser)
      .map(p => getVideoRef(p.id));
  }, [participants, getVideoRef]);

  // Connection quality updates
  const updateConnectionQuality = useCallback((participantId: string, quality: ConnectionQuality) => {
    if (!participantManagerRef.current) return;
    
    participantManagerRef.current.updateConnectionQuality(participantId, quality);
  }, []);

  const currentUser = participants.find(p => p.isCurrentUser);
  const isHost = currentUser?.isHost || false;
  const speakerToShow = pinnedParticipant || dominantSpeaker;

  return {
    // State
    participants,
    layout,
    dominantSpeaker: speakerToShow,
    pinnedParticipant,
    isFullscreen,
    isHost,
    
    // Actions
    addParticipant,
    removeParticipant,
    updateParticipant,
    attachAudioStream,
    muteParticipant,
    makeHost,
    pinParticipant,
    updateConnectionQuality,
    
    // Layout controls
    setLayout,
    toggleFullscreen,
    
    // Video refs
    getVideoRef,
    getRemoteVideoRefs,
    
    // Utility
    participantCount: participants.length
  };
}