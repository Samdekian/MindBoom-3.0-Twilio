
import { useState } from 'react';

export interface DeviceChecklist {
  camera: boolean;
  microphone: boolean;
  speaker: boolean;
}

export interface EnvironmentChecklist {
  network: boolean;
  lighting: boolean;
  noise: boolean;
}

export interface PreparationState {
  deviceChecklist: DeviceChecklist;
  environmentChecklist: EnvironmentChecklist;
  updateDeviceChecklist: (device: keyof DeviceChecklist, value: boolean) => void;
  updateEnvironmentChecklist: (env: keyof EnvironmentChecklist, value: boolean) => void;
  getOverallProgress: () => number;
}

/**
 * usePreparationState Hook
 * 
 * Manages the state for video conference preparation including device and environment checklists
 * 
 * @returns {PreparationState} Object containing checklist states and update functions
 */
export const usePreparationState = (): PreparationState => {
  const [deviceChecklist, setDeviceChecklist] = useState<DeviceChecklist>({
    camera: false,
    microphone: false,
    speaker: false
  });

  const [environmentChecklist, setEnvironmentChecklist] = useState<EnvironmentChecklist>({
    network: false,
    lighting: false,
    noise: false
  });

  const updateDeviceChecklist = (device: keyof DeviceChecklist, value: boolean) => {
    setDeviceChecklist((prev) => ({
      ...prev,
      [device]: value
    }));
  };

  const updateEnvironmentChecklist = (env: keyof EnvironmentChecklist, value: boolean) => {
    setEnvironmentChecklist((prev) => ({
      ...prev,
      [env]: value
    }));
  };

  const getOverallProgress = (): number => {
    const totalItems = 
      Object.keys(deviceChecklist).length + 
      Object.keys(environmentChecklist).length;
    
    const completedItems = 
      Object.values(deviceChecklist).filter(Boolean).length + 
      Object.values(environmentChecklist).filter(Boolean).length;
    
    return Math.round((completedItems / totalItems) * 100);
  };

  return {
    deviceChecklist,
    environmentChecklist,
    updateDeviceChecklist,
    updateEnvironmentChecklist,
    getOverallProgress
  };
};
