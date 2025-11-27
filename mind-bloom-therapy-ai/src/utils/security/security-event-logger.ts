
import { supabase } from '@/integrations/supabase/client';

export interface SecurityEvent {
  eventType: string;
  userId?: string;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const logSecurityEvent = async (event: SecurityEvent) => {
  try {
    const { error } = await supabase
      .from('audit_logs')
      .insert([{
        user_id: event.userId,
        activity_type: event.eventType,
        resource_type: event.resourceType,
        resource_id: event.resourceId,
        metadata: {
          ...event.metadata,
          severity: event.severity,
        },
      }]);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};
