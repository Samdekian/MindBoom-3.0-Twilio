/**
 * Advanced Recording System for WebRTC Sessions
 * Features: Multiple formats, AI transcription, analytics
 */

export interface RecordingOptions {
  format: 'webm' | 'mp4' | 'audio-only';
  quality: 'low' | 'medium' | 'high' | 'ultra';
  includeScreenShare: boolean;
  enableTranscription: boolean;
  enableAnalytics: boolean;
  maxDuration?: number; // in minutes
  chunkDuration?: number; // in seconds for streaming upload
}

export interface RecordingChunk {
  id: string;
  timestamp: number;
  duration: number;
  size: number;
  data: Blob;
  metadata: {
    participants: string[];
    quality: string;
    hasVideo: boolean;
    hasAudio: boolean;
  };
}

export interface RecordingAnalytics {
  sessionId: string;
  startTime: number;
  endTime?: number;
  totalDuration: number;
  participantStats: {
    [userId: string]: {
      speakingTime: number;
      silenceTime: number;
      videoOnTime: number;
      connectionQuality: number[];
    };
  };
  qualityMetrics: {
    averageBitrate: number;
    frameDrops: number;
    audioDropouts: number;
    networkStability: number;
  };
  transcription?: {
    text: string;
    confidence: number;
    speakers: string[];
    timestamps: { start: number; end: number; speaker: string; text: string }[];
  };
}

export class AdvancedRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private recordingChunks: RecordingChunk[] = [];
  private analytics: RecordingAnalytics;
  private options: RecordingOptions;
  private isRecording = false;
  private isPaused = false;
  private startTime = 0;
  private chunkIndex = 0;

  constructor(
    private sessionId: string,
    private localStream: MediaStream,
    private remoteStreams: MediaStream[],
    options: Partial<RecordingOptions> = {}
  ) {
    this.options = {
      format: 'webm',
      quality: 'high',
      includeScreenShare: true,
      enableTranscription: true,
      enableAnalytics: true,
      chunkDuration: 30,
      ...options
    };

    this.analytics = {
      sessionId,
      startTime: 0,
      totalDuration: 0,
      participantStats: {},
      qualityMetrics: {
        averageBitrate: 0,
        frameDrops: 0,
        audioDropouts: 0,
        networkStability: 1.0
      }
    };
  }

  async startRecording(): Promise<boolean> {
    try {
      console.log('🎥 [AdvancedRecorder] Starting recording with options:', this.options);

      // Create combined stream
      const combinedStream = await this.createCombinedStream();
      
      // Configure MediaRecorder
      const mimeType = this.getMimeType();
      const options = this.getRecorderOptions();

      this.mediaRecorder = new MediaRecorder(combinedStream, { mimeType, ...options });
      
      // Set up event handlers
      this.setupRecorderEvents();

      // Start recording
      this.mediaRecorder.start(this.options.chunkDuration ? this.options.chunkDuration * 1000 : undefined);
      
      this.isRecording = true;
      this.startTime = Date.now();
      this.analytics.startTime = this.startTime;

      // Start analytics collection
      if (this.options.enableAnalytics) {
        this.startAnalyticsCollection();
      }

      console.log('✅ [AdvancedRecorder] Recording started successfully');
      return true;
    } catch (error) {
      console.error('❌ [AdvancedRecorder] Failed to start recording:', error);
      return false;
    }
  }

  async stopRecording(): Promise<RecordingAnalytics | null> {
    try {
      if (!this.mediaRecorder || !this.isRecording) {
        console.warn('⚠️ [AdvancedRecorder] No active recording to stop');
        return null;
      }

      console.log('🛑 [AdvancedRecorder] Stopping recording...');

      return new Promise((resolve) => {
        this.mediaRecorder!.onstop = async () => {
          this.isRecording = false;
          this.analytics.endTime = Date.now();
          this.analytics.totalDuration = this.analytics.endTime - this.analytics.startTime;

          // Process final recording
          await this.processFinalRecording();

          // Generate transcription if enabled
          if (this.options.enableTranscription) {
            await this.generateTranscription();
          }

          console.log('✅ [AdvancedRecorder] Recording stopped and processed');
          resolve(this.analytics);
        };

        this.mediaRecorder!.stop();
      });
    } catch (error) {
      console.error('❌ [AdvancedRecorder] Failed to stop recording:', error);
      return null;
    }
  }

  pauseRecording(): boolean {
    try {
      if (!this.mediaRecorder || !this.isRecording || this.isPaused) {
        return false;
      }

      this.mediaRecorder.pause();
      this.isPaused = true;
      console.log('⏸️ [AdvancedRecorder] Recording paused');
      return true;
    } catch (error) {
      console.error('❌ [AdvancedRecorder] Failed to pause recording:', error);
      return false;
    }
  }

  resumeRecording(): boolean {
    try {
      if (!this.mediaRecorder || !this.isRecording || !this.isPaused) {
        return false;
      }

      this.mediaRecorder.resume();
      this.isPaused = false;
      console.log('▶️ [AdvancedRecorder] Recording resumed');
      return true;
    } catch (error) {
      console.error('❌ [AdvancedRecorder] Failed to resume recording:', error);
      return false;
    }
  }

  getRecordingState() {
    return {
      isRecording: this.isRecording,
      isPaused: this.isPaused,
      duration: this.isRecording ? Date.now() - this.startTime : 0,
      chunks: this.recordingChunks.length,
      analytics: this.analytics
    };
  }

  private async createCombinedStream(): Promise<MediaStream> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    // Set canvas size based on quality
    const dimensions = this.getCanvasDimensions();
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // Create combined video stream
    const canvasStream = canvas.captureStream(30);
    
    // Combine audio from all streams
    const audioContext = new AudioContext();
    const destination = audioContext.createMediaStreamDestination();
    
    // Add local audio
    if (this.localStream.getAudioTracks().length > 0) {
      const localAudio = audioContext.createMediaStreamSource(this.localStream);
      localAudio.connect(destination);
    }

    // Add remote audio
    this.remoteStreams.forEach(stream => {
      if (stream.getAudioTracks().length > 0) {
        const remoteAudio = audioContext.createMediaStreamSource(stream);
        remoteAudio.connect(destination);
      }
    });

    // Combine video and audio
    const combinedStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...destination.stream.getAudioTracks()
    ]);

    // Start video composition
    this.startVideoComposition(canvas, ctx);

    return combinedStream;
  }

  private startVideoComposition(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    const drawFrame = () => {
      if (!this.isRecording) return;

      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw local video
      const localVideo = this.getVideoElement(this.localStream);
      if (localVideo) {
        ctx.drawImage(localVideo, 0, 0, canvas.width / 2, canvas.height);
      }

      // Draw remote videos
      this.remoteStreams.forEach((stream, index) => {
        const remoteVideo = this.getVideoElement(stream);
        if (remoteVideo) {
          const x = (canvas.width / 2) + ((index % 2) * (canvas.width / 4));
          const y = Math.floor(index / 2) * (canvas.height / 2);
          ctx.drawImage(remoteVideo, x, y, canvas.width / 4, canvas.height / 2);
        }
      });

      // Add recording indicator
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(canvas.width - 30, 30, 10, 0, 2 * Math.PI);
      ctx.fill();

      requestAnimationFrame(drawFrame);
    };

    drawFrame();
  }

  private getVideoElement(stream: MediaStream): HTMLVideoElement | null {
    const video = document.createElement('video');
    video.srcObject = stream;
    video.play();
    return video.readyState >= 2 ? video : null;
  }

  private getMimeType(): string {
    const formats = {
      webm: 'video/webm;codecs=vp9,opus',
      mp4: 'video/mp4;codecs=h264,aac',
      'audio-only': 'audio/webm;codecs=opus'
    };

    const preferredType = formats[this.options.format];
    
    if (MediaRecorder.isTypeSupported(preferredType)) {
      return preferredType;
    }

    // Fallback to supported format
    const fallbacks = Object.values(formats);
    for (const type of fallbacks) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return '';
  }

  private getRecorderOptions() {
    const qualitySettings = {
      low: { videoBitsPerSecond: 250000, audioBitsPerSecond: 64000 },
      medium: { videoBitsPerSecond: 1000000, audioBitsPerSecond: 128000 },
      high: { videoBitsPerSecond: 2500000, audioBitsPerSecond: 192000 },
      ultra: { videoBitsPerSecond: 8000000, audioBitsPerSecond: 320000 }
    };

    return qualitySettings[this.options.quality];
  }

  private getCanvasDimensions() {
    const dimensions = {
      low: { width: 640, height: 480 },
      medium: { width: 1280, height: 720 },
      high: { width: 1920, height: 1080 },
      ultra: { width: 3840, height: 2160 }
    };

    return dimensions[this.options.quality];
  }

  private setupRecorderEvents() {
    if (!this.mediaRecorder) return;

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        const chunk: RecordingChunk = {
          id: `chunk-${this.chunkIndex++}`,
          timestamp: Date.now(),
          duration: this.options.chunkDuration || 30,
          size: event.data.size,
          data: event.data,
          metadata: {
            participants: ['local', ...this.remoteStreams.map((_, i) => `remote-${i}`)],
            quality: this.options.quality,
            hasVideo: this.options.format !== 'audio-only',
            hasAudio: true
          }
        };

        this.recordingChunks.push(chunk);
        
        // Upload chunk if streaming is enabled
        this.uploadChunk(chunk);
      }
    };

    this.mediaRecorder.onerror = (event) => {
      console.error('❌ [AdvancedRecorder] Recording error:', event);
    };
  }

  private async uploadChunk(chunk: RecordingChunk) {
    try {
      // Upload chunk to storage (Supabase)
      const formData = new FormData();
      formData.append('chunk', chunk.data);
      formData.append('metadata', JSON.stringify({
        sessionId: this.sessionId,
        chunkId: chunk.id,
        timestamp: chunk.timestamp,
        ...chunk.metadata
      }));

      // This would be implemented to upload to Supabase storage
      console.log('📤 [AdvancedRecorder] Uploading chunk:', chunk.id);
    } catch (error) {
      console.error('❌ [AdvancedRecorder] Failed to upload chunk:', error);
    }
  }

  private async processFinalRecording() {
    try {
      // Combine all chunks into final recording
      const finalBlob = new Blob(
        this.recordingChunks.map(chunk => chunk.data),
        { type: this.getMimeType() }
      );

      // Upload final recording
      const formData = new FormData();
      formData.append('recording', finalBlob);
      formData.append('analytics', JSON.stringify(this.analytics));
      formData.append('sessionId', this.sessionId);

      console.log('📤 [AdvancedRecorder] Uploading final recording...');
      // This would upload to Supabase storage
    } catch (error) {
      console.error('❌ [AdvancedRecorder] Failed to process final recording:', error);
    }
  }

  private async generateTranscription() {
    try {
      if (this.recordingChunks.length === 0) return;

      // Extract audio from recording chunks
      const audioBlob = new Blob(
        this.recordingChunks.map(chunk => chunk.data),
        { type: 'audio/webm' }
      );

      // Send to transcription service
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('sessionId', this.sessionId);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const transcription = await response.json();
        this.analytics.transcription = transcription;
        console.log('✅ [AdvancedRecorder] Transcription generated');
      }
    } catch (error) {
      console.error('❌ [AdvancedRecorder] Failed to generate transcription:', error);
    }
  }

  private startAnalyticsCollection() {
    const interval = setInterval(() => {
      if (!this.isRecording) {
        clearInterval(interval);
        return;
      }

      // Collect real-time analytics
      this.collectAnalytics();
    }, 1000);
  }

  private collectAnalytics() {
    // This would collect real-time analytics from WebRTC stats
    // Including bitrate, frame drops, audio levels, etc.
    console.log('📊 [AdvancedRecorder] Collecting analytics...');
  }
}