import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

export const useAuditLogging = () => {
  const { user } = useAuthRBAC();
  const { toast } = useToast();

  const logActivity = useMutation({
    mutationFn: async (activityDetails: {
      activity_type: string;
      resource_type: string;
      resource_id: string;
      metadata?: Record<string, any>;
    }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { activity_type, resource_type, resource_id, metadata } = activityDetails;

      const { error } = await supabase.from('audit_logs').insert({
        user_id: user.id,
        activity_type,
        resource_type,
        resource_id,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
        },
      });

      if (error) {
        console.error('Failed to log activity:', error);
        toast({
          title: 'Logging Error',
          description: 'Failed to record activity. Please try again.',
          variant: 'destructive',
        });
        throw error;
      }
    },
  });

  return { logActivity };
};
