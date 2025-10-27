
export async function updateLocalAppointment(
  event: any, 
  therapistId: string,
  supabaseUrl: string,
  supabaseServiceKey: string
) {
  try {
    // Check if appointment exists
    const { data: existingAppointment } = await fetch(
      `${supabaseUrl}/rest/v1/appointments?google_calendar_event_id=eq.${event.id}`,
      {
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
      }
    ).then(r => r.json());

    const appointmentData = {
      title: event.summary,
      description: event.description,
      start_time: event.start.dateTime,
      end_time: event.end.dateTime,
      google_calendar_event_id: event.id,
      sync_status: 'synced',
      therapist_id: therapistId,
      patient_id: therapistId, // Default to therapist until we can map attendees
      status: 'scheduled'
    };

    if (existingAppointment?.[0]) {
      // Update existing appointment
      await fetch(
        `${supabaseUrl}/rest/v1/appointments?id=eq.${existingAppointment[0].id}`,
        {
          method: "PATCH",
          headers: {
            apikey: supabaseServiceKey,
            Authorization: `Bearer ${supabaseServiceKey}`,
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
          },
          body: JSON.stringify(appointmentData),
        }
      );
    } else {
      // Create new appointment
      await fetch(
        `${supabaseUrl}/rest/v1/appointments`,
        {
          method: "POST",
          headers: {
            apikey: supabaseServiceKey,
            Authorization: `Bearer ${supabaseServiceKey}`,
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
          },
          body: JSON.stringify(appointmentData),
        }
      );
    }
  } catch (error) {
    console.error("Error updating local appointment:", error);
  }
}

