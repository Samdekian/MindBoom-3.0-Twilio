import { ParticipantInfo, ConnectionQuality } from '@/types/video-session';

export interface ParticipantManagerOptions {
  onParticipantUpdate?: (participant: ParticipantInfo) => void;
  onSpeakerDetected?: (participantId: string) => void;
  onDominantSpeakerChanged?: (participantId: string) => void;
}

export class ParticipantManager {
  private participants = new Map<string, ParticipantInfo>();
  private audioContext: AudioContext | null = null;
  private analyzerNodes = new Map<string, AnalyserNode>();
  private speakingThreshold = 0.01;
  private speakingDetectionInterval: NodeJS.Timeout | null = null;
  private dominantSpeaker: string | null = null;
  
  constructor(private options: ParticipantManagerOptions = {}) {
    this.initializeAudioAnalysis();
  }

  private initializeAudioAnalysis(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.startSpeakingDetection();
    } catch (error) {
      console.warn('Audio analysis not available:', error);
    }
  }

  addParticipant(participant: ParticipantInfo): void {
    this.participants.set(participant.id, {
      ...participant,
      isSpeaking: false,
      connectionQuality: 'good',
      lastSpeakingTime: 0
    });
    
    this.options.onParticipantUpdate?.(participant);
  }

  removeParticipant(participantId: string): void {
    this.participants.delete(participantId);
    this.analyzerNodes.delete(participantId);
    
    // If removed participant was dominant speaker, clear it
    if (this.dominantSpeaker === participantId) {
      this.dominantSpeaker = null;
    }
  }

  updateParticipant(participantId: string, updates: Partial<ParticipantInfo>): void {
    const participant = this.participants.get(participantId);
    if (participant) {
      const updatedParticipant = { ...participant, ...updates };
      this.participants.set(participantId, updatedParticipant);
      this.options.onParticipantUpdate?.(updatedParticipant);
    }
  }

  getParticipant(participantId: string): ParticipantInfo | null {
    return this.participants.get(participantId) || null;
  }

  getAllParticipants(): ParticipantInfo[] {
    return Array.from(this.participants.values());
  }

  getParticipantCount(): number {
    return this.participants.size;
  }

  // Audio stream analysis for speaking detection
  attachAudioStream(participantId: string, stream: MediaStream): void {
    if (!this.audioContext || !stream) return;
    
    const audioTrack = stream.getAudioTracks()[0];
    if (!audioTrack) return;

    try {
      const source = this.audioContext.createMediaStreamSource(stream);
      const analyzer = this.audioContext.createAnalyser();
      
      analyzer.fftSize = 256;
      analyzer.smoothingTimeConstant = 0.8;
      
      source.connect(analyzer);
      this.analyzerNodes.set(participantId, analyzer);
    } catch (error) {
      console.warn('Failed to attach audio analysis for participant:', participantId, error);
    }
  }

  private startSpeakingDetection(): void {
    if (this.speakingDetectionInterval) return;

    this.speakingDetectionInterval = setInterval(() => {
      this.detectSpeaking();
    }, 100); // Check every 100ms
  }

  private detectSpeaking(): void {
    if (!this.audioContext) return;

    let loudestParticipant: string | null = null;
    let loudestVolume = 0;

    this.analyzerNodes.forEach((analyzer, participantId) => {
      const participant = this.participants.get(participantId);
      if (!participant || !participant.isAudioEnabled) return;

      const dataArray = new Uint8Array(analyzer.frequencyBinCount);
      analyzer.getByteFrequencyData(dataArray);

      // Calculate average volume
      const sum = dataArray.reduce((acc, value) => acc + value, 0);
      const average = sum / dataArray.length;
      const normalizedVolume = average / 255;

      const isSpeaking = normalizedVolume > this.speakingThreshold;
      const wasAlreadySpeaking = participant.isSpeaking;

      // Update participant speaking state
      if (isSpeaking !== wasAlreadySpeaking) {
        this.updateParticipant(participantId, { 
          isSpeaking,
          lastSpeakingTime: isSpeaking ? Date.now() : participant.lastSpeakingTime
        });

        if (isSpeaking) {
          this.options.onSpeakerDetected?.(participantId);
        }
      }

      // Track loudest speaker for dominant speaker detection
      if (isSpeaking && normalizedVolume > loudestVolume) {
        loudestVolume = normalizedVolume;
        loudestParticipant = participantId;
      }
    });

    // Update dominant speaker
    if (loudestParticipant && loudestParticipant !== this.dominantSpeaker) {
      this.dominantSpeaker = loudestParticipant;
      this.options.onDominantSpeakerChanged?.(loudestParticipant);
    } else if (!loudestParticipant && this.dominantSpeaker) {
      // Clear dominant speaker after a delay
      setTimeout(() => {
        if (this.dominantSpeaker && !this.isAnySpeaking()) {
          this.dominantSpeaker = null;
        }
      }, 2000);
    }
  }

  private isAnySpeaking(): boolean {
    return Array.from(this.participants.values()).some(p => p.isSpeaking);
  }

  getDominantSpeaker(): string | null {
    return this.dominantSpeaker;
  }

  // Connection quality monitoring
  updateConnectionQuality(participantId: string, quality: ConnectionQuality): void {
    this.updateParticipant(participantId, { connectionQuality: quality });
  }

  // Participant actions
  muteParticipant(participantId: string): void {
    this.updateParticipant(participantId, { isAudioEnabled: false });
  }

  unmuteParticipant(participantId: string): void {
    this.updateParticipant(participantId, { isAudioEnabled: true });
  }

  disableVideo(participantId: string): void {
    this.updateParticipant(participantId, { isVideoEnabled: false });
  }

  enableVideo(participantId: string): void {
    this.updateParticipant(participantId, { isVideoEnabled: true });
  }

  makeHost(participantId: string): void {
    // Remove host status from all participants
    this.participants.forEach((participant, id) => {
      if (participant.isHost) {
        this.updateParticipant(id, { isHost: false });
      }
    });
    
    // Set new host
    this.updateParticipant(participantId, { isHost: true });
  }

  // Layout optimization
  getOptimalLayoutForCount(count: number): "grid" | "speaker" | "sidebar" {
    if (count <= 2) return "sidebar";
    if (count <= 4) return "grid";
    return "speaker"; // For larger groups, speaker view works best
  }

  // Cleanup
  destroy(): void {
    if (this.speakingDetectionInterval) {
      clearInterval(this.speakingDetectionInterval);
      this.speakingDetectionInterval = null;
    }

    this.analyzerNodes.clear();
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    
    this.participants.clear();
  }
}