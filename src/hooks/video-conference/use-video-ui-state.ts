
import { useState, useCallback } from 'react';

export function useVideoUIState() {
  const [deviceSettingsOpen, setDeviceSettingsOpen] = useState<boolean>(false);
  const [showSessionSummary, setShowSessionSummary] = useState<boolean>(false);
  
  const completePreparation = useCallback((patientId: string, therapistId: string) => {
    // Add logic to check if all necessary preparations are complete
    // For example, check if participant info is loaded
    return patientId !== '' && therapistId !== '';
  }, []);
  
  return {
    deviceSettingsOpen,
    setDeviceSettingsOpen,
    showSessionSummary,
    setShowSessionSummary,
    completePreparation
  };
}
