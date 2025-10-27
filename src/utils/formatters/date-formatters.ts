
import { format, formatDistance } from 'date-fns';

/**
 * Format a date into a human-readable string
 */
export const formatDate = (date: Date): string => {
  return format(date, 'MMMM d, yyyy');
};

/**
 * Format a date and time into a human-readable string
 */
export const formatDateTime = (date: Date): string => {
  return format(date, 'MMMM d, yyyy h:mm a');
};

/**
 * Format a time from a Date object
 */
export const formatTime = (date: Date): string => {
  return format(date, 'h:mm a');
};

/**
 * Format a date as a relative time from now (e.g. "5 minutes ago")
 */
export const formatRelativeTime = (date: Date): string => {
  return formatDistance(date, new Date(), { addSuffix: true });
};

/**
 * Format a day name from a Date object
 */
export const formatDayName = (date: Date): string => {
  return format(date, 'EEEE');
};

/**
 * Format a short day name from a Date object
 */
export const formatShortDayName = (date: Date): string => {
  return format(date, 'EEE');
};

/**
 * Format a month name from a Date object
 */
export const formatMonthName = (date: Date): string => {
  return format(date, 'MMMM');
};

/**
 * Format a time from seconds
 */
export const formatTimeFromSeconds = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0')
  ].join(':');
};
