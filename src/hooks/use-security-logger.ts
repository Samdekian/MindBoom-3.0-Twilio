
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

interface LogActivityParams {
  activity_type: string;
  resource_type: string;
  resource_id: string;
  metadata?: Record<string, any>;
}

export const useSecurityLogger = () => {
  const { user } = useAuthRBAC();

  const logActivity = useMutation({
    mutationFn: async (params: LogActivityParams) => {
      const { error } = await supabase
        .from('audit_logs')
        .insert([{
          user_id: user?.id,
          activity_type: params.activity_type,
          resource_type: params.resource_type,
          resource_id: params.resource_id,
          metadata: params.metadata || {},
        }]);

      if (error) throw error;
    },
  });

  const logSecurityEvent = (
    eventType: string,
    resourceType: string,
    resourceId: string,
    metadata?: Record<string, any>,
    isHighRisk: boolean = false
  ) => {
    logActivity.mutate({
      activity_type: eventType,
      resource_type: resourceType,
      resource_id: resourceId,
      metadata: { ...metadata, high_risk: isHighRisk },
    });
  };

  const logAuditEvent = (
    eventType: string,
    resourceType: string,
    resourceId: string,
    metadata?: Record<string, any>,
    isHighRisk: boolean = false
  ) => {
    logSecurityEvent(eventType, resourceType, resourceId, metadata, isHighRisk);
  };

  return {
    logActivity,
    logSecurityEvent,
    logAuditEvent,
  };
};
