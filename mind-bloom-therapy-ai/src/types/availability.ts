
export interface TherapistAvailabilitySlot {
  id: string;
  therapist_id: string;
  slot_date: string;
  slot_start_time: string;
  slot_end_time: string;
  is_available: boolean;
  slot_type: 'regular' | 'emergency' | 'consultation';
  max_bookings: number;
  current_bookings: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AppointmentReminder {
  id: string;
  appointment_id: string;
  reminder_type: 'email' | 'sms' | 'push' | 'in_app';
  scheduled_for: string;
  sent_at?: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  content?: string;
  error_message?: string;
  created_at: string;
}

export interface SessionMaterial {
  id: string;
  appointment_id: string;
  therapist_id: string;
  material_type: 'homework' | 'reading' | 'exercise' | 'assessment' | 'resource';
  title: string;
  description?: string;
  content?: string;
  file_urls?: string[];
  due_date?: string;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AppointmentConflict {
  id: string;
  appointment_id: string;
  conflict_type: 'scheduling' | 'resource' | 'therapist_unavailable' | 'patient_conflict';
  conflict_description: string;
  suggested_resolution?: string;
  status: 'pending' | 'resolved' | 'escalated';
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
}
