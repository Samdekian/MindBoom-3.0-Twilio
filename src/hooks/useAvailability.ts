
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

export interface Availability {
  id: string;
  therapist_id: string;
  day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface UseTherapistAvailabilityResult {
  availability: Availability[];
  availableTimeSlots: string[];
  isLoading: boolean;
  error: Error | null;
}

export function useTherapistAvailability(
  therapistId: string,
  date: Date
): UseTherapistAvailabilityResult {
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!therapistId) {
        setAvailableTimeSlots([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Get the day of week from the selected date
        const dayOfWeek = format(date, 'EEEE').toLowerCase() as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
        
        // Fetch real availability data from Supabase
        const { data: availabilityData, error: availabilityError } = await supabase
          .from('therapist_availability')
          .select('*')
          .eq('therapist_id', therapistId)
          .eq('day_of_week', dayOfWeek);
        
        if (availabilityError) {
          throw availabilityError;
        }
        
        // If no availability found, use default business hours (9 AM - 5 PM)
        const availabilityList: Availability[] = availabilityData.length > 0 
          ? availabilityData.map(item => ({
              id: item.id,
              therapist_id: item.therapist_id,
              day_of_week: item.day_of_week,
              start_time: item.start_time,
              end_time: item.end_time,
              is_available: true,
              created_at: item.created_at,
              updated_at: item.updated_at
            }))
          : [{
              id: 'default',
              therapist_id: therapistId,
              day_of_week: dayOfWeek,
              start_time: '09:00',
              end_time: '17:00',
              is_available: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }];

        // Generate time slots at 1-hour intervals for each availability period
        const timeSlots: string[] = [];
        for (const slot of availabilityList) {
          // Extract only the hour and minute parts for start and end times
          let [startHour, startMinute] = slot.start_time.split(':').map(Number);
          const [endHour, endMinute] = slot.end_time.split(':').map(Number);
          
          // Convert to 24-hour format if needed
          if (typeof startHour !== 'number' || isNaN(startHour)) {
            startHour = 9; // Default to 9 AM if parsing fails
          }
          
          let currentHour = startHour;
          let currentMinute = startMinute || 0;
          
          // Generate slots until we reach the end time
          while (
            currentHour < endHour || 
            (currentHour === endHour && currentMinute < endMinute)
          ) {
            timeSlots.push(`${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`);
            
            // Move to next hour
            currentHour++;
            // Reset minutes if needed
            if (currentHour === 24) {
              currentHour = 0;
            }
          }
        }

        setAvailability(availabilityList);
        setAvailableTimeSlots(timeSlots);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch availability');
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailability();
  }, [therapistId, date]);

  return {
    availability,
    availableTimeSlots,
    isLoading,
    error
  };
}
