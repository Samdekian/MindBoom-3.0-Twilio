
import { useState } from 'react';

interface SessionSummary {
  appointmentId: string;
  duration: number;
  participantCount: number;
  participantNames: string[];
  wasRecorded: boolean;
  generatedAt: Date;
  content?: string;
}

/**
 * Hook for managing session summaries
 */
export function useSessionSummary() {
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  /**
   * Generate a summary for a completed session
   */
  const generateSummary = async (
    appointmentId: string,
    duration: number,
    participantNames: string[],
    wasRecorded: boolean
  ): Promise<boolean> => {
    setIsGenerating(true);
    
    try {
      // In a real application, this would call an API to generate a summary
      // For now, just simulate a delay and generate a mock summary
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newSummary: SessionSummary = {
        appointmentId,
        duration,
        participantCount: participantNames.length,
        participantNames,
        wasRecorded,
        generatedAt: new Date(),
        content: `Session lasted ${Math.floor(duration / 60)} minutes with ${participantNames.join(' and ')}.`
      };
      
      setSummary(newSummary);
      return true;
    } catch (error) {
      console.error("Error generating session summary:", error);
      return false;
    } finally {
      setIsGenerating(false);
    }
  };
  
  /**
   * Fetch an existing summary for a session
   */
  const fetchSummary = async (appointmentId: string): Promise<SessionSummary | null> => {
    setIsGenerating(true);
    
    try {
      // In a real application, this would call an API to fetch a summary
      // For now, just simulate a delay and return null
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // If we already have a summary for this appointment, return it
      if (summary && summary.appointmentId === appointmentId) {
        return summary;
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching session summary:", error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };
  
  return {
    summary,
    isGenerating,
    generateSummary,
    fetchSummary
  };
}
