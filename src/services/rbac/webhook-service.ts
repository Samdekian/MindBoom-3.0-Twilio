
import { supabase } from '@/integrations/supabase/client';

/**
 * Service to manage webhooks for RBAC events
 */
export class RBACWebhookService {
  private static instance: RBACWebhookService;
  private webhookUrls: Map<string, string> = new Map();
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): RBACWebhookService {
    if (!RBACWebhookService.instance) {
      RBACWebhookService.instance = new RBACWebhookService();
    }
    return RBACWebhookService.instance;
  }
  
  /**
   * Register a webhook URL for a specific event type
   * @param eventType Event type to listen for
   * @param url Webhook URL to call
   */
  public registerWebhook(eventType: string, url: string): void {
    this.webhookUrls.set(eventType, url);
    console.log(`Registered webhook for ${eventType}: ${url}`);
  }
  
  /**
   * Unregister a webhook for a specific event type
   * @param eventType Event type to unregister
   */
  public unregisterWebhook(eventType: string): void {
    if (this.webhookUrls.has(eventType)) {
      this.webhookUrls.delete(eventType);
      console.log(`Unregistered webhook for ${eventType}`);
    }
  }
  
  /**
   * Notify all registered webhooks about a RBAC event
   * @param eventType Type of event
   * @param payload Data to send to webhooks
   */
  public async notifyWebhooks(eventType: string, payload: any): Promise<void> {
    if (this.webhookUrls.has(eventType)) {
      const url = this.webhookUrls.get(eventType);
      if (!url) return;
      
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventType,
            timestamp: new Date().toISOString(),
            payload
          }),
        });
        
        console.log(`Webhook notification sent for ${eventType}. Status: ${response.status}`);
      } catch (error) {
        console.error(`Failed to notify webhook for ${eventType}:`, error);
      }
    }
  }
  
  /**
   * Listen to role changes via Supabase Realtime
   */
  public startListening(): void {
    supabase
      .channel('role-events')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'audit_logs',
        filter: "activity_type=in.(role_assigned,role_removed,role_sync,role_consistency_repair)"
      }, (payload) => {
        this.notifyWebhooks('role_change', {
          eventType: payload.new.activity_type,
          userId: payload.new.user_id,
          timestamp: payload.new.activity_timestamp,
          metadata: payload.new.metadata
        });
      })
      .subscribe();
  }
  
  /**
   * Stop listening to role changes
   */
  public stopListening(): void {
    supabase.removeAllChannels();
  }
}

// Export singleton instance
export const rbacWebhookService = RBACWebhookService.getInstance();
