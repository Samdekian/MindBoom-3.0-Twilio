
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvitationRequest {
  email: string;
  firstName: string;
  lastName?: string;
  message?: string;
  invitationToken: string;
  therapistName: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: InvitationRequest = await req.json();
    const { email, firstName, lastName, message, invitationToken, therapistName } = body;

    // Create the invitation acceptance URL
    const invitationUrl = `${req.headers.get('origin') || 'https://your-app.com'}/accept-invitation?token=${invitationToken}`;

    // Create the email HTML content
    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invitation to Join Therapy Platform</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9ff; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🌟 You're Invited!</h1>
                <p>Join our secure therapy platform</p>
            </div>
            <div class="content">
                <h2>Hello ${firstName}${lastName ? ` ${lastName}` : ''},</h2>
                
                <p><strong>${therapistName}</strong> has invited you to join their practice on our secure therapy platform.</p>
                
                ${message ? `<div style="background: #e3f2fd; padding: 15px; border-radius: 6px; margin: 20px 0;"><strong>Personal message:</strong><br>${message}</div>` : ''}
                
                <p>With this platform, you'll be able to:</p>
                <ul>
                    <li>✅ Schedule and manage appointments</li>
                    <li>✅ Join secure video sessions</li>
                    <li>✅ Access your treatment plans</li>
                    <li>✅ Communicate securely with your therapist</li>
                    <li>✅ Track your progress and goals</li>
                </ul>
                
                <p>To get started, simply click the button below to create your account:</p>
                
                <div style="text-align: center;">
                    <a href="${invitationUrl}" class="button">Accept Invitation & Create Account</a>
                </div>
                
                <p><small>If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${invitationUrl}">${invitationUrl}</a></small></p>
                
                <p>This invitation expires in 7 days. If you have any questions, please contact your therapist directly.</p>
            </div>
            <div class="footer">
                <p>This email was sent securely by the Therapy Platform.<br>
                Your privacy and security are our top priorities.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    // Send email using Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Therapy Platform <noreply@your-domain.com>',
        to: [email],
        subject: `${therapistName} has invited you to join their practice`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      throw new Error(`Email sending failed: ${errorText}`);
    }

    const emailResult = await emailResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        emailId: emailResult.id,
        message: 'Invitation email sent successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error sending invitation email:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
