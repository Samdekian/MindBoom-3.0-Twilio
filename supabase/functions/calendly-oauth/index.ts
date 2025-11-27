
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SUPABASE_URL = "https://mlevmxueubhwfezfujxa.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sZXZteHVldWJod2ZlemZ1anhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MjY0NjgsImV4cCI6MjA1OTIwMjQ2OH0.hDfCn3jPrAf-Tmru1jB3W3liMUtw8QXzC-4jzt99A3I"

const CALENDLY_CLIENT_ID = Deno.env.get('CALENDLY_CLIENT_ID')!
const CALENDLY_CLIENT_SECRET = Deno.env.get('CALENDLY_CLIENT_SECRET')!
const REDIRECT_URI = 'https://mlevmxueubhwfezfujxa.supabase.co/functions/v1/calendly-oauth'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    
    if (!code) {
      // Redirect to Calendly OAuth authorization page
      const authorizationUrl = new URL('https://auth.calendly.com/oauth/authorize')
      authorizationUrl.searchParams.set('client_id', CALENDLY_CLIENT_ID)
      authorizationUrl.searchParams.set('redirect_uri', REDIRECT_URI)
      authorizationUrl.searchParams.set('response_type', 'code')
      authorizationUrl.searchParams.set('scope', 'user:read calendar:read event_type:read')

      return new Response(null, {
        status: 302,
        headers: { 
          ...corsHeaders,
          'Location': authorizationUrl.toString() 
        }
      })
    }

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://auth.calendly.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: CALENDLY_CLIENT_ID,
        client_secret: CALENDLY_CLIENT_SECRET,
        code: code,
        redirect_uri: REDIRECT_URI
      })
    })

    const tokens = await tokenResponse.json()

    // Fetch user details
    const userResponse = await fetch('https://api.calendly.com/users/me', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    })
    const userData = await userResponse.json()

    // Get the current authenticated user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('No authenticated user found')
    }

    // Update therapist settings with OAuth details
    const { error } = await supabase
      .from('therapist_settings')
      .update({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        user_uri: userData.resource.uri,
        organization_uri: userData.resource.organization,
        is_oauth_connected: true
      })
      .eq('user_id', user.id)

    if (error) throw error

    // Redirect back to the dashboard or Calendly integration page
    return new Response(null, {
      status: 302,
      headers: { 
        ...corsHeaders,
        'Location': '/dashboard'
      }
    })

  } catch (error) {
    console.error('OAuth Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json' 
      }
    })
  }
})
