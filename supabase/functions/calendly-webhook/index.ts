
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"
import { createHmac } from "https://deno.land/std@0.190.0/crypto/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, calendly-webhook-signature',
}

const SUPABASE_URL = "https://mlevmxueubhwfezfujxa.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sZXZteHVldWJod2ZlemZ1anhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MjY0NjgsImV4cCI6MjA1OTIwMjQ2OH0.hDfCn3jPrAf-Tmru1jB3W3liMUtw8QXzC-4jzt99A3I"

async function verifyCalendlySignature(payload: string, signature: string | null, therapistId: string): Promise<boolean> {
  try {
    if (!signature) return false;

    // For test requests, use a simpler verification
    if (JSON.parse(payload).event === 'test.webhook') {
      const testPayload = JSON.parse(payload);
      return signature === `v1=${testPayload.event}${testPayload.payload.created_at}`;
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    
    // Get the webhook signing secret from therapist settings
    const { data: settings, error } = await supabase
      .from('therapist_settings')
      .select('calendly_webhook_signing_secret')
      .eq('user_id', therapistId)
      .single();

    if (error || !settings?.calendly_webhook_signing_secret) {
      console.error('Error fetching webhook secret:', error);
      return false;
    }

    // Create HMAC using the webhook signing secret
    const hmac = createHmac("sha256", settings.calendly_webhook_signing_secret);
    hmac.update(payload);
    const computedSignature = `v1=${hmac.digest("hex")}`;

    return computedSignature === signature;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const signature = req.headers.get('calendly-webhook-signature');
    const payload = await req.text();
    const body = JSON.parse(payload);
    const therapistId = body.payload?.scheduling_user?.uri?.split('/users/')?.[1];

    // For test webhooks, we'll accept a different therapist ID format
    const isTestRequest = body.event === 'test.webhook';
    const effectiveTherapistId = isTestRequest && !therapistId 
      ? body.payload?.scheduling_user?.uri 
      : therapistId;

    if (!effectiveTherapistId) {
      throw new Error('Could not determine therapist ID from webhook payload');
    }

    // Verify the webhook signature
    const isValid = await verifyCalendlySignature(payload, signature, effectiveTherapistId);
    if (!isValid) {
      console.error('Invalid webhook signature');
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    
    // Store the webhook payload in a more detailed format
    const { data: webhook, error: webhookError } = await supabase
      .from('calendly_webhooks')
      .insert({
        event_type: body.event,
        payload: body,
        status: isTestRequest ? 'test' : 'processed',
        source_ip: req.headers.get('x-forwarded-for') || 'unknown',
        processed_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (webhookError) throw webhookError

    // Update appointment status based on event type
    if (body.event === 'invitee.canceled') {
      await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('calendly_event_id', body.payload.event_uuid)
    } else if (body.event === 'invitee.created') {
      // Check if this appointment already exists
      const { data: existingAppointment } = await supabase
        .from('appointments')
        .select('id')
        .eq('calendly_event_id', body.payload.event_uuid)
        .single();
      
      // Only create a new appointment if it doesn't exist
      if (!existingAppointment && !isTestRequest) {
        try {
          // Extract event details
          const eventDetails = body.payload;
          const startTime = eventDetails.scheduled_event?.start_time || new Date().toISOString();
          const endTime = eventDetails.scheduled_event?.end_time || new Date(Date.now() + 3600000).toISOString();
          
          // Get therapist settings for video info
          const { data: therapistSettings } = await supabase
            .from('therapist_settings')
            .select('video_enabled, video_provider')
            .eq('user_id', therapistId)
            .single();
          
          // Create the appointment record
          await supabase
            .from('appointments')
            .insert({
              patient_id: body.payload.invitee?.email || 'unknown',
              therapist_id: therapistId,
              title: eventDetails.scheduled_event?.name || 'Calendly Appointment',
              description: eventDetails.scheduled_event?.description || '',
              start_time: startTime,
              end_time: endTime,
              calendly_event_id: eventDetails.scheduled_event?.uuid,
              calendly_invitee_id: eventDetails.invitee?.uuid,
              video_enabled: therapistSettings?.video_enabled ?? true,
              video_provider: therapistSettings?.video_provider,
              status: 'scheduled',
            });
        } catch (appointmentError) {
          console.error('Error creating appointment from webhook:', appointmentError);
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Webhook processed successfully',
      event_id: webhook?.id,
      test: isTestRequest
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
