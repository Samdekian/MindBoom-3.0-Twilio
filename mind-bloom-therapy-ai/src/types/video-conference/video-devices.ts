
export interface VideoDevices {
  cameras: MediaDeviceInfo[];
  microphones: MediaDeviceInfo[];
  speakers: MediaDeviceInfo[];
  videoInputs: MediaDeviceInfo[];
  audioInputs: MediaDeviceInfo[];
  audioOutputs: MediaDeviceInfo[];
  defaultDevices: {
    camera: string | null;
    microphone: string | null;
    speaker: string | null;
  };
  allDevices: MediaDeviceInfo[];
}

export function createEmptyVideoDevices(): VideoDevices {
  return {
    cameras: [],
    microphones: [],
    speakers: [],
    videoInputs: [],
    audioInputs: [],
    audioOutputs: [],
    defaultDevices: {
      camera: null,
      microphone: null,
      speaker: null
    },
    allDevices: []
  };
}

export function organizeMediaDevices(devices: MediaDeviceInfo[]): VideoDevices {
  const result: VideoDevices = createEmptyVideoDevices();
  
  result.allDevices = devices;
  result.videoInputs = devices.filter(d => d.kind === 'videoinput');
  result.audioInputs = devices.filter(d => d.kind === 'audioinput');
  result.audioOutputs = devices.filter(d => d.kind === 'audiooutput');
  
  // Aliases for convenience
  result.cameras = result.videoInputs;
  result.microphones = result.audioInputs;
  result.speakers = result.audioOutputs;
  
  // Set default devices if available
  if (result.cameras.length > 0) {
    result.defaultDevices.camera = result.cameras[0].deviceId;
  }
  
  if (result.microphones.length > 0) {
    result.defaultDevices.microphone = result.microphones[0].deviceId;
  }
  
  if (result.speakers.length > 0) {
    result.defaultDevices.speaker = result.speakers[0].deviceId;
  }
  
  return result;
}
