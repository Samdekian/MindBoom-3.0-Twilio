
import { supabase } from '@/integrations/supabase/client';
import { SecurityAlert } from '@/types/core/rbac';

export class AlertService {
  /**
   * Create a new security alert
   */
  static async createAlert(alertData: Omit<SecurityAlert, 'id'>): Promise<SecurityAlert> {
    try {
      const { data, error } = await supabase
        .from('security_alerts')
        .insert({
          type: alertData.type,
          severity: alertData.severity,
          message: alertData.message,
          timestamp: alertData.timestamp,
          userId: alertData.userId,
          metadata: {
            ...alertData.metadata,
            alertType: alertData.alertType,
            description: alertData.description,
            isResolved: alertData.isResolved ?? false,
            relatedEvents: alertData.relatedEvents ?? [],
            resolvedAt: alertData.resolvedAt ?? null,
            resolvedBy: alertData.resolvedBy ?? null
          }
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        id: data.id,
        type: data.type,
        severity: data.severity,
        message: data.message,
        timestamp: data.timestamp,
        userId: data.userId,
        metadata: data.metadata || {},
        alertType: data.metadata?.alertType,
        description: data.metadata?.description,
        isResolved: data.metadata?.isResolved || false,
        resolved: data.metadata?.isResolved || false,
        userName: data.metadata?.userName,
        resolvedAt: data.metadata?.resolvedAt,
        resolvedBy: data.metadata?.resolvedBy,
        relatedEvents: data.metadata?.relatedEvents || []
      };
    } catch (error) {
      console.error('Error creating security alert:', error);
      throw error;
    }
  }

  /**
   * Get alerts for a specific user
   */
  static async getUserAlerts(userId: string): Promise<SecurityAlert[]> {
    try {
      const { data, error } = await supabase
        .from('security_alerts')
        .select('*')
        .eq('userId', userId)
        .order('timestamp', { ascending: false });

      if (error) {
        throw error;
      }

      return (data || []).map(alert => ({
        id: alert.id,
        type: alert.type,
        severity: alert.severity,
        message: alert.message,
        timestamp: alert.timestamp,
        userId: alert.userId,
        metadata: alert.metadata || {},
        alertType: alert.metadata?.alertType,
        description: alert.metadata?.description,
        isResolved: alert.metadata?.isResolved || false,
        resolved: alert.metadata?.isResolved || false,
        userName: alert.metadata?.userName,
        resolvedAt: alert.metadata?.resolvedAt,
        resolvedBy: alert.metadata?.resolvedBy,
        relatedEvents: alert.metadata?.relatedEvents || []
      }));
    } catch (error) {
      console.error('Error fetching user alerts:', error);
      throw error;
    }
  }

  /**
   * Mark an alert as resolved
   */
  static async resolveAlert(alertId: string, resolvedBy?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('security_alerts')
        .update({
          metadata: {
            isResolved: true,
            resolvedAt: new Date().toISOString(),
            resolvedBy: resolvedBy || 'system'
          }
        })
        .eq('id', alertId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error resolving alert:', error);
      throw error;
    }
  }

  /**
   * Get recent security alerts
   */
  static async getRecentAlerts(limit: number = 50): Promise<SecurityAlert[]> {
    try {
      const { data, error } = await supabase
        .from('security_alerts')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return (data || []).map(alert => ({
        id: alert.id,
        type: alert.type,
        severity: alert.severity,
        message: alert.message,
        timestamp: alert.timestamp,
        userId: alert.userId,
        metadata: alert.metadata || {},
        alertType: alert.metadata?.alertType,
        description: alert.metadata?.description,
        isResolved: alert.metadata?.isResolved || false,
        resolved: alert.metadata?.isResolved || false,
        userName: alert.metadata?.userName,
        resolvedAt: alert.metadata?.resolvedAt,
        resolvedBy: alert.metadata?.resolvedBy,
        relatedEvents: alert.metadata?.relatedEvents || []
      }));
    } catch (error) {
      console.error('Error fetching recent alerts:', error);
      throw error;
    }
  }
}
