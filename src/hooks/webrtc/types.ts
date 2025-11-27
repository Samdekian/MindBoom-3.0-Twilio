
import { VideoState } from "../video-conference/types";

export interface VideoDevices {
  cameras: MediaDeviceInfo[];
  microphones: MediaDeviceInfo[];
  speakers: MediaDeviceInfo[];
  videoInputs?: MediaDeviceInfo[];
  audioInputs?: MediaDeviceInfo[];
  audioOutputs?: MediaDeviceInfo[];
  defaultDevices?: {
    camera: string | null;
    microphone: string | null;
    speaker: string | null;
  };
}

export interface WebRTCConnectionState {
  isConnected: boolean;
  connectionQuality: "excellent" | "good" | "fair" | "poor" | "disconnected";
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  peerConnection: RTCPeerConnection | null;
}
