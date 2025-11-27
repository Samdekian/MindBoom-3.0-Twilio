
import { corsHeaders, errorResponse } from "../utils.ts";

export async function syncGoogleCalendarAppointment(req, appointment, userId, supabaseUrl, supabaseAnonKey, googleClientId, googleClientSecret) {
  try {
    // Get therapist's Google Calendar tokens
    const settingsResp = await fetch(
      `${supabaseUrl}/rest/v1/therapist_settings?user_id=eq.${userId}`,
      {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
      }
    );

    if (!settingsResp.ok) {
      throw new Error(`Failed to fetch therapist settings: ${await settingsResp.text()}`);
    }

    const settings = await settingsResp.json();
    if (!settings || settings.length === 0 || !settings[0].access_token) {
      return errorResponse({ 
        message: "Google Calendar not connected. Please connect your calendar first.", 
        status: 400,
        code: "NOT_CONNECTED"
      });
    }

    const { access_token, refresh_token, token_expires_at, google_calendar_id } = settings[0];
    const calendarId = google_calendar_id || 'primary';

    // Refresh token if expired/expiring
    let currentToken = access_token;
    const now = new Date();
    const tokenExpiry = new Date(token_expires_at);
    
    if (tokenExpiry <= new Date(now.getTime() + 5 * 60 * 1000)) {
      try {
        const refreshResp = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: googleClientId ?? "",
            client_secret: googleClientSecret ?? "",
            refresh_token: refresh_token,
            grant_type: "refresh_token",
          }).toString(),
        });
        
        if (!refreshResp.ok) {
          const refreshError = await refreshResp.text();
          throw new Error(`Token refresh failed: ${refreshError}`);
        }
        
        const refreshData = await refreshResp.json();
        currentToken = refreshData.access_token;
        
        // Update tokens in DB
        const updateResp = await fetch(`${supabaseUrl}/rest/v1/therapist_settings?user_id=eq.${userId}`, {
          method: "PATCH",
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
          },
          body: JSON.stringify({
            access_token: refreshData.access_token,
            token_expires_at: new Date(now.getTime() + refreshData.expires_in * 1000).toISOString(),
            sync_error: null // Clear any previous sync errors
          }),
        });

        if (!updateResp.ok) {
          throw new Error(`Failed to update tokens: ${await updateResp.text()}`);
        }
      } catch (err) {
        console.error("Google token refresh error:", err);
        return errorResponse({ 
          message: "Failed to refresh Google Calendar access. Please reconnect your calendar.", 
          status: 401,
          code: "TOKEN_REFRESH_FAILED"
        });
      }
    }

    // Prepare event for Google Calendar
    const eventStartTime = new Date(appointment.start_time);
    const eventEndTime = new Date(appointment.end_time);
    const calendarEventId = appointment.google_calendar_event_id;
    const calendarAction = calendarEventId ? "updated" : "created";
    
    const calendarEvent = {
      summary: appointment.title,
      description: appointment.description || `Therapy appointment (${appointment.status})`,
      start: { dateTime: eventStartTime.toISOString(), timeZone: "UTC" },
      end: { dateTime: eventEndTime.toISOString(), timeZone: "UTC" },
      attendees: [{ email: appointment.patient_id, responseStatus: "needsAction" }],
      reminders: { useDefault: true }
    };

    let googleResponse;
    try {
      if (calendarEventId) {
        // Update event
        googleResponse = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${calendarEventId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${currentToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(calendarEvent),
          }
        );
      } else {
        // Create new event
        googleResponse = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${currentToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(calendarEvent),
          }
        );
      }

      if (!googleResponse.ok) {
        const errorText = await googleResponse.text();
        throw new Error(`Google Calendar API error: ${errorText}`);
      }

      const eventData = await googleResponse.json();

      // Update appointment in DB
      const updateResp = await fetch(`${supabaseUrl}/rest/v1/appointments?id=eq.${appointment.id}`, {
        method: "PATCH",
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal",
        },
        body: JSON.stringify({
          google_calendar_event_id: eventData.id,
          sync_error: null, // Clear any previous sync errors
          updated_at: new Date().toISOString(),
        }),
      });

      if (!updateResp.ok) {
        throw new Error(`Failed to update appointment: ${await updateResp.text()}`);
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `Appointment successfully ${calendarAction} in Google Calendar (${calendarId})`,
          event: eventData,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      // Update appointment with sync error
      await fetch(`${supabaseUrl}/rest/v1/appointments?id=eq.${appointment.id}`, {
        method: "PATCH",
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal",
        },
        body: JSON.stringify({
          sync_error: error.message,
          updated_at: new Date().toISOString(),
        }),
      });

      return errorResponse({ 
        message: error.message || "Failed to sync with Google Calendar",
        code: "GOOGLE_API_ERROR"
      });
    }
  } catch (error) {
    console.error("Google sync error:", error);
    return errorResponse({ 
      message: error.message || "Failed to sync with Google Calendar",
      code: "SYNC_ERROR"
    });
  }
}
