
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.41.0";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const resend = new Resend(resendApiKey);

    // Get upcoming appointments (next 24 hours)
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    const { data: appointments, error } = await supabase
      .from("appointments")
      .select(`
        id, 
        title,
        start_time,
        patient_id,
        therapist_id,
        status,
        video_url
      `)
      .eq("status", "confirmed")
      .gt("start_time", now.toISOString())
      .lt("start_time", tomorrow.toISOString())
      .eq("video_enabled", true);

    if (error) throw new Error(`Failed to fetch appointments: ${error.message}`);

    console.log(`Found ${appointments?.length || 0} upcoming video appointments in the next 24h`);
    
    // Send preparation reminders
    const results = [];
    
    for (const appointment of appointments || []) {
      // Get patient details
      const { data: patientData } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("id", appointment.patient_id)
        .single();

      if (!patientData) continue;

      // Get patient email
      const { data: userData } = await supabase.auth.admin.getUserById(appointment.patient_id);
      if (!userData?.user?.email) continue;
      
      const patientEmail = userData.user.email;

      // Format dates
      const appointmentDate = new Date(appointment.start_time);
      const formattedDate = appointmentDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
      const formattedTime = appointmentDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      // Create the join URL
      const joinUrl = `${req.headers.get("origin")}/video-session/${appointment.id}`;

      // Send email
      const { data: emailResult, error: emailError } = await resend.emails.send({
        from: "MindBloom Therapy <appointments@mindbloom-therapy.com>",
        to: [patientEmail],
        subject: `Prepare for Your Video Session - ${formattedDate}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #4f46e5;">Video Session Preparation</h1>
            <p>Hello ${patientData.full_name},</p>
            <p>Your video therapy session is scheduled for:</p>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Session:</strong> ${appointment.title}</p>
              <p><strong>Date:</strong> ${formattedDate}</p>
              <p><strong>Time:</strong> ${formattedTime}</p>
            </div>
            
            <h2 style="color: #4f46e5; margin-top: 30px;">Preparation Checklist</h2>
            <ul>
              <li>Ensure your camera and microphone are working properly</li>
              <li>Find a quiet, private location for your session</li>
              <li>Check that you have a stable internet connection</li>
              <li>Make sure your device is charged or plugged in</li>
              <li>Join the session 5 minutes early to test your setup</li>
            </ul>
            
            <div style="margin: 30px 0; text-align: center;">
              <a href="${joinUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Join Your Session
              </a>
            </div>
            
            <p>If you need to reschedule, please do so at least 24 hours in advance.</p>
            <p>We look forward to seeing you!</p>
          </div>
        `,
      });

      if (emailError) {
        console.error(`Failed to send reminder for appointment ${appointment.id}:`, emailError);
        results.push({ id: appointment.id, status: "failed", error: emailError.message });
      } else {
        console.log(`Sent preparation reminder for appointment ${appointment.id} to ${patientEmail}`);
        results.push({ id: appointment.id, status: "sent", email: patientEmail });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${appointments?.length || 0} appointments`,
        results
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  } catch (error) {
    console.error("Error processing session preparation reminders:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to process session preparation reminders",
        error: error.message
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  }
});
