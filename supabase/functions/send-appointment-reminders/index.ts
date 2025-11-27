
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { Resend } from "npm:resend@1.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AppointmentReminder {
  appointment_id: string;
  title: string;
  start_time: string;
  end_time: string;
  patient_email: string;
  patient_name: string;
  therapist_name: string;
  notification_type: string;
  phone_number: string | null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Initialize email service
    const resendApiKey = Deno.env.get("RESEND_API_KEY") ?? "";
    const resend = new Resend(resendApiKey);
    
    // Get upcoming appointments that need reminders
    const { data: appointments, error } = await supabase.rpc('get_upcoming_appointment_reminders');
    
    if (error) throw error;
    
    console.log(`Found ${appointments?.length || 0} appointments that need reminders`);
    
    if (!appointments || appointments.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: "No appointment reminders to send",
          sent: 0
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Process each appointment reminder
    const results = await Promise.allSettled(
      (appointments as AppointmentReminder[]).map(async (appointment) => {
        try {
          // Send email if requested
          if (appointment.notification_type === 'email' || appointment.notification_type === 'both') {
            await resend.emails.send({
              from: "Appointment Reminder <no-reply@yourtherapyapp.com>",
              to: [appointment.patient_email],
              subject: `Reminder: Your therapy session on ${new Date(appointment.start_time).toLocaleDateString()}`,
              html: generateEmailTemplate(appointment),
            });
          }
          
          // Send SMS if requested (would typically use Twilio or similar)
          if ((appointment.notification_type === 'sms' || appointment.notification_type === 'both') && appointment.phone_number) {
            // Example of SMS integration would go here
            console.log(`Would send SMS to ${appointment.phone_number} for appointment ${appointment.appointment_id}`);
          }
          
          // Record that notification was sent
          await supabase
            .from('appointment_notification_logs')
            .insert({
              appointment_id: appointment.appointment_id,
              notification_type: appointment.notification_type,
              notification_status: 'sent'
            });
            
          return { success: true, id: appointment.appointment_id };
        } catch (error) {
          console.error(`Failed to send notification for appointment ${appointment.appointment_id}:`, error);
          
          // Record the failure
          await supabase
            .from('appointment_notification_logs')
            .insert({
              appointment_id: appointment.appointment_id,
              notification_type: appointment.notification_type,
              notification_status: 'failed',
              error_message: error.message || String(error)
            });
            
          return { success: false, id: appointment.appointment_id, error };
        }
      })
    );
    
    // Count successes and failures
    const successes = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failures = results.length - successes;
    
    return new Response(
      JSON.stringify({ 
        message: `Processed ${results.length} reminders with ${successes} successes and ${failures} failures`,
        processed: results.length,
        successes,
        failures
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
    
  } catch (error) {
    console.error("Error in send-appointment-reminders function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

function generateEmailTemplate(appointment: AppointmentReminder): string {
  const appointmentDate = new Date(appointment.start_time).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  });
  
  const startTime = new Date(appointment.start_time).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const endTime = new Date(appointment.end_time).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #4f46e5;">Appointment Reminder</h1>
      <p>Hello ${appointment.patient_name || "there"},</p>
      <p>This is a friendly reminder about your upcoming therapy session:</p>
      
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Session:</strong> ${appointment.title}</p>
        <p><strong>Date:</strong> ${appointmentDate}</p>
        <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
        <p><strong>Therapist:</strong> ${appointment.therapist_name || "Your therapist"}</p>
      </div>
      
      <p>If you need to reschedule, please do so at least 24 hours in advance.</p>
      <p>We look forward to seeing you!</p>
      
      <p style="margin-top: 30px; color: #6b7280; font-size: 12px;">
        This is an automated reminder. Please do not reply to this email.
      </p>
    </div>
  `;
}
