
import { corsHeaders } from "../utils.ts";

export async function syncAppleCalendarAppointment(req, appointment, userId, supabaseUrl, supabaseAnonKey) {
  return new Response(
    JSON.stringify({
      success: false,
      message: "Apple Calendar integration will be available soon!",
    }),
    {
      status: 501,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    }
  );
}
