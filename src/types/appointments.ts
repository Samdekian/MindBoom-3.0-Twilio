
export type AppointmentStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no-show' | 'confirmed' | 'rescheduled';

export interface Conflict {
  conflict_id: string;
  event_summary: string;
  conflict_start: string;
  conflict_end: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  therapist_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  video_enabled: boolean;
  recording_consent?: boolean;
  video_url?: string;
  video_meeting_id?: string;
  google_calendar_event_id?: string;
  created_at: string;
  updated_at: string;
  sync_status?: 'pending' | 'synced' | 'failed' | 'conflict';
  sync_error?: string;
  conflicts?: Conflict[];
  last_sync_attempt?: string;
  recording_url?: string;
  calendar_id?: string;
  recurrence_rule?: string;
  recurrence_end_date?: string;
  parent_appointment_id?: string;
  availability_id?: string;
}
