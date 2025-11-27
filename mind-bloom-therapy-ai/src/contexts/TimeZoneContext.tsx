
import React, { createContext, useContext, useState, useEffect } from 'react';

interface TimeZoneContextType {
  timeZone: string;
  setTimeZone: (tz: string) => void;
  timeZones: string[];
}

const defaultTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const TimeZoneContext = createContext<TimeZoneContextType>({
  timeZone: defaultTimeZone,
  setTimeZone: () => {},
  timeZones: [],
});

export const useTimeZone = () => useContext(TimeZoneContext);

export const TimeZoneProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [timeZone, setTimeZone] = useState<string>(
    localStorage.getItem('preferredTimeZone') || defaultTimeZone
  );
  
  const [timeZones, setTimeZones] = useState<string[]>([]);

  // Load time zones
  useEffect(() => {
    // This is a simplified list of common timezones
    // In a production app, you might want to use a more complete list
    setTimeZones([
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'America/Anchorage',
      'America/Honolulu',
      'America/Toronto',
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Asia/Tokyo',
      'Asia/Shanghai',
      'Asia/Kolkata',
      'Australia/Sydney',
      'Pacific/Auckland',
    ]);
  }, []);

  // Save preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('preferredTimeZone', timeZone);
  }, [timeZone]);

  return (
    <TimeZoneContext.Provider value={{ timeZone, setTimeZone, timeZones }}>
      {children}
    </TimeZoneContext.Provider>
  );
};
