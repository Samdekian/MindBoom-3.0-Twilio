
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase } from "../_utils/supabase.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Process appointments in batches to avoid timeouts
const BATCH_SIZE = 10;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get appointments that need syncing (pending or failed status)
    const { data: appointments, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .in('sync_status', ['pending', 'failed'])
      .limit(BATCH_SIZE)
      .order('last_sync_attempt', { ascending: true, nullsFirst: true });

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Found ${appointments.length} appointments to sync`);

    let syncedCount = 0;
    let failedCount = 0;

    // Process each appointment
    for (const appointment of appointments) {
      try {
        console.log(`Processing appointment ${appointment.id}`);
        
        // Check for conflicts before syncing
        const { data: conflicts } = await supabase.rpc('check_google_calendar_conflicts', {
          p_start_time: appointment.start_time,
          p_end_time: appointment.end_time,
          p_therapist_id: appointment.therapist_id,
          p_google_calendar_id: null,
          p_appointment_id: appointment.id
        });

        if (conflicts && conflicts.length > 0) {
          console.log(`Found conflicts for appointment ${appointment.id}:`, conflicts);
          
          // Update appointment with conflict information
          await supabase
            .from('appointments')
            .update({
              conflicts: conflicts,
              sync_status: 'conflict',
              last_sync_attempt: new Date().toISOString(),
              sync_error: 'Scheduling conflicts detected'
            })
            .eq('id', appointment.id);
          
          continue;
        }
        
        // Call sync function
        const response = await supabase.functions.invoke("sync-appointment-to-calendar", {
          body: { appointment }
        });

        if (response.error) {
          throw new Error(response.error.message);
        }

        // Update sync status to success
        await supabase
          .from('appointments')
          .update({
            sync_status: 'synced',
            last_sync_attempt: new Date().toISOString(),
            sync_error: null,
            conflicts: null
          })
          .eq('id', appointment.id);

        syncedCount++;
        console.log(`Successfully synced appointment ${appointment.id}`);
      } catch (error) {
        failedCount++;
        console.error(`Error syncing appointment ${appointment.id}:`, error);

        // Update sync status to failed
        await supabase
          .from('appointments')
          .update({
            sync_status: 'failed',
            last_sync_attempt: new Date().toISOString(),
            sync_error: error.message
          })
          .eq('id', appointment.id);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      processed: appointments.length,
      synced: syncedCount,
      failed: failedCount
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in sync-calendar-background:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
