export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      appointment_notification_logs: {
        Row: {
          appointment_id: string
          created_at: string
          error_message: string | null
          id: string
          notification_status: string
          notification_type: string
        }
        Insert: {
          appointment_id: string
          created_at?: string
          error_message?: string | null
          id?: string
          notification_status: string
          notification_type: string
        }
        Update: {
          appointment_id?: string
          created_at?: string
          error_message?: string | null
          id?: string
          notification_status?: string
          notification_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_notification_logs_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_notification_preferences: {
        Row: {
          appointment_id: string
          created_at: string
          id: string
          notification_type: string
          phone_number: string | null
          reminder_time_hours: number
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_id: string
          created_at?: string
          id?: string
          notification_type: string
          phone_number?: string | null
          reminder_time_hours?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_id?: string
          created_at?: string
          id?: string
          notification_type?: string
          phone_number?: string | null
          reminder_time_hours?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_notification_preferences_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_type: string | null
          created_at: string | null
          duration_minutes: number | null
          end_time: string | null
          google_calendar_event_id: string | null
          id: string
          last_sync_attempt: string | null
          notes: string | null
          patient_id: string | null
          scheduled_at: string
          start_time: string | null
          status: string | null
          sync_error: string | null
          sync_status: string | null
          therapist_id: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_type?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          google_calendar_event_id?: string | null
          id?: string
          last_sync_attempt?: string | null
          notes?: string | null
          patient_id?: string | null
          scheduled_at: string
          start_time?: string | null
          status?: string | null
          sync_error?: string | null
          sync_status?: string | null
          therapist_id?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_type?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          google_calendar_event_id?: string | null
          id?: string
          last_sync_attempt?: string | null
          notes?: string | null
          patient_id?: string | null
          scheduled_at?: string
          start_time?: string | null
          status?: string | null
          sync_error?: string | null
          sync_status?: string | null
          therapist_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      breakout_room_participants: {
        Row: {
          breakout_room_id: string | null
          connection_quality: string | null
          id: string
          identity: string
          is_active: boolean | null
          joined_at: string | null
          left_at: string | null
          participant_id: string | null
          participant_name: string | null
          user_id: string | null
        }
        Insert: {
          breakout_room_id?: string | null
          connection_quality?: string | null
          id?: string
          identity: string
          is_active?: boolean | null
          joined_at?: string | null
          left_at?: string | null
          participant_id?: string | null
          participant_name?: string | null
          user_id?: string | null
        }
        Update: {
          breakout_room_id?: string | null
          connection_quality?: string | null
          id?: string
          identity?: string
          is_active?: boolean | null
          joined_at?: string | null
          left_at?: string | null
          participant_id?: string | null
          participant_name?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "breakout_room_participants_breakout_room_id_fkey"
            columns: ["breakout_room_id"]
            isOneToOne: false
            referencedRelation: "breakout_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "breakout_room_participants_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "instant_session_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      breakout_room_transitions: {
        Row: {
          from_room_id: string | null
          id: string
          moved_at: string | null
          moved_by: string | null
          participant_id: string | null
          reason: string | null
          to_room_id: string | null
          transition_type: string | null
          transitioned_at: string | null
          user_id: string | null
        }
        Insert: {
          from_room_id?: string | null
          id?: string
          moved_at?: string | null
          moved_by?: string | null
          participant_id?: string | null
          reason?: string | null
          to_room_id?: string | null
          transition_type?: string | null
          transitioned_at?: string | null
          user_id?: string | null
        }
        Update: {
          from_room_id?: string | null
          id?: string
          moved_at?: string | null
          moved_by?: string | null
          participant_id?: string | null
          reason?: string | null
          to_room_id?: string | null
          transition_type?: string | null
          transitioned_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "breakout_room_transitions_from_room_id_fkey"
            columns: ["from_room_id"]
            isOneToOne: false
            referencedRelation: "breakout_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "breakout_room_transitions_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "instant_session_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "breakout_room_transitions_to_room_id_fkey"
            columns: ["to_room_id"]
            isOneToOne: false
            referencedRelation: "breakout_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      breakout_rooms: {
        Row: {
          assignment_mode: string | null
          closed_at: string | null
          created_at: string | null
          created_by: string | null
          current_participants: number | null
          id: string
          is_active: boolean | null
          main_session_id: string | null
          max_participants: number | null
          room_name: string
          room_sid: string | null
          session_id: string | null
          status: string | null
          twilio_room_sid: string | null
        }
        Insert: {
          assignment_mode?: string | null
          closed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          current_participants?: number | null
          id?: string
          is_active?: boolean | null
          main_session_id?: string | null
          max_participants?: number | null
          room_name: string
          room_sid?: string | null
          session_id?: string | null
          status?: string | null
          twilio_room_sid?: string | null
        }
        Update: {
          assignment_mode?: string | null
          closed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          current_participants?: number | null
          id?: string
          is_active?: boolean | null
          main_session_id?: string | null
          max_participants?: number | null
          room_name?: string
          room_sid?: string | null
          session_id?: string | null
          status?: string | null
          twilio_room_sid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "breakout_rooms_main_session_id_fkey"
            columns: ["main_session_id"]
            isOneToOne: false
            referencedRelation: "video_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "breakout_rooms_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "instant_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_sync_tokens: {
        Row: {
          access_token: string
          calendar_id: string | null
          created_at: string | null
          id: string
          last_sync_at: string | null
          provider: string
          refresh_token: string | null
          sync_enabled: boolean | null
          sync_errors: Json | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          calendar_id?: string | null
          created_at?: string | null
          id?: string
          last_sync_at?: string | null
          provider: string
          refresh_token?: string | null
          sync_enabled?: boolean | null
          sync_errors?: Json | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          calendar_id?: string | null
          created_at?: string | null
          id?: string
          last_sync_at?: string | null
          provider?: string
          refresh_token?: string | null
          sync_enabled?: boolean | null
          sync_errors?: Json | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chat_usage: {
        Row: {
          created_at: string | null
          id: string
          tokens_used: number
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          tokens_used?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          tokens_used?: number
          user_id?: string | null
        }
        Relationships: []
      }
      health_checks: {
        Row: {
          checked_at: string | null
          created_at: string | null
          database_connected: boolean | null
          id: string
          metadata: Json | null
          response_time_ms: number | null
          service_name: string
          status: string
          webrtc_available: boolean | null
        }
        Insert: {
          checked_at?: string | null
          created_at?: string | null
          database_connected?: boolean | null
          id?: string
          metadata?: Json | null
          response_time_ms?: number | null
          service_name: string
          status: string
          webrtc_available?: boolean | null
        }
        Update: {
          checked_at?: string | null
          created_at?: string | null
          database_connected?: boolean | null
          id?: string
          metadata?: Json | null
          response_time_ms?: number | null
          service_name?: string
          status?: string
          webrtc_available?: boolean | null
        }
        Relationships: []
      }
      instant_session_participants: {
        Row: {
          connection_quality: string | null
          id: string
          is_active: boolean | null
          joined_at: string | null
          left_at: string | null
          metadata: Json | null
          participant_name: string
          participant_type: string | null
          role: string | null
          session_id: string
          user_id: string
        }
        Insert: {
          connection_quality?: string | null
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          left_at?: string | null
          metadata?: Json | null
          participant_name: string
          participant_type?: string | null
          role?: string | null
          session_id: string
          user_id: string
        }
        Update: {
          connection_quality?: string | null
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          left_at?: string | null
          metadata?: Json | null
          participant_name?: string
          participant_type?: string | null
          role?: string | null
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "instant_session_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "instant_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      instant_sessions: {
        Row: {
          created_at: string | null
          duration_hours: number | null
          ended_at: string | null
          expires_at: string
          id: string
          is_active: boolean | null
          max_participants: number | null
          metadata: Json | null
          recording_enabled: boolean | null
          room_name: string | null
          session_name: string
          session_status: string | null
          session_token: string
          therapist_id: string
          waiting_room_enabled: boolean | null
        }
        Insert: {
          created_at?: string | null
          duration_hours?: number | null
          ended_at?: string | null
          expires_at: string
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          metadata?: Json | null
          recording_enabled?: boolean | null
          room_name?: string | null
          session_name: string
          session_status?: string | null
          session_token: string
          therapist_id: string
          waiting_room_enabled?: boolean | null
        }
        Update: {
          created_at?: string | null
          duration_hours?: number | null
          ended_at?: string | null
          expires_at?: string
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          metadata?: Json | null
          recording_enabled?: boolean | null
          room_name?: string | null
          session_name?: string
          session_status?: string | null
          session_token?: string
          therapist_id?: string
          waiting_room_enabled?: boolean | null
        }
        Relationships: []
      }
      mood_entries: {
        Row: {
          anxiety_level: number | null
          created_at: string | null
          energy_level: number | null
          id: string
          mood_score: number
          notes: string | null
          recorded_at: string | null
          sleep_quality: number | null
          stress_level: number | null
          tags: string[] | null
          user_id: string
        }
        Insert: {
          anxiety_level?: number | null
          created_at?: string | null
          energy_level?: number | null
          id?: string
          mood_score: number
          notes?: string | null
          recorded_at?: string | null
          sleep_quality?: number | null
          stress_level?: number | null
          tags?: string[] | null
          user_id: string
        }
        Update: {
          anxiety_level?: number | null
          created_at?: string | null
          energy_level?: number | null
          id?: string
          mood_score?: number
          notes?: string | null
          recorded_at?: string | null
          sleep_quality?: number | null
          stress_level?: number | null
          tags?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          appointment_changes: boolean | null
          appointment_reminders: boolean | null
          created_at: string | null
          email_enabled: boolean | null
          id: string
          marketing: boolean | null
          new_messages: boolean | null
          push_enabled: boolean | null
          session_updates: boolean | null
          sms_enabled: boolean | null
          treatment_updates: boolean | null
          updated_at: string | null
          user_id: string
          weekly_summary: boolean | null
        }
        Insert: {
          appointment_changes?: boolean | null
          appointment_reminders?: boolean | null
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          marketing?: boolean | null
          new_messages?: boolean | null
          push_enabled?: boolean | null
          session_updates?: boolean | null
          sms_enabled?: boolean | null
          treatment_updates?: boolean | null
          updated_at?: string | null
          user_id: string
          weekly_summary?: boolean | null
        }
        Update: {
          appointment_changes?: boolean | null
          appointment_reminders?: boolean | null
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          marketing?: boolean | null
          new_messages?: boolean | null
          push_enabled?: boolean | null
          session_updates?: boolean | null
          sms_enabled?: boolean | null
          treatment_updates?: boolean | null
          updated_at?: string | null
          user_id?: string
          weekly_summary?: boolean | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          data: Json | null
          id: string
          message: string | null
          priority: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string | null
          priority?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string | null
          priority?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      patient_assignments: {
        Row: {
          assignment_type: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          patient_id: string
          status: string | null
          therapist_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assignment_type?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          patient_id: string
          status?: string | null
          therapist_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assignment_type?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          patient_id?: string
          status?: string | null
          therapist_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      patient_goals: {
        Row: {
          category: string | null
          completed_at: string | null
          created_at: string | null
          goal_text: string
          id: string
          patient_id: string
          progress: number | null
          status: string | null
          target_date: string | null
          therapist_id: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          completed_at?: string | null
          created_at?: string | null
          goal_text: string
          id?: string
          patient_id: string
          progress?: number | null
          status?: string | null
          target_date?: string | null
          therapist_id?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          completed_at?: string | null
          created_at?: string | null
          goal_text?: string
          id?: string
          patient_id?: string
          progress?: number | null
          status?: string | null
          target_date?: string | null
          therapist_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      patient_inquiries: {
        Row: {
          created_at: string | null
          id: string
          message: string
          patient_id: string
          responded_at: string | null
          response: string | null
          status: string | null
          subject: string
          therapist_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          patient_id: string
          responded_at?: string | null
          response?: string | null
          status?: string | null
          subject: string
          therapist_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          patient_id?: string
          responded_at?: string | null
          response?: string | null
          status?: string | null
          subject?: string
          therapist_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_inquiries_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_inquiries_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_resources: {
        Row: {
          category: string | null
          content: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          resource_type: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          resource_type?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          resource_type?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      patient_therapist_relationships: {
        Row: {
          created_at: string | null
          ended_at: string | null
          id: string
          notes: string | null
          patient_id: string
          relationship_status: string | null
          started_at: string | null
          therapist_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          relationship_status?: string | null
          started_at?: string | null
          therapist_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          relationship_status?: string | null
          started_at?: string | null
          therapist_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          average: number | null
          count: number | null
          created_at: string | null
          id: string
          max: number | null
          metadata: Json | null
          metric_name: string
          min: number | null
          timestamp: string | null
        }
        Insert: {
          average?: number | null
          count?: number | null
          created_at?: string | null
          id?: string
          max?: number | null
          metadata?: Json | null
          metric_name: string
          min?: number | null
          timestamp?: string | null
        }
        Update: {
          average?: number | null
          count?: number | null
          created_at?: string | null
          id?: string
          max?: number | null
          metadata?: Json | null
          metric_name?: string
          min?: number | null
          timestamp?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          accepting_new_patients: boolean | null
          account_type: string | null
          admin_notes: string | null
          approval_status: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          hourly_rate: number | null
          id: string
          location: string | null
          specializations: string[] | null
          updated_at: string | null
          years_experience: number | null
        }
        Insert: {
          accepting_new_patients?: boolean | null
          account_type?: string | null
          admin_notes?: string | null
          approval_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          hourly_rate?: number | null
          id: string
          location?: string | null
          specializations?: string[] | null
          updated_at?: string | null
          years_experience?: number | null
        }
        Update: {
          accepting_new_patients?: boolean | null
          account_type?: string | null
          admin_notes?: string | null
          approval_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          hourly_rate?: number | null
          id?: string
          location?: string | null
          specializations?: string[] | null
          updated_at?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      session_notes: {
        Row: {
          created_at: string | null
          homework_assigned: string | null
          id: string
          mood_rating: number | null
          next_steps: string | null
          notes: string | null
          patient_id: string
          private_notes: string | null
          session_id: string | null
          session_quality: number | null
          therapist_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          homework_assigned?: string | null
          id?: string
          mood_rating?: number | null
          next_steps?: string | null
          notes?: string | null
          patient_id: string
          private_notes?: string | null
          session_id?: string | null
          session_quality?: number | null
          therapist_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          homework_assigned?: string | null
          id?: string
          mood_rating?: number | null
          next_steps?: string | null
          notes?: string | null
          patient_id?: string
          private_notes?: string | null
          session_id?: string | null
          session_quality?: number | null
          therapist_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_notes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "video_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_participants: {
        Row: {
          created_at: string | null
          id: string
          joined_at: string | null
          left_at: string | null
          role: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          joined_at?: string | null
          left_at?: string | null
          role?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          joined_at?: string | null
          left_at?: string | null
          role?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "video_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_availability_slots: {
        Row: {
          created_at: string | null
          end_time: string
          id: string
          is_available: boolean | null
          is_booked: boolean | null
          slot_date: string
          start_time: string
          therapist_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_time: string
          id?: string
          is_available?: boolean | null
          is_booked?: boolean | null
          slot_date: string
          start_time: string
          therapist_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_time?: string
          id?: string
          is_available?: boolean | null
          is_booked?: boolean | null
          slot_date?: string
          start_time?: string
          therapist_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      treatment_plans: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          goals: Json | null
          id: string
          patient_id: string
          start_date: string | null
          status: string | null
          therapist_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          goals?: Json | null
          id?: string
          patient_id: string
          start_date?: string | null
          status?: string | null
          therapist_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          goals?: Json | null
          id?: string
          patient_id?: string
          start_date?: string | null
          status?: string | null
          therapist_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "treatment_plans_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_plans_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      video_sessions: {
        Row: {
          created_at: string | null
          created_by: string | null
          ended_at: string | null
          id: string
          room_name: string | null
          session_type: string | null
          started_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          ended_at?: string | null
          id?: string
          room_name?: string | null
          session_type?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          ended_at?: string | null
          id?: string
          room_name?: string | null
          session_type?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_instant_sessions: { Args: never; Returns: undefined }
      get_patient_statistics: { Args: { patient_uuid: string }; Returns: Json }
      get_therapist_statistics: {
        Args: { therapist_uuid: string }
        Returns: Json
      }
      get_upcoming_appointment_reminders: {
        Args: never
        Returns: {
          appointment_id: string
          end_time: string
          notification_type: string
          patient_email: string
          patient_name: string
          phone_number: string
          start_time: string
          therapist_name: string
          title: string
        }[]
      }
      get_upcoming_appointments: {
        Args: { days_ahead?: number; for_user_id: string }
        Returns: {
          duration_minutes: number
          id: string
          patient_id: string
          patient_name: string
          scheduled_at: string
          status: string
          therapist_id: string
          therapist_name: string
        }[]
      }
      get_user_roles: {
        Args: { user_id: string }
        Returns: {
          role_name: string
        }[]
      }
      mark_notifications_read: {
        Args: { notification_ids: string[] }
        Returns: number
      }
      notify_user: {
        Args: {
          notification_action_url?: string
          notification_data?: Json
          notification_message: string
          notification_priority?: string
          notification_title: string
          notification_type: string
          target_user_id: string
        }
        Returns: string
      }
      sync_user_roles:
        | { Args: { p_user_id?: string }; Returns: Json }
        | { Args: never; Returns: Json }
      update_therapist_approval_simple: {
        Args: { admin_notes?: string; new_status: string; therapist_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
