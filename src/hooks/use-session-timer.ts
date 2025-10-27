
import { useRef, useState, useCallback } from "react";

export const useSessionTimer = () => {
  const [sessionDuration, setSessionDuration] = useState(0);
  const durationIntervalRef = useRef<number | null>(null);

  const startTimer = useCallback(() => {
    if (durationIntervalRef.current) {
      window.clearInterval(durationIntervalRef.current);
    }
    setSessionDuration(0);
    durationIntervalRef.current = window.setInterval(() => {
      setSessionDuration(prev => prev + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (durationIntervalRef.current) {
      window.clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  }, []);

  const formatSessionDuration = useCallback(() => {
    const hours = Math.floor(sessionDuration / 3600);
    const minutes = Math.floor((sessionDuration % 3600) / 60);
    const seconds = sessionDuration % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, "0")}`;
  }, [sessionDuration]);

  return { sessionDuration, startTimer, stopTimer, formatSessionDuration };
};
