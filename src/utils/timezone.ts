
import { format, formatInTimeZone } from 'date-fns-tz';

export const getTimeZones = () => {
  // Get a list of available timezones
  // Use a type assertion since TypeScript doesn't recognize supportedValuesOf yet
  const timeZones = (Intl as any).supportedValuesOf ? 
    (Intl as any).supportedValuesOf('timeZone') : 
    // Fallback to common timezones if the browser doesn't support this API
    [
      'UTC', 'GMT', 
      'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
      'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow',
      'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Dubai', 'Asia/Kolkata',
      'Australia/Sydney', 'Pacific/Auckland'
    ];
    
  return timeZones.map(tz => ({
    value: tz,
    label: tz.replace(/_/g, ' ')
  }));
};

export const getUserTimeZone = (): string => {
  // Get the user's local timezone from the browser
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export const formatInUserTimeZone = (date: string | Date, formatStr: string, timeZone?: string): string => {
  const userTimeZone = timeZone || getUserTimeZone();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatInTimeZone(dateObj, userTimeZone, formatStr);
};

export const convertToTimeZone = (date: Date, targetTimeZone: string): Date => {
  // Convert a date to a specific timezone
  const targetDate = new Date(date);
  const userOffset = targetDate.getTimezoneOffset() * 60000;
  
  // Get the target timezone offset using Intl.DateTimeFormat
  const targetFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: targetTimeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });
  
  const targetParts = targetFormatter.formatToParts(targetDate);
  const targetDateObj = new Date(
    parseInt(targetParts.find(part => part.type === 'year')?.value || '0'),
    parseInt(targetParts.find(part => part.type === 'month')?.value || '0') - 1,
    parseInt(targetParts.find(part => part.type === 'day')?.value || '0'),
    parseInt(targetParts.find(part => part.type === 'hour')?.value || '0'),
    parseInt(targetParts.find(part => part.type === 'minute')?.value || '0'),
    parseInt(targetParts.find(part => part.type === 'second')?.value || '0'),
  );
  
  return targetDateObj;
};
