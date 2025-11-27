
import { useCallback, useState, useEffect } from 'react';

export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export function useHapticFeedback() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('vibrate' in navigator);
    
    // Get user preference from localStorage
    const stored = localStorage.getItem('haptic-feedback-enabled');
    if (stored !== null) {
      setIsEnabled(JSON.parse(stored));
    }
  }, []);

  const vibrate = useCallback((pattern: HapticPattern) => {
    if (!isEnabled || !isSupported) return;

    const patterns = {
      light: [10],
      medium: [25],
      heavy: [50],
      success: [10, 50, 10],
      warning: [25, 100, 25],
      error: [100, 50, 100]
    };

    try {
      navigator.vibrate(patterns[pattern]);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }, [isEnabled, isSupported]);

  const toggleHaptic = useCallback(() => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    localStorage.setItem('haptic-feedback-enabled', JSON.stringify(newState));
    
    if (newState && isSupported) {
      vibrate('light'); // Confirmation vibration
    }
  }, [isEnabled, isSupported, vibrate]);

  return {
    vibrate,
    isEnabled,
    isSupported,
    toggleHaptic
  };
}
