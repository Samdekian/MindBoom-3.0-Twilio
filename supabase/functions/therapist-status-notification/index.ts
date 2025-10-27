
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Set up Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TherapistNotificationRequest {
  therapistId: string;
  status: string;
  adminNotes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { therapistId, status, adminNotes }: TherapistNotificationRequest = await req.json();

    // Get therapist details
    const { data: therapist, error: therapistError } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", therapistId)
      .single();

    if (therapistError) throw new Error(`Error fetching therapist: ${therapistError.message}`);

    // Get therapist email
    const { data: userEmail, error: emailError } = await supabase
      .from("users")
      .select("email")
      .eq("id", therapistId)
      .single();

    if (emailError) throw new Error(`Error fetching therapist email: ${emailError.message}`);

    // Create a notification in the system (could be extended to send actual emails)
    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id: therapistId,
        title: `Therapist Application ${status === 'approved' ? 'Approved' : 'Rejected'}`,
        message: status === 'approved' 
          ? `Your therapist application has been approved. You now have full access to therapist features.`
          : `Your therapist application has been rejected. ${adminNotes ? `Note: ${adminNotes}` : ''}`,
        type: status === 'approved' ? 'approval' : 'rejection',
        read: false
      });

    if (notificationError) {
      throw new Error(`Error creating notification: ${notificationError.message}`);
    }

    // Create audit log entry
    await supabase.from("audit_logs").insert({
      user_id: therapistId,
      activity_type: "therapist_status_notification",
      resource_type: "notifications",
      metadata: { status, adminNotes }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notification sent to ${therapist.full_name} (${userEmail.email})` 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in therapist-status-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
