
import { retryWithBackoff } from "../utils.ts";

export async function processCalendarChanges(
  channelId: string | null,
  resourceId: string | null,
  resourceState: string | null,
  supabaseUrl: string | null,
  supabaseServiceKey: string | null
) {
  if (!channelId || !resourceId || !supabaseUrl || !supabaseServiceKey) {
    console.error("Missing required parameters for processing calendar changes");
    return;
  }

  try {
    // Mark webhook as processing
    await fetch(
      `${supabaseUrl}/rest/v1/google_calendar_webhooks?channel_id=eq.${channelId}&resource_id=eq.${resourceId}`,
      {
        method: "PATCH",
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal",
        },
        body: JSON.stringify({
          processed: true,
          processed_at: new Date().toISOString(),
        }),
      }
    );

    // Find the webhook config to identify the user and calendar
    const configResponse = await retryWithBackoff(async () => 
      fetch(
        `${supabaseUrl}/rest/v1/google_calendar_webhook_configs?channel_id=eq.${channelId}&resource_id=eq.${resourceId}`,
        {
          headers: {
            apikey: supabaseServiceKey,
            Authorization: `Bearer ${supabaseServiceKey}`,
          },
        }
      )
    );

    const webhookConfigs = await configResponse.json();
    if (!webhookConfigs || webhookConfigs.length === 0) {
      console.error(`No webhook config found for channel ${channelId}`);
      return;
    }

    const webhookConfig = webhookConfigs[0];
    const userId = webhookConfig.user_id;
    const calendarId = webhookConfig.calendar_id;

    // Get user settings for token information
    const settingsResponse = await retryWithBackoff(async () => 
      fetch(
        `${supabaseUrl}/rest/v1/therapist_settings?user_id=eq.${userId}`,
        {
          headers: {
            apikey: supabaseServiceKey,
            Authorization: `Bearer ${supabaseServiceKey}`,
          },
        }
      )
    );

    const settings = await settingsResponse.json();
    if (!settings || settings.length === 0) {
      console.error(`No settings found for user ${userId}`);
      return;
    }

    const { access_token, refresh_token } = settings[0];

    // Refresh token if needed
    const googleClientId = Deno.env.get("GOOGLE_CLIENT_ID");
    const googleClientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");
    
    let currentToken = access_token;

    if (resourceState === "sync") {
      console.log("Received sync notification, no further action needed");
      return;
    }

    // For change notifications, fetch the changed events
    // This simplified implementation will trigger a sync of all appointments
    // that might have conflicting events in Google Calendar
    
    // Find appointments that need to be checked for changes
    const { data: appointments } = await retryWithBackoff(async () => 
      fetch(
        `${supabaseUrl}/rest/v1/appointments?therapist_id=eq.${userId}&or=(sync_status.eq.synced,sync_status.eq.pending)`,
        {
          headers: {
            apikey: supabaseServiceKey,
            Authorization: `Bearer ${supabaseServiceKey}`,
          },
        }
      )
    ).then(r => r.json());

    if (appointments && appointments.length > 0) {
      console.log(`Triggering conflict check for ${appointments.length} appointments`);
      
      // Invoke the background sync function
      await fetch(
        `${supabaseUrl}/functions/v1/sync-calendar-background`,
        {
          method: "POST",
          headers: {
            apikey: supabaseServiceKey,
            Authorization: `Bearer ${supabaseServiceKey}`,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Record the successful processing
    console.log(`Successfully processed webhook for user ${userId} and calendar ${calendarId}`);
    
  } catch (error) {
    console.error("Error processing calendar changes:", error);
  }
}
