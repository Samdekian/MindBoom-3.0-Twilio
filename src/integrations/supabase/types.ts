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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      appointment_conflicts: {
        Row: {
          appointment_id: string
          conflict_description: string
          conflict_type: string
          created_at: string
          id: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
          suggested_resolution: string | null
        }
        Insert: {
          appointment_id: string
          conflict_description: string
          conflict_type: string
          created_at?: string
          id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          suggested_resolution?: string | null
        }
        Update: {
          appointment_id?: string
          conflict_description?: string
          conflict_type?: string
          created_at?: string
          id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          suggested_resolution?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointment_conflicts_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_reminders: {
        Row: {
          appointment_id: string
          content: string | null
          created_at: string
          error_message: string | null
          id: string
          reminder_type: string
          scheduled_for: string
          sent_at: string | null
          status: string
        }
        Insert: {
          appointment_id: string
          content?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          reminder_type: string
          scheduled_for: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          appointment_id?: string
          content?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          reminder_type?: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_reminders_appointment_id_fkey"
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
          availability_id: string | null
          conflicts: Json | null
          consultation_notes: string | null
          consultation_type: string | null
          created_at: string
          description: string | null
          end_time: string
          google_calendar_event_id: string | null
          id: string
          is_initial_consultation: boolean | null
          last_sync_attempt: string | null
          parent_appointment_id: string | null
          patient_id: string
          recording_consent: boolean | null
          recording_url: string | null
          recurrence_end_date: string | null
          recurrence_rule: string | null
          series_identifier: string | null
          session_notes: string | null
          start_time: string
          status: Database["public"]["Enums"]["appointment_status"]
          sync_direction: string | null
          sync_error: string | null
          sync_status: string | null
          therapist_id: string
          title: string
          updated_at: string
          video_enabled: boolean
          video_meeting_id: string | null
          video_provider: string | null
          video_url: string | null
        }
        Insert: {
          appointment_type?: string | null
          availability_id?: string | null
          conflicts?: Json | null
          consultation_notes?: string | null
          consultation_type?: string | null
          created_at?: string
          description?: string | null
          end_time: string
          google_calendar_event_id?: string | null
          id?: string
          is_initial_consultation?: boolean | null
          last_sync_attempt?: string | null
          parent_appointment_id?: string | null
          patient_id: string
          recording_consent?: boolean | null
          recording_url?: string | null
          recurrence_end_date?: string | null
          recurrence_rule?: string | null
          series_identifier?: string | null
          session_notes?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["appointment_status"]
          sync_direction?: string | null
          sync_error?: string | null
          sync_status?: string | null
          therapist_id: string
          title: string
          updated_at?: string
          video_enabled?: boolean
          video_meeting_id?: string | null
          video_provider?: string | null
          video_url?: string | null
        }
        Update: {
          appointment_type?: string | null
          availability_id?: string | null
          conflicts?: Json | null
          consultation_notes?: string | null
          consultation_type?: string | null
          created_at?: string
          description?: string | null
          end_time?: string
          google_calendar_event_id?: string | null
          id?: string
          is_initial_consultation?: boolean | null
          last_sync_attempt?: string | null
          parent_appointment_id?: string | null
          patient_id?: string
          recording_consent?: boolean | null
          recording_url?: string | null
          recurrence_end_date?: string | null
          recurrence_rule?: string | null
          series_identifier?: string | null
          session_notes?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          sync_direction?: string | null
          sync_error?: string | null
          sync_status?: string | null
          therapist_id?: string
          title?: string
          updated_at?: string
          video_enabled?: boolean
          video_meeting_id?: string | null
          video_provider?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_availability_id_fkey"
            columns: ["availability_id"]
            isOneToOne: false
            referencedRelation: "therapist_availability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_parent_appointment_id_fkey"
            columns: ["parent_appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          activity_timestamp: string
          activity_type: string
          id: string
          ip_address: string | null
          metadata: Json
          resource_id: string | null
          resource_type: string | null
          user_id: string
        }
        Insert: {
          activity_timestamp?: string
          activity_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json
          resource_id?: string | null
          resource_type?: string | null
          user_id: string
        }
        Update: {
          activity_timestamp?: string
          activity_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json
          resource_id?: string | null
          resource_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      calendar_preferences: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          notification_time_minutes: number
          notification_type: Database["public"]["Enums"]["notification_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          notification_time_minutes?: number
          notification_type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          notification_time_minutes?: number
          notification_type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      calendar_sync_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          events_synced: number | null
          id: string
          status: Database["public"]["Enums"]["calendar_sync_status"] | null
          sync_completed_at: string | null
          sync_started_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          events_synced?: number | null
          id?: string
          status?: Database["public"]["Enums"]["calendar_sync_status"] | null
          sync_completed_at?: string | null
          sync_started_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          events_synced?: number | null
          id?: string
          status?: Database["public"]["Enums"]["calendar_sync_status"] | null
          sync_completed_at?: string | null
          sync_started_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      calendly_webhooks: {
        Row: {
          created_at: string
          event_payload: Json | null
          event_type: string
          id: string
          payload: Json
          processed: boolean | null
          processed_at: string | null
          processing_error: string | null
        }
        Insert: {
          created_at?: string
          event_payload?: Json | null
          event_type: string
          id?: string
          payload: Json
          processed?: boolean | null
          processed_at?: string | null
          processing_error?: string | null
        }
        Update: {
          created_at?: string
          event_payload?: Json | null
          event_type?: string
          id?: string
          payload?: Json
          processed?: boolean | null
          processed_at?: string | null
          processing_error?: string | null
        }
        Relationships: []
      }
      caseload_configurations: {
        Row: {
          auto_assignment_enabled: boolean | null
          created_at: string
          id: string
          max_active_patients: number
          max_weekly_sessions: number
          preferred_patient_types: string[] | null
          therapist_id: string
          updated_at: string
          workload_status: string
        }
        Insert: {
          auto_assignment_enabled?: boolean | null
          created_at?: string
          id?: string
          max_active_patients?: number
          max_weekly_sessions?: number
          preferred_patient_types?: string[] | null
          therapist_id: string
          updated_at?: string
          workload_status?: string
        }
        Update: {
          auto_assignment_enabled?: boolean | null
          created_at?: string
          id?: string
          max_active_patients?: number
          max_weekly_sessions?: number
          preferred_patient_types?: string[] | null
          therapist_id?: string
          updated_at?: string
          workload_status?: string
        }
        Relationships: []
      }
      consultation_types: {
        Row: {
          created_at: string | null
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean | null
          is_free: boolean | null
          name: string
          price: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          is_free?: boolean | null
          name: string
          price?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          is_free?: boolean | null
          name?: string
          price?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      field_access_control: {
        Row: {
          created_at: string | null
          field_name: string
          hidden: boolean | null
          id: string
          mask: boolean | null
          read_only: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          field_name: string
          hidden?: boolean | null
          id?: string
          mask?: boolean | null
          read_only?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          field_name?: string
          hidden?: boolean | null
          id?: string
          mask?: boolean | null
          read_only?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      google_calendar_webhook_configs: {
        Row: {
          calendar_id: string
          channel_id: string
          created_at: string | null
          expiration_time: string
          id: string
          resource_id: string
          user_id: string
        }
        Insert: {
          calendar_id: string
          channel_id: string
          created_at?: string | null
          expiration_time: string
          id?: string
          resource_id: string
          user_id: string
        }
        Update: {
          calendar_id?: string
          channel_id?: string
          created_at?: string | null
          expiration_time?: string
          id?: string
          resource_id?: string
          user_id?: string
        }
        Relationships: []
      }
      google_calendar_webhooks: {
        Row: {
          channel_id: string
          created_at: string | null
          headers: Json | null
          id: string
          processed: boolean | null
          processed_at: string | null
          resource_id: string
          resource_state: string | null
        }
        Insert: {
          channel_id: string
          created_at?: string | null
          headers?: Json | null
          id?: string
          processed?: boolean | null
          processed_at?: string | null
          resource_id: string
          resource_state?: string | null
        }
        Update: {
          channel_id?: string
          created_at?: string | null
          headers?: Json | null
          id?: string
          processed?: boolean | null
          processed_at?: string | null
          resource_id?: string
          resource_state?: string | null
        }
        Relationships: []
      }
      health_checks: {
        Row: {
          agora_credentials_configured: boolean | null
          agora_sdk_loaded: boolean | null
          created_at: string
          database_connected: boolean | null
          error_message: string | null
          id: string
          last_check_at: string
          metadata: Json | null
          response_time_ms: number | null
          service_name: string
          status: string
          timestamp: string | null
          updated_at: string
          webrtc_available: boolean | null
        }
        Insert: {
          agora_credentials_configured?: boolean | null
          agora_sdk_loaded?: boolean | null
          created_at?: string
          database_connected?: boolean | null
          error_message?: string | null
          id?: string
          last_check_at?: string
          metadata?: Json | null
          response_time_ms?: number | null
          service_name: string
          status?: string
          timestamp?: string | null
          updated_at?: string
          webrtc_available?: boolean | null
        }
        Update: {
          agora_credentials_configured?: boolean | null
          agora_sdk_loaded?: boolean | null
          created_at?: string
          database_connected?: boolean | null
          error_message?: string | null
          id?: string
          last_check_at?: string
          metadata?: Json | null
          response_time_ms?: number | null
          service_name?: string
          status?: string
          timestamp?: string | null
          updated_at?: string
          webrtc_available?: boolean | null
        }
        Relationships: []
      }
      ice_server_health: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          is_working: boolean
          last_tested: string | null
          response_time: number | null
          server_type: string
          server_url: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          is_working: boolean
          last_tested?: string | null
          response_time?: number | null
          server_type: string
          server_url: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          is_working?: boolean
          last_tested?: string | null
          response_time?: number | null
          server_type?: string
          server_url?: string
        }
        Relationships: []
      }
      initial_consultations: {
        Row: {
          appointment_id: string | null
          consultation_type_id: string
          created_at: string | null
          goals: string | null
          id: string
          notes: string | null
          patient_id: string
          preferred_communication: string | null
          previous_therapy: boolean | null
          reason_for_seeking: string | null
          specific_concerns: string | null
          status: string | null
          therapist_id: string
          updated_at: string | null
          urgency_level: string | null
        }
        Insert: {
          appointment_id?: string | null
          consultation_type_id: string
          created_at?: string | null
          goals?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          preferred_communication?: string | null
          previous_therapy?: boolean | null
          reason_for_seeking?: string | null
          specific_concerns?: string | null
          status?: string | null
          therapist_id: string
          updated_at?: string | null
          urgency_level?: string | null
        }
        Update: {
          appointment_id?: string | null
          consultation_type_id?: string
          created_at?: string | null
          goals?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          preferred_communication?: string | null
          previous_therapy?: boolean | null
          reason_for_seeking?: string | null
          specific_concerns?: string | null
          status?: string | null
          therapist_id?: string
          updated_at?: string | null
          urgency_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "initial_consultations_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "initial_consultations_consultation_type_id_fkey"
            columns: ["consultation_type_id"]
            isOneToOne: false
            referencedRelation: "consultation_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "initial_consultations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "initial_consultations_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiry_responses: {
        Row: {
          attachments: string[] | null
          content: string
          created_at: string | null
          id: string
          inquiry_id: string
          is_automated: boolean | null
          responder_id: string
          response_type: string | null
        }
        Insert: {
          attachments?: string[] | null
          content: string
          created_at?: string | null
          id?: string
          inquiry_id: string
          is_automated?: boolean | null
          responder_id: string
          response_type?: string | null
        }
        Update: {
          attachments?: string[] | null
          content?: string
          created_at?: string | null
          id?: string
          inquiry_id?: string
          is_automated?: boolean | null
          responder_id?: string
          response_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inquiry_responses_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "patient_inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiry_responses_responder_id_fkey"
            columns: ["responder_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      instant_session_participants: {
        Row: {
          id: string
          is_active: boolean
          joined_at: string
          left_at: string | null
          participant_name: string | null
          role: string
          session_id: string
          user_id: string | null
        }
        Insert: {
          id?: string
          is_active?: boolean
          joined_at?: string
          left_at?: string | null
          participant_name?: string | null
          role?: string
          session_id: string
          user_id?: string | null
        }
        Update: {
          id?: string
          is_active?: boolean
          joined_at?: string
          left_at?: string | null
          participant_name?: string | null
          role?: string
          session_id?: string
          user_id?: string | null
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
          created_at: string
          expires_at: string
          host_user_id: string | null
          id: string
          is_active: boolean
          max_participants: number
          recording_enabled: boolean
          session_name: string
          session_status: string | null
          session_token: string
          session_type: string | null
          sfu_room_id: string | null
          therapist_id: string
          updated_at: string
          waiting_room_enabled: boolean
        }
        Insert: {
          created_at?: string
          expires_at: string
          host_user_id?: string | null
          id?: string
          is_active?: boolean
          max_participants?: number
          recording_enabled?: boolean
          session_name: string
          session_status?: string | null
          session_token: string
          session_type?: string | null
          sfu_room_id?: string | null
          therapist_id: string
          updated_at?: string
          waiting_room_enabled?: boolean
        }
        Update: {
          created_at?: string
          expires_at?: string
          host_user_id?: string | null
          id?: string
          is_active?: boolean
          max_participants?: number
          recording_enabled?: boolean
          session_name?: string
          session_status?: string | null
          session_token?: string
          session_type?: string | null
          sfu_room_id?: string | null
          therapist_id?: string
          updated_at?: string
          waiting_room_enabled?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "instant_sessions_sfu_room_id_fkey"
            columns: ["sfu_room_id"]
            isOneToOne: false
            referencedRelation: "sfu_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_providers: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          type: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          type?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          type?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachment_urls: string[] | null
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          message_type: string
          priority: string | null
          recipient_id: string
          sender_id: string
          subject: string | null
          thread_id: string | null
          updated_at: string
        }
        Insert: {
          attachment_urls?: string[] | null
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string
          priority?: string | null
          recipient_id: string
          sender_id: string
          subject?: string | null
          thread_id?: string | null
          updated_at?: string
        }
        Update: {
          attachment_urls?: string[] | null
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string
          priority?: string | null
          recipient_id?: string
          sender_id?: string
          subject?: string | null
          thread_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      mood_entries: {
        Row: {
          created_at: string
          id: string
          mood_label: string
          mood_value: number
          notes: string | null
          patient_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          mood_label: string
          mood_value: number
          notes?: string | null
          patient_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          mood_label?: string
          mood_value?: number
          notes?: string | null
          patient_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          appointment_reminder_time: number | null
          appointment_reminders: boolean | null
          chat_notifications: boolean | null
          created_at: string
          email_enabled: boolean | null
          id: string
          marketing_emails: boolean | null
          push_enabled: boolean | null
          sms_enabled: boolean | null
          system_updates: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_reminder_time?: number | null
          appointment_reminders?: boolean | null
          chat_notifications?: boolean | null
          created_at?: string
          email_enabled?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          push_enabled?: boolean | null
          sms_enabled?: boolean | null
          system_updates?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_reminder_time?: number | null
          appointment_reminders?: boolean | null
          chat_notifications?: boolean | null
          created_at?: string
          email_enabled?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          push_enabled?: boolean | null
          sms_enabled?: boolean | null
          system_updates?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          email_sent: boolean | null
          email_sent_at: string | null
          expires_at: string | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          email_sent?: boolean | null
          email_sent_at?: string | null
          expires_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          email_sent?: boolean | null
          email_sent_at?: string | null
          expires_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      participant_streams: {
        Row: {
          agora_uid: number
          audio_quality: string | null
          connection_quality: string | null
          id: string
          is_active: boolean | null
          is_publishing: boolean | null
          is_subscribed: boolean | null
          joined_at: string | null
          left_at: string | null
          participant_name: string | null
          session_id: string
          stream_type: string
          user_id: string | null
          video_quality: string | null
        }
        Insert: {
          agora_uid: number
          audio_quality?: string | null
          connection_quality?: string | null
          id?: string
          is_active?: boolean | null
          is_publishing?: boolean | null
          is_subscribed?: boolean | null
          joined_at?: string | null
          left_at?: string | null
          participant_name?: string | null
          session_id: string
          stream_type: string
          user_id?: string | null
          video_quality?: string | null
        }
        Update: {
          agora_uid?: number
          audio_quality?: string | null
          connection_quality?: string | null
          id?: string
          is_active?: boolean | null
          is_publishing?: boolean | null
          is_subscribed?: boolean | null
          joined_at?: string | null
          left_at?: string | null
          participant_name?: string | null
          session_id?: string
          stream_type?: string
          user_id?: string | null
          video_quality?: string | null
        }
        Relationships: []
      }
      patient_assignments: {
        Row: {
          assigned_by: string
          assignment_reason: string | null
          created_at: string
          end_date: string | null
          id: string
          patient_id: string
          priority_level: string
          start_date: string
          status: string
          therapist_id: string
          updated_at: string
        }
        Insert: {
          assigned_by: string
          assignment_reason?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          patient_id: string
          priority_level?: string
          start_date?: string
          status?: string
          therapist_id: string
          updated_at?: string
        }
        Update: {
          assigned_by?: string
          assignment_reason?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          patient_id?: string
          priority_level?: string
          start_date?: string
          status?: string
          therapist_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      patient_goals: {
        Row: {
          created_at: string
          description: string | null
          id: string
          patient_id: string
          progress_percentage: number | null
          status: string
          target_date: string | null
          therapist_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          patient_id: string
          progress_percentage?: number | null
          status?: string
          target_date?: string | null
          therapist_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          patient_id?: string
          progress_percentage?: number | null
          status?: string
          target_date?: string | null
          therapist_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      patient_group_memberships: {
        Row: {
          added_at: string
          added_by: string
          group_id: string
          id: string
          notes: string | null
          patient_id: string
        }
        Insert: {
          added_at?: string
          added_by: string
          group_id: string
          id?: string
          notes?: string | null
          patient_id: string
        }
        Update: {
          added_at?: string
          added_by?: string
          group_id?: string
          id?: string
          notes?: string | null
          patient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_group_memberships_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "patient_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_groups: {
        Row: {
          color: string | null
          created_at: string
          created_by: string
          description: string | null
          group_type: string
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          group_type?: string
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          group_type?: string
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      patient_inquiries: {
        Row: {
          created_at: string | null
          id: string
          inquiry_type: string | null
          message: string
          patient_email: string | null
          patient_id: string
          patient_phone: string | null
          preferred_contact_method: string | null
          priority: string | null
          responded_at: string | null
          responded_by: string | null
          response_message: string | null
          source: string | null
          status: string | null
          subject: string
          therapist_id: string
          updated_at: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          inquiry_type?: string | null
          message: string
          patient_email?: string | null
          patient_id: string
          patient_phone?: string | null
          preferred_contact_method?: string | null
          priority?: string | null
          responded_at?: string | null
          responded_by?: string | null
          response_message?: string | null
          source?: string | null
          status?: string | null
          subject: string
          therapist_id: string
          updated_at?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          inquiry_type?: string | null
          message?: string
          patient_email?: string | null
          patient_id?: string
          patient_phone?: string | null
          preferred_contact_method?: string | null
          priority?: string | null
          responded_at?: string | null
          responded_by?: string | null
          response_message?: string | null
          source?: string | null
          status?: string | null
          subject?: string
          therapist_id?: string
          updated_at?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
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
            foreignKeyName: "patient_inquiries_responded_by_fkey"
            columns: ["responded_by"]
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
      patient_intake_forms: {
        Row: {
          allergies: string | null
          created_at: string | null
          cultural_considerations: string | null
          current_medications: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          form_type: string
          id: string
          medical_conditions: string | null
          patient_id: string
          preferred_therapy_style: string | null
          previous_mental_health_treatment: boolean | null
          previous_therapists: string | null
          primary_concerns: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          session_frequency_preference: string | null
          sleep_patterns: string | null
          status: string | null
          submitted_at: string | null
          substance_use: string | null
          support_system: string | null
          symptom_duration: string | null
          symptoms_description: string | null
          therapist_id: string | null
          therapist_notes: string | null
          therapy_goals: string | null
          triggers: string | null
          updated_at: string | null
        }
        Insert: {
          allergies?: string | null
          created_at?: string | null
          cultural_considerations?: string | null
          current_medications?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          form_type?: string
          id?: string
          medical_conditions?: string | null
          patient_id: string
          preferred_therapy_style?: string | null
          previous_mental_health_treatment?: boolean | null
          previous_therapists?: string | null
          primary_concerns?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          session_frequency_preference?: string | null
          sleep_patterns?: string | null
          status?: string | null
          submitted_at?: string | null
          substance_use?: string | null
          support_system?: string | null
          symptom_duration?: string | null
          symptoms_description?: string | null
          therapist_id?: string | null
          therapist_notes?: string | null
          therapy_goals?: string | null
          triggers?: string | null
          updated_at?: string | null
        }
        Update: {
          allergies?: string | null
          created_at?: string | null
          cultural_considerations?: string | null
          current_medications?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          form_type?: string
          id?: string
          medical_conditions?: string | null
          patient_id?: string
          preferred_therapy_style?: string | null
          previous_mental_health_treatment?: boolean | null
          previous_therapists?: string | null
          primary_concerns?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          session_frequency_preference?: string | null
          sleep_patterns?: string | null
          status?: string | null
          submitted_at?: string | null
          substance_use?: string | null
          support_system?: string | null
          symptom_duration?: string | null
          symptoms_description?: string | null
          therapist_id?: string | null
          therapist_notes?: string | null
          therapy_goals?: string | null
          triggers?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_intake_forms_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_intake_forms_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_intake_forms_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_notes: {
        Row: {
          appointment_id: string | null
          content: string
          created_at: string
          id: string
          is_private: boolean | null
          note_type: string
          patient_id: string
          tags: string[] | null
          therapist_id: string
          title: string
          treatment_plan_id: string | null
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          content: string
          created_at?: string
          id?: string
          is_private?: boolean | null
          note_type?: string
          patient_id: string
          tags?: string[] | null
          therapist_id: string
          title: string
          treatment_plan_id?: string | null
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          content?: string
          created_at?: string
          id?: string
          is_private?: boolean | null
          note_type?: string
          patient_id?: string
          tags?: string[] | null
          therapist_id?: string
          title?: string
          treatment_plan_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_notes_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_notes_treatment_plan_id_fkey"
            columns: ["treatment_plan_id"]
            isOneToOne: false
            referencedRelation: "treatment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_resources: {
        Row: {
          content_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          file_path: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          resource_type: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          content_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_path?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          resource_type?: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          content_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_path?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          resource_type?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      patient_search_criteria: {
        Row: {
          created_at: string
          created_by: string
          criteria: Json
          id: string
          is_shared: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          criteria?: Json
          id?: string
          is_shared?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          criteria?: Json
          id?: string
          is_shared?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      patient_source_attribution: {
        Row: {
          conversion_date: string | null
          converted_to_patient: boolean | null
          created_at: string | null
          device_type: string | null
          id: string
          location_data: Json | null
          patient_id: string
          referrer_url: string | null
          source: string
          source_type: string
          therapist_id: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          conversion_date?: string | null
          converted_to_patient?: boolean | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          location_data?: Json | null
          patient_id: string
          referrer_url?: string | null
          source: string
          source_type: string
          therapist_id: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          conversion_date?: string | null
          converted_to_patient?: boolean | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          location_data?: Json | null
          patient_id?: string
          referrer_url?: string | null
          source?: string
          source_type?: string
          therapist_id?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_source_attribution_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_source_attribution_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_tag_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string
          id: string
          patient_id: string
          tag_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by: string
          id?: string
          patient_id: string
          tag_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string
          id?: string
          patient_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_tag_assignments_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "patient_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_tags: {
        Row: {
          category: string | null
          color: string | null
          created_at: string
          created_by: string
          id: string
          is_system_tag: boolean | null
          name: string
        }
        Insert: {
          category?: string | null
          color?: string | null
          created_at?: string
          created_by: string
          id?: string
          is_system_tag?: boolean | null
          name: string
        }
        Update: {
          category?: string | null
          color?: string | null
          created_at?: string
          created_by?: string
          id?: string
          is_system_tag?: boolean | null
          name?: string
        }
        Relationships: []
      }
      patient_therapist_relationships: {
        Row: {
          created_at: string | null
          created_from_consultation_id: string | null
          created_from_inquiry_id: string | null
          end_date: string | null
          id: string
          patient_id: string
          relationship_notes: string | null
          relationship_status: string
          start_date: string | null
          termination_reason: string | null
          therapist_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_from_consultation_id?: string | null
          created_from_inquiry_id?: string | null
          end_date?: string | null
          id?: string
          patient_id: string
          relationship_notes?: string | null
          relationship_status?: string
          start_date?: string | null
          termination_reason?: string | null
          therapist_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_from_consultation_id?: string | null
          created_from_inquiry_id?: string | null
          end_date?: string | null
          id?: string
          patient_id?: string
          relationship_notes?: string | null
          relationship_status?: string
          start_date?: string | null
          termination_reason?: string | null
          therapist_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_therapist_relationshi_created_from_consultation_id_fkey"
            columns: ["created_from_consultation_id"]
            isOneToOne: false
            referencedRelation: "initial_consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_therapist_relationships_created_from_inquiry_id_fkey"
            columns: ["created_from_inquiry_id"]
            isOneToOne: false
            referencedRelation: "patient_inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_therapist_relationships_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_therapist_relationships_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_metrics: {
        Row: {
          average: number
          count: number
          created_at: string | null
          id: string
          max: number
          metric_name: string
          min: number
          timestamp: string | null
        }
        Insert: {
          average: number
          count?: number
          created_at?: string | null
          id?: string
          max: number
          metric_name: string
          min: number
          timestamp?: string | null
        }
        Update: {
          average?: number
          count?: number
          created_at?: string | null
          id?: string
          max?: number
          metric_name?: string
          min?: number
          timestamp?: string | null
        }
        Relationships: []
      }
      permissions: {
        Row: {
          action: string
          category: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          resource: string
          updated_at: string
        }
        Insert: {
          action: string
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          resource: string
          updated_at?: string
        }
        Update: {
          action?: string
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          resource?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          accepting_new_patients: boolean | null
          account_type: string | null
          address: string | null
          admin_notes: string | null
          approval_request_date: string | null
          approval_status: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          full_name: string | null
          hipaa_consent: boolean | null
          hipaa_consent_date: string | null
          hourly_rate: number | null
          id: string
          insurance_provider: string | null
          languages_spoken: string[] | null
          phone_number: string | null
          practice_type: string | null
          preferred_communication: string | null
          security_level: string
          status: string | null
          two_factor_enabled: boolean | null
          two_factor_setup_complete: boolean | null
          two_factor_updated_at: string | null
          updated_at: string
          website_url: string | null
          years_experience: number | null
        }
        Insert: {
          accepting_new_patients?: boolean | null
          account_type?: string | null
          address?: string | null
          admin_notes?: string | null
          approval_request_date?: string | null
          approval_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string | null
          hipaa_consent?: boolean | null
          hipaa_consent_date?: string | null
          hourly_rate?: number | null
          id: string
          insurance_provider?: string | null
          languages_spoken?: string[] | null
          phone_number?: string | null
          practice_type?: string | null
          preferred_communication?: string | null
          security_level?: string
          status?: string | null
          two_factor_enabled?: boolean | null
          two_factor_setup_complete?: boolean | null
          two_factor_updated_at?: string | null
          updated_at?: string
          website_url?: string | null
          years_experience?: number | null
        }
        Update: {
          accepting_new_patients?: boolean | null
          account_type?: string | null
          address?: string | null
          admin_notes?: string | null
          approval_request_date?: string | null
          approval_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string | null
          hipaa_consent?: boolean | null
          hipaa_consent_date?: string | null
          hourly_rate?: number | null
          id?: string
          insurance_provider?: string | null
          languages_spoken?: string[] | null
          phone_number?: string | null
          practice_type?: string | null
          preferred_communication?: string | null
          security_level?: string
          status?: string | null
          two_factor_enabled?: boolean | null
          two_factor_setup_complete?: boolean | null
          two_factor_updated_at?: string | null
          updated_at?: string
          website_url?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      project_tasks: {
        Row: {
          created_at: string
          description: string | null
          id: string
          priority: Database["public"]["Enums"]["task_priority"]
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission_id: string
          role_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permission_id: string
          role_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      role_sync_events: {
        Row: {
          error_message: string | null
          id: string
          new_role: string
          performed_at: string
          previous_metadata_role: string | null
          previous_profile_role: string | null
          source: string
          success: boolean
          sync_type: string
          user_id: string
        }
        Insert: {
          error_message?: string | null
          id?: string
          new_role: string
          performed_at?: string
          previous_metadata_role?: string | null
          previous_profile_role?: string | null
          source: string
          success?: boolean
          sync_type: string
          user_id: string
        }
        Update: {
          error_message?: string | null
          id?: string
          new_role?: string
          performed_at?: string
          previous_metadata_role?: string | null
          previous_profile_role?: string | null
          source?: string
          success?: boolean
          sync_type?: string
          user_id?: string
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string
          description: string
          id: string
          name: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          name: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      scheduled_tasks: {
        Row: {
          created_at: string | null
          id: string
          interval_minutes: number
          is_active: boolean | null
          last_run: string | null
          next_run: string | null
          task_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          interval_minutes?: number
          is_active?: boolean | null
          last_run?: string | null
          next_run?: string | null
          task_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          interval_minutes?: number
          is_active?: boolean | null
          last_run?: string | null
          next_run?: string | null
          task_name?: string
        }
        Relationships: []
      }
      session_analytics: {
        Row: {
          chat_messages_count: number | null
          connection_quality_avg: number | null
          created_at: string | null
          disconnection_count: number | null
          id: string
          max_concurrent_participants: number | null
          reconnection_count: number | null
          recording_duration_seconds: number | null
          session_id: string
          total_duration_seconds: number | null
          total_participants: number | null
          updated_at: string | null
        }
        Insert: {
          chat_messages_count?: number | null
          connection_quality_avg?: number | null
          created_at?: string | null
          disconnection_count?: number | null
          id?: string
          max_concurrent_participants?: number | null
          reconnection_count?: number | null
          recording_duration_seconds?: number | null
          session_id: string
          total_duration_seconds?: number | null
          total_participants?: number | null
          updated_at?: string | null
        }
        Update: {
          chat_messages_count?: number | null
          connection_quality_avg?: number | null
          created_at?: string | null
          disconnection_count?: number | null
          id?: string
          max_concurrent_participants?: number | null
          reconnection_count?: number | null
          recording_duration_seconds?: number | null
          session_id?: string
          total_duration_seconds?: number | null
          total_participants?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_analytics_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "instant_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_analytics_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          participant_id: string | null
          participant_name: string | null
          session_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          participant_id?: string | null
          participant_name?: string | null
          session_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          participant_id?: string | null
          participant_name?: string | null
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      session_chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_system_message: boolean | null
          sender_id: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_system_message?: boolean | null
          sender_id: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_system_message?: boolean | null
          sender_id?: string
          session_id?: string
        }
        Relationships: []
      }
      session_connection_logs: {
        Row: {
          connection_state: Database["public"]["Enums"]["webrtc_connection_state"]
          created_at: string
          ice_connection_state: string | null
          ice_gathering_state: string | null
          id: string
          local_description: Json | null
          metadata: Json | null
          remote_description: Json | null
          session_id: string
          signaling_state: string | null
          user_id: string
        }
        Insert: {
          connection_state: Database["public"]["Enums"]["webrtc_connection_state"]
          created_at?: string
          ice_connection_state?: string | null
          ice_gathering_state?: string | null
          id?: string
          local_description?: Json | null
          metadata?: Json | null
          remote_description?: Json | null
          session_id: string
          signaling_state?: string | null
          user_id: string
        }
        Update: {
          connection_state?: Database["public"]["Enums"]["webrtc_connection_state"]
          created_at?: string
          ice_connection_state?: string | null
          ice_gathering_state?: string | null
          id?: string
          local_description?: Json | null
          metadata?: Json | null
          remote_description?: Json | null
          session_id?: string
          signaling_state?: string | null
          user_id?: string
        }
        Relationships: []
      }
      session_errors: {
        Row: {
          created_at: string | null
          error_context: Json | null
          error_message: string
          error_type: string
          id: string
          resolved: boolean | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_context?: Json | null
          error_message: string
          error_type: string
          id?: string
          resolved?: boolean | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_context?: Json | null
          error_message?: string
          error_type?: string
          id?: string
          resolved?: boolean | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_errors_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "instant_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_materials: {
        Row: {
          appointment_id: string
          completed_at: string | null
          content: string | null
          created_at: string
          description: string | null
          due_date: string | null
          file_urls: string[] | null
          id: string
          is_completed: boolean | null
          material_type: string
          therapist_id: string
          title: string
          updated_at: string
        }
        Insert: {
          appointment_id: string
          completed_at?: string | null
          content?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          file_urls?: string[] | null
          id?: string
          is_completed?: boolean | null
          material_type: string
          therapist_id: string
          title: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string
          completed_at?: string | null
          content?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          file_urls?: string[] | null
          id?: string
          is_completed?: boolean | null
          material_type?: string
          therapist_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_materials_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      session_notes: {
        Row: {
          appointment_id: string
          content: string
          created_at: string | null
          created_by: string
          id: string
          updated_at: string | null
        }
        Insert: {
          appointment_id: string
          content: string
          created_at?: string | null
          created_by: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string
          content?: string
          created_at?: string | null
          created_by?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_notes_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      session_quality_metrics: {
        Row: {
          connection_quality: string
          id: string
          network_quality: Json | null
          participant_id: string | null
          session_id: string
          timestamp: string
        }
        Insert: {
          connection_quality: string
          id?: string
          network_quality?: Json | null
          participant_id?: string | null
          session_id: string
          timestamp?: string
        }
        Update: {
          connection_quality?: string
          id?: string
          network_quality?: Json | null
          participant_id?: string | null
          session_id?: string
          timestamp?: string
        }
        Relationships: []
      }
      session_recordings: {
        Row: {
          appointment_id: string
          consent_given: boolean
          created_at: string
          duration_seconds: number | null
          file_size_bytes: number | null
          id: string
          recording_status: string
          recording_url: string | null
          retention_date: string | null
          storage_provider: string | null
          updated_at: string
        }
        Insert: {
          appointment_id: string
          consent_given?: boolean
          created_at?: string
          duration_seconds?: number | null
          file_size_bytes?: number | null
          id?: string
          recording_status?: string
          recording_url?: string | null
          retention_date?: string | null
          storage_provider?: string | null
          updated_at?: string
        }
        Update: {
          appointment_id?: string
          consent_given?: boolean
          created_at?: string
          duration_seconds?: number | null
          file_size_bytes?: number | null
          id?: string
          recording_status?: string
          recording_url?: string | null
          retention_date?: string | null
          storage_provider?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_recordings_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      session_states: {
        Row: {
          audio_enabled: boolean | null
          connection_state: string
          created_at: string | null
          id: string
          last_heartbeat: string | null
          screen_sharing: boolean | null
          session_id: string
          state_data: Json
          updated_at: string | null
          user_id: string | null
          video_enabled: boolean | null
        }
        Insert: {
          audio_enabled?: boolean | null
          connection_state?: string
          created_at?: string | null
          id?: string
          last_heartbeat?: string | null
          screen_sharing?: boolean | null
          session_id: string
          state_data?: Json
          updated_at?: string | null
          user_id?: string | null
          video_enabled?: boolean | null
        }
        Update: {
          audio_enabled?: boolean | null
          connection_state?: string
          created_at?: string | null
          id?: string
          last_heartbeat?: string | null
          screen_sharing?: boolean | null
          session_id?: string
          state_data?: Json
          updated_at?: string | null
          user_id?: string | null
          video_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "session_states_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "instant_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sfu_rooms: {
        Row: {
          agora_app_id: string
          agora_channel_name: string
          created_at: string | null
          expires_at: string
          host_user_id: string
          id: string
          is_active: boolean | null
          max_participants: number
          recording_enabled: boolean | null
          recording_resource_id: string | null
          recording_sid: string | null
          room_id: string
        }
        Insert: {
          agora_app_id: string
          agora_channel_name: string
          created_at?: string | null
          expires_at: string
          host_user_id: string
          id?: string
          is_active?: boolean | null
          max_participants?: number
          recording_enabled?: boolean | null
          recording_resource_id?: string | null
          recording_sid?: string | null
          room_id: string
        }
        Update: {
          agora_app_id?: string
          agora_channel_name?: string
          created_at?: string | null
          expires_at?: string
          host_user_id?: string
          id?: string
          is_active?: boolean | null
          max_participants?: number
          recording_enabled?: boolean | null
          recording_resource_id?: string | null
          recording_sid?: string | null
          room_id?: string
        }
        Relationships: []
      }
      signaling_channels: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          session_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          session_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          session_id?: string
        }
        Relationships: []
      }
      signaling_messages: {
        Row: {
          channel_id: string
          content: Json
          created_at: string
          id: string
          message_type: Database["public"]["Enums"]["signaling_message_type"]
          processed_at: string | null
          received_at: string | null
          recipient_id: string | null
          sender_id: string
        }
        Insert: {
          channel_id: string
          content: Json
          created_at?: string
          id?: string
          message_type: Database["public"]["Enums"]["signaling_message_type"]
          processed_at?: string | null
          received_at?: string | null
          recipient_id?: string | null
          sender_id: string
        }
        Update: {
          channel_id?: string
          content?: Json
          created_at?: string
          id?: string
          message_type?: Database["public"]["Enums"]["signaling_message_type"]
          processed_at?: string | null
          received_at?: string | null
          recipient_id?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "signaling_messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "signaling_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      task_dependencies: {
        Row: {
          created_at: string
          depends_on_task_id: string
          id: string
          task_id: string
        }
        Insert: {
          created_at?: string
          depends_on_task_id: string
          id?: string
          task_id: string
        }
        Update: {
          created_at?: string
          depends_on_task_id?: string
          id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_dependencies_depends_on_task_id_fkey"
            columns: ["depends_on_task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_dependencies_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_analytics: {
        Row: {
          consultation_bookings: number | null
          conversion_rate: number | null
          created_at: string | null
          id: string
          inquiry_count: number | null
          metric_date: string
          patient_source_breakdown: Json | null
          profile_views: number | null
          response_time_minutes: number | null
          therapist_id: string
          updated_at: string | null
        }
        Insert: {
          consultation_bookings?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          id?: string
          inquiry_count?: number | null
          metric_date?: string
          patient_source_breakdown?: Json | null
          profile_views?: number | null
          response_time_minutes?: number | null
          therapist_id: string
          updated_at?: string | null
        }
        Update: {
          consultation_bookings?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          id?: string
          inquiry_count?: number | null
          metric_date?: string
          patient_source_breakdown?: Json | null
          profile_views?: number | null
          response_time_minutes?: number | null
          therapist_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "therapist_analytics_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_applications: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          license_number: string
          processed_at: string | null
          processed_by: string | null
          specialization: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          license_number: string
          processed_at?: string | null
          processed_by?: string | null
          specialization: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          license_number?: string
          processed_at?: string | null
          processed_by?: string | null
          specialization?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      therapist_availability: {
        Row: {
          created_at: string
          day_of_week: Database["public"]["Enums"]["day_of_week"]
          duration_minutes: number
          end_time: string
          id: string
          start_time: string
          therapist_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: Database["public"]["Enums"]["day_of_week"]
          duration_minutes?: number
          end_time: string
          id?: string
          start_time: string
          therapist_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: Database["public"]["Enums"]["day_of_week"]
          duration_minutes?: number
          end_time?: string
          id?: string
          start_time?: string
          therapist_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      therapist_availability_slots: {
        Row: {
          created_at: string
          current_bookings: number | null
          id: string
          is_available: boolean | null
          max_bookings: number | null
          notes: string | null
          slot_date: string
          slot_end_time: string
          slot_start_time: string
          slot_type: string | null
          therapist_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_bookings?: number | null
          id?: string
          is_available?: boolean | null
          max_bookings?: number | null
          notes?: string | null
          slot_date: string
          slot_end_time: string
          slot_start_time: string
          slot_type?: string | null
          therapist_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_bookings?: number | null
          id?: string
          is_available?: boolean | null
          max_bookings?: number | null
          notes?: string | null
          slot_date?: string
          slot_end_time?: string
          slot_start_time?: string
          slot_type?: string | null
          therapist_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      therapist_credentials: {
        Row: {
          created_at: string | null
          credential_number: string | null
          credential_type: string
          expiration_date: string | null
          id: string
          issue_date: string | null
          issuing_organization: string | null
          name: string
          therapist_id: string
          updated_at: string | null
          verification_date: string | null
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          credential_number?: string | null
          credential_type: string
          expiration_date?: string | null
          id?: string
          issue_date?: string | null
          issuing_organization?: string | null
          name: string
          therapist_id: string
          updated_at?: string | null
          verification_date?: string | null
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          credential_number?: string | null
          credential_type?: string
          expiration_date?: string | null
          id?: string
          issue_date?: string | null
          issuing_organization?: string | null
          name?: string
          therapist_id?: string
          updated_at?: string | null
          verification_date?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "therapist_credentials_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_education: {
        Row: {
          created_at: string | null
          degree_type: string
          field_of_study: string
          graduation_year: number | null
          id: string
          institution_name: string
          therapist_id: string
        }
        Insert: {
          created_at?: string | null
          degree_type: string
          field_of_study: string
          graduation_year?: number | null
          id?: string
          institution_name: string
          therapist_id: string
        }
        Update: {
          created_at?: string | null
          degree_type?: string
          field_of_study?: string
          graduation_year?: number | null
          id?: string
          institution_name?: string
          therapist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_education_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_insurance_providers: {
        Row: {
          created_at: string | null
          id: string
          insurance_provider_id: string
          therapist_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          insurance_provider_id: string
          therapist_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          insurance_provider_id?: string
          therapist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_insurance_providers_insurance_provider_id_fkey"
            columns: ["insurance_provider_id"]
            isOneToOne: false
            referencedRelation: "insurance_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_insurance_providers_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_profile_specializations: {
        Row: {
          created_at: string | null
          id: string
          specialization_id: string
          therapist_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          specialization_id: string
          therapist_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          specialization_id?: string
          therapist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_profile_specializations_specialization_id_fkey"
            columns: ["specialization_id"]
            isOneToOne: false
            referencedRelation: "therapist_specializations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_profile_specializations_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_search_settings: {
        Row: {
          allow_inquiries: boolean | null
          auto_respond_enabled: boolean | null
          auto_respond_message: string | null
          created_at: string | null
          featured_until: string | null
          id: string
          is_featured: boolean | null
          max_inquiries_per_day: number | null
          profile_boost_score: number | null
          search_keywords: string[] | null
          therapist_id: string
          updated_at: string | null
          visibility_status: string | null
        }
        Insert: {
          allow_inquiries?: boolean | null
          auto_respond_enabled?: boolean | null
          auto_respond_message?: string | null
          created_at?: string | null
          featured_until?: string | null
          id?: string
          is_featured?: boolean | null
          max_inquiries_per_day?: number | null
          profile_boost_score?: number | null
          search_keywords?: string[] | null
          therapist_id: string
          updated_at?: string | null
          visibility_status?: string | null
        }
        Update: {
          allow_inquiries?: boolean | null
          auto_respond_enabled?: boolean | null
          auto_respond_message?: string | null
          created_at?: string | null
          featured_until?: string | null
          id?: string
          is_featured?: boolean | null
          max_inquiries_per_day?: number | null
          profile_boost_score?: number | null
          search_keywords?: string[] | null
          therapist_id?: string
          updated_at?: string | null
          visibility_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "therapist_search_settings_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_settings: {
        Row: {
          access_token: string | null
          calendly_url: string
          calendly_webhook_signing_secret: string | null
          created_at: string | null
          google_calendar_id: string | null
          is_oauth_connected: boolean | null
          organization_uri: string | null
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string
          user_uri: string | null
          video_enabled: boolean
          video_provider: string | null
        }
        Insert: {
          access_token?: string | null
          calendly_url: string
          calendly_webhook_signing_secret?: string | null
          created_at?: string | null
          google_calendar_id?: string | null
          is_oauth_connected?: boolean | null
          organization_uri?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id: string
          user_uri?: string | null
          video_enabled?: boolean
          video_provider?: string | null
        }
        Update: {
          access_token?: string | null
          calendly_url?: string
          calendly_webhook_signing_secret?: string | null
          created_at?: string | null
          google_calendar_id?: string | null
          is_oauth_connected?: boolean | null
          organization_uri?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string
          user_uri?: string | null
          video_enabled?: boolean
          video_provider?: string | null
        }
        Relationships: []
      }
      therapist_specializations: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      treatment_goals: {
        Row: {
          created_at: string
          description: string | null
          id: string
          notes: string | null
          progress_percentage: number | null
          status: string
          target_date: string | null
          title: string
          treatment_plan_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          notes?: string | null
          progress_percentage?: number | null
          status?: string
          target_date?: string | null
          title: string
          treatment_plan_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          notes?: string | null
          progress_percentage?: number | null
          status?: string
          target_date?: string | null
          title?: string
          treatment_plan_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "treatment_goals_treatment_plan_id_fkey"
            columns: ["treatment_plan_id"]
            isOneToOne: false
            referencedRelation: "treatment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      treatment_plans: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          patient_id: string
          priority: string
          start_date: string
          status: string
          therapist_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          patient_id: string
          priority?: string
          start_date?: string
          status?: string
          therapist_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          patient_id?: string
          priority?: string
          start_date?: string
          status?: string
          therapist_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invitation_token: string
          invited_by: string | null
          role_to_assign: string | null
          status: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invitation_token: string
          invited_by?: string | null
          role_to_assign?: string | null
          status?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by?: string | null
          role_to_assign?: string | null
          status?: string | null
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          action: string
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          level: string
          name: string | null
          resource: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action: string
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          level: string
          name?: string | null
          resource: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action?: string
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          level?: string
          name?: string | null
          resource?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role_id?: string
          updated_at?: string
          user_id?: string
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
      webrtc_connection_logs: {
        Row: {
          bandwidth: number | null
          connection_state: string | null
          created_at: string | null
          details: Json | null
          event_type: string
          ice_state: string | null
          id: string
          jitter: number | null
          latency: number | null
          packet_loss: number | null
          peer_user_id: string
          quality_score: number | null
          session_id: string
          user_id: string
        }
        Insert: {
          bandwidth?: number | null
          connection_state?: string | null
          created_at?: string | null
          details?: Json | null
          event_type: string
          ice_state?: string | null
          id?: string
          jitter?: number | null
          latency?: number | null
          packet_loss?: number | null
          peer_user_id: string
          quality_score?: number | null
          session_id: string
          user_id: string
        }
        Update: {
          bandwidth?: number | null
          connection_state?: string | null
          created_at?: string | null
          details?: Json | null
          event_type?: string
          ice_state?: string | null
          id?: string
          jitter?: number | null
          latency?: number | null
          packet_loss?: number | null
          peer_user_id?: string
          quality_score?: number | null
          session_id?: string
          user_id?: string
        }
        Relationships: []
      }
      webrtc_recovery_data: {
        Row: {
          created_at: string | null
          id: string
          last_disconnection: string | null
          pending_answers: Json | null
          pending_candidates: Json | null
          pending_offers: Json | null
          reconnection_count: number | null
          session_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_disconnection?: string | null
          pending_answers?: Json | null
          pending_candidates?: Json | null
          pending_offers?: Json | null
          reconnection_count?: number | null
          session_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_disconnection?: string | null
          pending_answers?: Json | null
          pending_candidates?: Json | null
          pending_offers?: Json | null
          reconnection_count?: number | null
          session_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      webrtc_session_state: {
        Row: {
          connection_states: Json | null
          created_at: string | null
          ice_states: Json | null
          id: string
          last_activity: string
          media_constraints: Json | null
          participants: string[] | null
          quality: Json | null
          session_id: string
          start_time: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          connection_states?: Json | null
          created_at?: string | null
          ice_states?: Json | null
          id?: string
          last_activity: string
          media_constraints?: Json | null
          participants?: string[] | null
          quality?: Json | null
          session_id: string
          start_time: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          connection_states?: Json | null
          created_at?: string | null
          ice_states?: Json | null
          id?: string
          last_activity?: string
          media_constraints?: Json | null
          participants?: string[] | null
          quality?: Json | null
          session_id?: string
          start_time?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      workload_metrics: {
        Row: {
          active_patients_count: number
          created_at: string
          id: string
          metric_date: string
          pending_assignments_count: number
          therapist_id: string
          utilization_percentage: number
          weekly_sessions_count: number
        }
        Insert: {
          active_patients_count?: number
          created_at?: string
          id?: string
          metric_date?: string
          pending_assignments_count?: number
          therapist_id: string
          utilization_percentage?: number
          weekly_sessions_count?: number
        }
        Update: {
          active_patients_count?: number
          created_at?: string
          id?: string
          metric_date?: string
          pending_assignments_count?: number
          therapist_id?: string
          utilization_percentage?: number
          weekly_sessions_count?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_user_invitation: {
        Args: { invitation_token: string; user_id: string }
        Returns: Json
      }
      analyze_video_session_performance: {
        Args: Record<PropertyKey, never>
        Returns: {
          index_usage: string
          query_performance: string
          recommendations: string
          table_name: string
        }[]
      }
      assign_role_to_user: {
        Args:
          | { p_role_id: string; p_user_id: string }
          | { p_role_id: string; p_user_id: string }
        Returns: boolean
      }
      auto_sync_user_metadata: {
        Args: { p_source: string; p_sync_type?: string; p_user_id: string }
        Returns: boolean
      }
      calculate_therapist_conversion_rate: {
        Args: { p_date?: string; p_therapist_id: string }
        Returns: number
      }
      calculate_therapist_workload: {
        Args: { p_date?: string; p_therapist_id: string }
        Returns: Json
      }
      can_join_session: {
        Args: { session_uuid: string; user_uuid: string }
        Returns: boolean
      }
      check_and_repair_user_role_consistency: {
        Args: { p_auto_repair?: boolean; p_user_id: string }
        Returns: Json
      }
      check_appointment_conflicts: {
        Args: {
          p_appointment_id?: string
          p_end_time: string
          p_start_time: string
          p_therapist_id: string
        }
        Returns: {
          conflict_end: string
          conflict_start: string
          conflicting_id: string
        }[]
      }
      check_calendar_conflicts: {
        Args: {
          p_appointment_id?: string
          p_calendar_id: string
          p_end_time: string
          p_start_time: string
          p_therapist_id: string
        }
        Returns: {
          conflict_end: string
          conflict_id: string
          conflict_start: string
          event_summary: string
        }[]
      }
      check_google_calendar_conflicts: {
        Args: {
          p_appointment_id?: string
          p_end_time: string
          p_google_calendar_id: string
          p_start_time: string
          p_therapist_id: string
        }
        Returns: {
          conflict_end: string
          conflict_id: string
          conflict_start: string
          event_summary: string
        }[]
      }
      check_therapist_availability: {
        Args: {
          p_date: string
          p_end_time: string
          p_start_time: string
          p_therapist_id: string
        }
        Returns: boolean
      }
      cleanup_expired_instant_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_connection_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_performance_metrics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_participant_on_disconnect: {
        Args: {
          p_participant_name?: string
          p_session_id: string
          p_user_id?: string
        }
        Returns: undefined
      }
      cleanup_stale_participants: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_stale_session_states: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_admin_role_if_needed: {
        Args: Record<PropertyKey, never>
        Returns: {
          role_id: string
        }[]
      }
      create_appointment_reminders: {
        Args: { p_appointment_id: string }
        Returns: undefined
      }
      create_notification: {
        Args: {
          p_data?: Json
          p_message: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      create_user_invitation: {
        Args: {
          p_email: string
          p_invited_by?: string
          p_role_to_assign?: string
        }
        Returns: Json
      }
      ensure_admin_role_consistency: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      escalate_overdue_inquiries: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_recurring_appointments: {
        Args: {
          p_end_time: string
          p_parent_id: string
          p_recurrence_end_date: string
          p_recurrence_rule: string
          p_series_id: string
          p_start_time: string
        }
        Returns: string[]
      }
      get_active_participant_count: {
        Args: { session_uuid: string }
        Returns: number
      }
      get_primary_role: {
        Args: { p_user_id: string }
        Returns: string
      }
      get_role_assignments: {
        Args: Record<PropertyKey, never>
        Returns: {
          assigned_at: string
          assignment_id: string
          full_name: string
          role_description: string
          role_id: string
          role_name: string
          updated_at: string
          user_id: string
        }[]
      }
      get_role_audit_logs: {
        Args: Record<PropertyKey, never>
        Returns: {
          activity_timestamp: string
          activity_type: string
          full_name: string
          id: string
          metadata: Json
          resource_id: string
          user_id: string
        }[]
      }
      get_role_permissions: {
        Args: { role_id: string }
        Returns: {
          action: string
          name: string
          resource: string
        }[]
      }
      get_system_health_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          agora_credentials_configured: boolean
          agora_sdk_loaded: boolean
          database_connected: boolean
          last_check: string
          status: string
          webrtc_available: boolean
        }[]
      }
      get_therapist_profiles_for_admin: {
        Args: Record<PropertyKey, never>
        Returns: {
          account_type: string
          admin_notes: string
          approval_request_date: string
          approval_status: string
          created_at: string
          email: string
          full_name: string
          id: string
          updated_at: string
        }[]
      }
      get_therapist_profiles_public: {
        Args: Record<PropertyKey, never>
        Returns: {
          account_type: string
          approval_request_date: string
          approval_status: string
          created_at: string
          full_name: string
          id: string
          updated_at: string
        }[]
      }
      get_user_email: {
        Args: { p_user_id: string }
        Returns: string
      }
      get_user_email_for_admin: {
        Args: { p_user_id: string }
        Returns: string
      }
      get_user_email_safe: {
        Args: { p_user_id: string }
        Returns: string
      }
      get_user_permissions: {
        Args: { user_id: string }
        Returns: {
          action: string
          name: string
          resource: string
        }[]
      }
      get_user_roles: {
        Args: { p_user_id: string }
        Returns: {
          role_name: string
        }[]
      }
      get_user_roles_and_permissions: {
        Args: { user_id: string }
        Returns: Json
      }
      has_role: {
        Args: {
          p_role: Database["public"]["Enums"]["app_role"]
          p_user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      is_admin_bypass_rls: {
        Args: { check_user_id: string }
        Returns: boolean
      }
      is_simple_admin: {
        Args: { check_user_id: string }
        Returns: boolean
      }
      is_user_admin: {
        Args: { check_user_id: string }
        Returns: boolean
      }
      is_webhook_owner: {
        Args: { webhook_channel_id: string }
        Returns: boolean
      }
      log_security_event: {
        Args:
          | {
              details?: Json
              event_type: string
              resource_type?: string
              severity?: string
              user_id: string
            }
          | {
              details?: Json
              event_type: string
              severity?: string
              user_id: string
            }
        Returns: undefined
      }
      manage_user_role: {
        Args: { p_operation: string; p_role_name: string; p_user_id: string }
        Returns: Json
      }
      mask_sensitive_data: {
        Args: {
          data: string
          data_owner_id: string
          requesting_user_id: string
        }
        Returns: string
      }
      process_therapist_application: {
        Args: { action: string; admin_user_id: string; application_id: string }
        Returns: undefined
      }
      run_scheduled_tasks: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      search_patients_advanced: {
        Args: {
          p_age_max?: number
          p_age_min?: number
          p_groups?: string[]
          p_last_session_days?: number
          p_search_text?: string
          p_status?: string
          p_tags?: string[]
          p_therapist_id: string
        }
        Returns: {
          account_type: string
          created_at: string
          full_name: string
          groups: string[]
          last_session_date: string
          patient_id: string
          tags: string[]
          total_sessions: number
        }[]
      }
      suggest_therapist_assignment: {
        Args: { p_patient_id: string; p_preferred_specialization?: string }
        Returns: {
          available_capacity: number
          current_utilization: number
          specialization_match: boolean
          therapist_id: string
          therapist_name: string
        }[]
      }
      sync_user_roles: {
        Args: { user_id: string }
        Returns: boolean
      }
      track_profile_view: {
        Args: {
          p_source?: string
          p_therapist_id: string
          p_utm_campaign?: string
          p_utm_medium?: string
          p_utm_source?: string
          p_viewer_id?: string
        }
        Returns: undefined
      }
      update_session_analytics_data: {
        Args: { p_session_id: string }
        Returns: undefined
      }
      update_therapist_approval_simple: {
        Args:
          | {
              admin_notes?: string
              admin_user_id: string
              new_status: string
              therapist_id: string
            }
          | { admin_notes?: string; new_status: string; therapist_id: string }
        Returns: undefined
      }
      update_user_status: {
        Args: { p_admin_notes?: string; p_status: string; p_user_id: string }
        Returns: Json
      }
      validate_input_security: {
        Args: { allow_html?: boolean; input_text: string; max_length?: number }
        Returns: boolean
      }
      verify_user_role_consistency: {
        Args: { p_user_id: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "patient" | "therapist" | "support" | "guest"
      appointment_status:
        | "scheduled"
        | "confirmed"
        | "cancelled"
        | "completed"
        | "rescheduled"
      calendar_sync_status: "pending" | "in_progress" | "completed" | "failed"
      day_of_week:
        | "monday"
        | "tuesday"
        | "wednesday"
        | "thursday"
        | "friday"
        | "saturday"
        | "sunday"
      notification_type: "email" | "sms" | "both"
      signaling_message_type: "offer" | "answer" | "ice-candidate"
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status: "todo" | "in_progress" | "review" | "done"
      webrtc_connection_state:
        | "new"
        | "connecting"
        | "connected"
        | "disconnected"
        | "failed"
        | "closed"
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
    Enums: {
      app_role: ["admin", "patient", "therapist", "support", "guest"],
      appointment_status: [
        "scheduled",
        "confirmed",
        "cancelled",
        "completed",
        "rescheduled",
      ],
      calendar_sync_status: ["pending", "in_progress", "completed", "failed"],
      day_of_week: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ],
      notification_type: ["email", "sms", "both"],
      signaling_message_type: ["offer", "answer", "ice-candidate"],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: ["todo", "in_progress", "review", "done"],
      webrtc_connection_state: [
        "new",
        "connecting",
        "connected",
        "disconnected",
        "failed",
        "closed",
      ],
    },
  },
} as const
