// Enhanced ICE server configuration with multiple STUN and TURN servers
export interface ICEServerConfig {
  iceServers: RTCIceServer[];
  iceCandidatePoolSize?: number;
  iceTransportPolicy?: RTCIceTransportPolicy;
}

export interface TurnCredentials {
  username: string;
  credential: string;
}

// TURN server providers with fallback options
const TURN_SERVERS = [
  // Twilio TURN servers (recommended for production)
  {
    urls: [
      'turn:global.turn.twilio.com:3478',
      'turns:global.turn.twilio.com:443'
    ],
    username: 'twilio-turn-username', // Should be fetched from secure storage
    credential: 'twilio-turn-credential'
  },
  // Add more TURN providers as fallbacks
];

// Multiple STUN server providers for better reliability
const STUN_SERVERS = [
  // Google STUN servers
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  
  // Mozilla STUN servers
  { urls: 'stun:stun.services.mozilla.com' },
  
  // Other reliable STUN servers
  { urls: 'stun:stun.stunprotocol.org:3478' },
  { urls: 'stun:stun.voiparound.com' },
  { urls: 'stun:stun.voipbuster.com' }
];

export class ICEServerManager {
  private static instance: ICEServerManager;
  private currentConfig: ICEServerConfig;
  private turnCredentials: TurnCredentials | null = null;

  private constructor() {
    this.currentConfig = this.getDefaultConfig();
  }

  static getInstance(): ICEServerManager {
    if (!ICEServerManager.instance) {
      ICEServerManager.instance = new ICEServerManager();
    }
    return ICEServerManager.instance;
  }

  private getDefaultConfig(): ICEServerConfig {
    // Limit to 2 STUN and 2 TURN servers maximum (Twilio recommendation)
    const iceServers: RTCIceServer[] = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478' }
    ];
    
    // Add only primary TURN servers if credentials available
    if (this.turnCredentials) {
      iceServers.push(
        {
          urls: 'turn:global.turn.twilio.com:3478?transport=udp',
          username: this.turnCredentials.username,
          credential: this.turnCredentials.credential
        },
        {
          urls: 'turn:global.turn.twilio.com:3478?transport=tcp',
          username: this.turnCredentials.username,
          credential: this.turnCredentials.credential
        }
      );
    }

    return {
      iceServers,
      iceCandidatePoolSize: 10, // Pre-gather ICE candidates
      iceTransportPolicy: 'all' // Use both STUN and TURN
    };
  }

  async initializeTurnCredentials(): Promise<void> {
    try {
      console.log('🔧 [ICEServerManager] Fetching TURN credentials from Twilio...');
      
      // Import supabase client dynamically to avoid circular dependencies
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Call our edge function to get fresh TURN credentials
      const { data, error } = await supabase.functions.invoke('get-turn-credentials');
      
      if (error) {
        console.warn('⚠️ [ICEServerManager] Failed to get TURN credentials, falling back to STUN-only:', error);
        this.updateConfig();
        return;
      }

      if (data && data.iceServers) {
        console.log('✅ [ICEServerManager] Received fresh TURN credentials from Twilio');
        
        // Update our configuration with the fresh credentials
        this.currentConfig = {
          iceServers: data.iceServers,
          iceCandidatePoolSize: data.iceCandidatePoolSize || 10,
          iceTransportPolicy: data.iceTransportPolicy || 'all'
        };
        
        // Store credentials for future reference
        if (data.credentials) {
          this.turnCredentials = {
            username: data.credentials.username,
            credential: data.credentials.credential
          };
        }
        
        console.log('✅ [ICEServerManager] ICE server configuration ready with TURN support');
      } else {
        console.warn('⚠️ [ICEServerManager] Invalid response from TURN service, using STUN-only');
        this.updateConfig();
      }
    } catch (error) {
      console.warn('⚠️ [ICEServerManager] Failed to initialize TURN credentials, using STUN-only:', error);
      this.updateConfig();
    }
  }

  setTurnCredentials(credentials: TurnCredentials): void {
    this.turnCredentials = credentials;
    this.updateConfig();
    console.log('🔧 [ICEServerManager] TURN credentials updated');
  }

  private updateConfig(): void {
    this.currentConfig = this.getDefaultConfig();
  }

  getConfig(preferLocal: boolean = false): ICEServerConfig {
    // If preferLocal is true, return STUN-only config for better quality on local networks
    if (preferLocal) {
      console.log('🏠 [ICEServerManager] Using local-optimized config (STUN-only for better quality)');
      return {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ],
        iceCandidatePoolSize: 0, // Disable pooling to use first working candidate
        iceTransportPolicy: 'all'
      };
    }
    return { ...this.currentConfig };
  }

  // Test ICE server connectivity
  async testICEServers(): Promise<{ working: RTCIceServer[], failed: RTCIceServer[] }> {
    const working: RTCIceServer[] = [];
    const failed: RTCIceServer[] = [];

    console.log('🧪 [ICEServerManager] Testing ICE server connectivity...');

    for (const server of this.currentConfig.iceServers) {
      try {
        const pc = new RTCPeerConnection({ iceServers: [server] });
        
        // Create a data channel to trigger ICE gathering
        pc.createDataChannel('test');
        
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            pc.close();
            reject(new Error('Timeout'));
          }, 5000);

          pc.onicecandidate = (event) => {
            if (event.candidate) {
              clearTimeout(timeout);
              pc.close();
              resolve();
            }
          };

          pc.onicegatheringstatechange = () => {
            if (pc.iceGatheringState === 'complete') {
              clearTimeout(timeout);
              pc.close();
              resolve();
            }
          };

          // Start ICE gathering
          pc.createOffer().then(offer => pc.setLocalDescription(offer));
        });

        working.push(server);
        console.log('✅ [ICEServerManager] Server working:', server.urls);
      } catch (error) {
        failed.push(server);
        console.warn('❌ [ICEServerManager] Server failed:', server.urls, error);
      }
    }

    console.log(`🧪 [ICEServerManager] Test complete: ${working.length} working, ${failed.length} failed`);
    return { working, failed };
  }

  // Get server health status
  async getServerHealth(): Promise<{
    totalServers: number;
    stunServers: number;
    turnServers: number;
    workingServers: number;
    hasTurnCredentials: boolean;
  }> {
    const { working } = await this.testICEServers();
    
    const stunCount = this.currentConfig.iceServers.filter(s => 
      Array.isArray(s.urls) ? s.urls.some(url => url.startsWith('stun:')) : s.urls.startsWith('stun:')
    ).length;
    
    const turnCount = this.currentConfig.iceServers.filter(s => 
      Array.isArray(s.urls) ? s.urls.some(url => url.startsWith('turn:')) : s.urls.startsWith('turn:')
    ).length;

    return {
      totalServers: this.currentConfig.iceServers.length,
      stunServers: stunCount,
      turnServers: turnCount,
      workingServers: working.length,
      hasTurnCredentials: this.turnCredentials !== null
    };
  }
}

// Export singleton instance
export const iceServerManager = ICEServerManager.getInstance();
