import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

export const useAppointmentSyncStatus = () => {
  const { user } = useAuthRBAC();
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const { toast } = useToast();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['appointment-sync-status', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('therapist_settings')
        .select('is_appointment_sync_enabled, last_appointment_sync')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error("Error fetching sync settings:", error);
        throw error;
      }

      return data;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (settings) {
      setSyncEnabled(settings.is_appointment_sync_enabled || false);
      setLastSync(settings.last_appointment_sync || null);
    }
  }, [settings]);

  const enableSync = async () => {
    try {
      if (!user?.id) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('therapist_settings')
        .update({ is_appointment_sync_enabled: true })
        .eq('user_id', user.id);

      if (error) throw error;

      setSyncEnabled(true);
      toast({
        title: "Appointment Sync Enabled",
        description: "Your appointments will now be synced.",
      });
    } catch (error: any) {
      console.error("Error enabling sync:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to enable appointment sync.",
        variant: "destructive",
      });
    }
  };

  const disableSync = async () => {
    try {
      if (!user?.id) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('therapist_settings')
        .update({ is_appointment_sync_enabled: false })
        .eq('user_id', user.id);

      if (error) throw error;

      setSyncEnabled(false);
      toast({
        title: "Appointment Sync Disabled",
        description: "Appointment sync has been disabled.",
      });
    } catch (error: any) {
      console.error("Error disabling sync:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to disable appointment sync.",
        variant: "destructive",
      });
    }
  };

  return {
    syncEnabled,
    lastSync,
    isLoading,
    error,
    enableSync,
    disableSync,
  };
};
