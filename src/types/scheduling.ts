
// Unified types for simplified scheduling system
export interface TherapistProfile {
  id: string;
  full_name: string;
  account_type: string;
  approval_status: string;
}

export interface AvailabilitySlot {
  id: string;
  therapist_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  is_available: boolean;
}

export interface SimpleAppointment {
  id: string;
  patient_id: string;
  therapist_id: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  created_at: string;
}

export interface BookingStep {
  step: number;
  title: string;
  description: string;
  isComplete: boolean;
}
