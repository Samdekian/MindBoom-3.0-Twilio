export interface MediaStreamRouterOptions {
  onStreamUpdate: (streams: Record<string, MediaStream>) => void;
  onLocalStreamUpdate: (stream: MediaStream | null) => void;
}

export class MediaStreamRouter {
  private localStream: MediaStream | null = null;
  private remoteStreams = new Map<string, MediaStream>();
  private options: MediaStreamRouterOptions;

  constructor(options: MediaStreamRouterOptions) {
    this.options = options;
  }

  async getLocalStream(constraints: MediaStreamConstraints = { video: true, audio: true }): Promise<MediaStream | null> {
    try {
      // Stop existing stream first
      if (this.localStream) {
        this.stopLocalStream();
      }

      console.log('🎥 [MediaStreamRouter] Requesting local media with constraints:', constraints);
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log('✅ [MediaStreamRouter] Local stream acquired:', {
        video: this.localStream.getVideoTracks().length,
        audio: this.localStream.getAudioTracks().length
      });

      this.options.onLocalStreamUpdate(this.localStream);
      return this.localStream;
    } catch (error) {
      console.error('❌ [MediaStreamRouter] Failed to get local stream:', error);
      this.options.onLocalStreamUpdate(null);
      return null;
    }
  }

  setRemoteStream(userId: string, stream: MediaStream): void {
    console.log('📺 [MediaStreamRouter] Setting remote stream for:', userId, {
      video: stream.getVideoTracks().length,
      audio: stream.getAudioTracks().length
    });

    this.remoteStreams.set(userId, stream);
    this.notifyStreamUpdate();
  }

  removeRemoteStream(userId: string): void {
    console.log('🗑️ [MediaStreamRouter] Removing remote stream for:', userId);
    
    const stream = this.remoteStreams.get(userId);
    if (stream) {
      // Clean up stream tracks
      stream.getTracks().forEach(track => {
        track.stop();
      });
    }
    
    this.remoteStreams.delete(userId);
    this.notifyStreamUpdate();
  }

  getCurrentLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStreams(): Record<string, MediaStream> {
    const streams: Record<string, MediaStream> = {};
    this.remoteStreams.forEach((stream, userId) => {
      streams[userId] = stream;
    });
    return streams;
  }

  getRemoteStream(userId: string): MediaStream | null {
    return this.remoteStreams.get(userId) || null;
  }

  toggleVideoTrack(): boolean {
    if (!this.localStream) return false;

    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      console.log('📹 [MediaStreamRouter] Video toggled:', videoTrack.enabled);
      return videoTrack.enabled;
    }
    return false;
  }

  toggleAudioTrack(): boolean {
    if (!this.localStream) return false;

    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      console.log('🎤 [MediaStreamRouter] Audio toggled:', audioTrack.enabled);
      return audioTrack.enabled;
    }
    return false;
  }

  async switchCamera(deviceId: string): Promise<boolean> {
    try {
      const constraints: MediaStreamConstraints = {
        video: { deviceId: { exact: deviceId } },
        audio: this.localStream?.getAudioTracks().length ? true : false
      };

      const newStream = await this.getLocalStream(constraints);
      return newStream !== null;
    } catch (error) {
      console.error('❌ [MediaStreamRouter] Failed to switch camera:', error);
      return false;
    }
  }

  async switchMicrophone(deviceId: string): Promise<boolean> {
    try {
      const constraints: MediaStreamConstraints = {
        video: this.localStream?.getVideoTracks().length ? true : false,
        audio: { deviceId: { exact: deviceId } }
      };

      const newStream = await this.getLocalStream(constraints);
      return newStream !== null;
    } catch (error) {
      console.error('❌ [MediaStreamRouter] Failed to switch microphone:', error);
      return false;
    }
  }

  stopLocalStream(): void {
    if (this.localStream) {
      console.log('🛑 [MediaStreamRouter] Stopping local stream');
      this.localStream.getTracks().forEach(track => {
        track.stop();
      });
      this.localStream = null;
      this.options.onLocalStreamUpdate(null);
    }
  }

  cleanup(): void {
    console.log('🧹 [MediaStreamRouter] Cleaning up all streams');
    
    // Stop local stream
    this.stopLocalStream();
    
    // Clean up remote streams
    this.remoteStreams.forEach((stream, userId) => {
      stream.getTracks().forEach(track => track.stop());
    });
    this.remoteStreams.clear();
    
    this.notifyStreamUpdate();
  }

  private notifyStreamUpdate(): void {
    this.options.onStreamUpdate(this.getRemoteStreams());
  }

  getStreamStats(): { local: boolean; remote: number; totalTracks: number } {
    const remoteTracks = Array.from(this.remoteStreams.values())
      .reduce((total, stream) => total + stream.getTracks().length, 0);
    
    const localTracks = this.localStream?.getTracks().length || 0;
    
    return {
      local: !!this.localStream,
      remote: this.remoteStreams.size,
      totalTracks: localTracks + remoteTracks
    };
  }
}