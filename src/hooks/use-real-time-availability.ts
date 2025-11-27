import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useToast } from '@/hooks/use-toast';
import { Appointment } from '@/types/appointments';

/**
 * Hook to listen for real-time availability updates
 */
export const useRealTimeAvailability = () => {
  const { user } = useAuthRBAC();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isListening, setIsListening] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Appointment | null>(null);
  
  useEffect(() => {
    if (!user) return;
    
    // Set up real-time subscription for appointments
    const channel = supabase
      .channel('appointment-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
        },
        (payload) => {
          console.log('Real-time appointment update:', payload);
          setLastUpdate(payload.new as Appointment);
          
          // Show toast notification for important changes
          const eventType = payload.eventType;
          if (eventType === 'INSERT') {
            toast({
              title: 'New Appointment',
              description: 'A new appointment has been scheduled',
            });
          } else if (eventType === 'UPDATE') {
            const oldStatus = payload.old?.status;
            const newStatus = payload.new?.status;
            
            if (oldStatus !== newStatus) {
              toast({
                title: 'Appointment Updated',
                description: `Status changed from ${oldStatus} to ${newStatus}`,
              });
            }
          }
        }
      )
      .subscribe();
    
    setIsListening(true);
    
    return () => {
      supabase.removeChannel(channel);
      setIsListening(false);
    };
  }, [user, toast]);
  
  return {
    isListening,
    lastUpdate,
  };
};
