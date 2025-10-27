import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { type, data } = await req.json()

    switch (type) {
      case 'mood_logged':
        await handleMoodLogged(supabase, data)
        break
      
      case 'goal_completed':
        await handleGoalCompleted(supabase, data)
        break
      
      case 'appointment_scheduled':
        await handleAppointmentScheduled(supabase, data)
        break
      
      case 'new_message':
        await handleNewMessage(supabase, data)
        break
        
      default:
        console.log('Unknown notification type:', type)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error processing notification:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function handleMoodLogged(supabase: any, data: any) {
  const { user_id, mood_label, streak_count } = data
  
  // Create notification for milestone streaks
  if (streak_count && streak_count % 7 === 0) {
    await supabase
      .from('notifications')
      .insert({
        user_id,
        type: 'milestone',
        title: '🎉 Mood Tracking Milestone!',
        message: `Congratulations! You've maintained a ${streak_count}-day mood tracking streak.`,
        data: { streak_count, type: 'mood_streak' }
      })
  }
}

async function handleGoalCompleted(supabase: any, data: any) {
  const { user_id, goal_title, completion_percentage } = data
  
  if (completion_percentage === 100) {
    await supabase
      .from('notifications')
      .insert({
        user_id,
        type: 'achievement',
        title: '🎯 Goal Completed!',
        message: `You've successfully completed "${goal_title}". Great job!`,
        data: { goal_title, type: 'goal_completion' }
      })
  }
}

async function handleAppointmentScheduled(supabase: any, data: any) {
  const { user_id, appointment_date, therapist_name } = data
  
  await supabase
    .from('notifications')
    .insert({
      user_id,
      type: 'appointment',
      title: '📅 Appointment Scheduled',
      message: `Your session with ${therapist_name} is confirmed for ${new Date(appointment_date).toLocaleDateString()}.`,
      data: { appointment_date, therapist_name, type: 'appointment_scheduled' }
    })
}

async function handleNewMessage(supabase: any, data: any) {
  const { user_id, sender_name, message_preview } = data
  
  await supabase
    .from('notifications')
    .insert({
      user_id,
      type: 'message',
      title: '💬 New Message',
      message: `${sender_name}: ${message_preview}`,
      data: { sender_name, message_preview, type: 'new_message' }
    })
}