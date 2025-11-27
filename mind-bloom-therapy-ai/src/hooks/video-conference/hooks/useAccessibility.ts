
import { useCallback, useRef, useState } from 'react';

interface AccessibilityOptions {
  screenReader: boolean;
  highContrast: boolean;
  largeText: boolean;
}

export function useAccessibility(
  containerRef: React.RefObject<HTMLElement>,
  defaultOptions: AccessibilityOptions = {
    screenReader: false,
    highContrast: false,
    largeText: false
  }
) {
  const [options, setOptions] = useState<AccessibilityOptions>(defaultOptions);
  const announcementRef = useRef<HTMLDivElement | null>(null);
  
  // Create announcement div if it doesn't exist
  const ensureAnnouncementDiv = useCallback(() => {
    if (!announcementRef.current) {
      const div = document.createElement('div');
      div.setAttribute('role', 'status');
      div.setAttribute('aria-live', 'polite');
      div.classList.add('sr-only');
      
      document.body.appendChild(div);
      announcementRef.current = div;
    }
    
    return announcementRef.current;
  }, []);
  
  // Announce message for screen readers
  const announceForScreenReader = useCallback((message: string) => {
    if (!options.screenReader) return;
    
    const announceDiv = ensureAnnouncementDiv();
    
    // Clear previous announcements and add new one after a small delay
    announceDiv.textContent = '';
    
    setTimeout(() => {
      if (announceDiv) {
        announceDiv.textContent = message;
      }
    }, 100);
  }, [options.screenReader, ensureAnnouncementDiv]);
  
  // Toggle high contrast mode
  const toggleHighContrast = useCallback(() => {
    setOptions(prev => ({ ...prev, highContrast: !prev.highContrast }));
    
    if (containerRef.current) {
      containerRef.current.classList.toggle('high-contrast-mode');
    }
    
    announceForScreenReader(
      options.highContrast ? 'High contrast mode disabled' : 'High contrast mode enabled'
    );
    
    return !options.highContrast;
  }, [options.highContrast, containerRef, announceForScreenReader]);
  
  // Toggle large text mode
  const toggleLargeText = useCallback(() => {
    setOptions(prev => ({ ...prev, largeText: !prev.largeText }));
    
    if (containerRef.current) {
      containerRef.current.classList.toggle('large-text-mode');
    }
    
    announceForScreenReader(
      options.largeText ? 'Large text mode disabled' : 'Large text mode enabled'
    );
    
    return !options.largeText;
  }, [options.largeText, containerRef, announceForScreenReader]);
  
  // Toggle screen reader announcements
  const toggleScreenReader = useCallback(() => {
    setOptions(prev => ({ ...prev, screenReader: !prev.screenReader }));
    return !options.screenReader;
  }, [options.screenReader]);
  
  // Clean up announcement div on unmount
  const cleanup = useCallback(() => {
    if (announcementRef.current) {
      announcementRef.current.remove();
      announcementRef.current = null;
    }
  }, []);
  
  return {
    options,
    announceForScreenReader,
    toggleHighContrast,
    toggleLargeText,
    toggleScreenReader,
    cleanup
  };
}
