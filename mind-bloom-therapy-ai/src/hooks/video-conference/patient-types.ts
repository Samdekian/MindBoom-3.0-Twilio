
export interface PatientData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  emergencyContact?: string;
  lastAppointment?: string;
  nextAppointment?: string;
  status: 'active' | 'inactive';
  notes?: string;
}

export interface TreatmentGoal {
  id: string;
  description: string;
  status: 'not-started' | 'in-progress' | 'completed';
  progress: number;
  notes?: string;
}

export interface TreatmentPlan {
  id: string;
  patientId: string;
  startDate: string;
  endDate?: string;
  goals: TreatmentGoal[];
  notes?: string;
  status: 'active' | 'completed' | 'cancelled';
}
