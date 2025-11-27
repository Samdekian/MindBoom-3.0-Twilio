export interface AgoraConfig {
  appId: string;
  channel: string;
  token?: string;
  uid?: number;
  expireTime?: number;
}

export interface ParticipantStream {
  id: string;
  session_id: string;
  user_id?: string;
  participant_name?: string;
  agora_uid: number;
  stream_type: 'video' | 'audio' | 'screen';
  is_publishing: boolean;
  is_subscribed: boolean;
  video_quality: 'low' | 'medium' | 'high';
  audio_quality: 'low' | 'medium' | 'high';
  connection_quality: 'excellent' | 'good' | 'poor' | 'disconnected';
  joined_at: string;
  left_at?: string;
  is_active: boolean;
}

export interface SFURoom {
  id: string;
  room_id: string;
  agora_app_id: string;
  agora_channel_name: string;
  max_participants: number;
  created_at: string;
  expires_at: string;
  is_active: boolean;
  host_user_id: string;
  recording_enabled: boolean;
  recording_resource_id?: string;
  recording_sid?: string;
}

export interface AgoraStreamStats {
  uid: number;
  audioReceiveDelay?: number;
  audioReceivePacketsLost?: number;
  videoReceiveDelay?: number;
  videoReceivePacketsLost?: number;
  networkQuality?: {
    downlink: number;
    uplinkNetwork: number;
  };
}

export type SessionType = 'peer_to_peer' | 'group_sfu';
export type SessionStatus = 'created' | 'waiting' | 'connecting' | 'active' | 'ended' | 'expired';