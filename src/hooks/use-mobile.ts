
import { useState, useEffect } from 'react';

// Mobile breakpoint constant
const MOBILE_BREAKPOINT = 768;

/**
 * Hook to detect if the current device is mobile based on screen width
 * @returns Boolean indicating if the current device is mobile
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}

/**
 * Custom hook for responsive media queries
 * @param query Media query string to check
 * @returns Boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Check if window is defined (to handle SSR)
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query);
      
      // Set initial value
      setMatches(media.matches);
      
      // Add listener for changes to media query
      const listener = (event: MediaQueryListEvent) => {
        setMatches(event.matches);
      };
      
      // Attach the listener
      if (media.addEventListener) {
        media.addEventListener('change', listener);
      } else {
        // Fallback for older browsers
        media.addListener(listener);
      }
      
      // Cleanup function
      return () => {
        if (media.removeEventListener) {
          media.removeEventListener('change', listener);
        } else {
          // Fallback for older browsers
          media.removeListener(listener);
        }
      };
    }
    
    // Default to false if window is not defined
    return undefined;
  }, [query]);

  return matches;
}
