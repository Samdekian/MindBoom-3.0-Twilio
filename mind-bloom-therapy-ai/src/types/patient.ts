
export interface PatientData {
  id: string;
  name: string;
  fullName: string;
  email: string;
  phone_number?: string;
  status: string;
  moodTrend: string;
  lastSessionDate?: string;
  upcomingSessionDate?: string;
  activeTreatmentPlan?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  date_of_birth: string;
  address: string;
  created_at: string;
  updated_at: string;
  // Additional computed properties for UI
  name: string;
  fullName: string;
  status: string;
  moodTrend: string;
  lastSessionDate?: string;
  upcomingSessionDate?: string;
  activeTreatmentPlan?: boolean;
  createdAt: string;
  updatedAt: string;
}
