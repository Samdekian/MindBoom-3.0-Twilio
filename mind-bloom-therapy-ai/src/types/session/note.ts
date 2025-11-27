
export interface SessionNote {
  id: string;
  sessionId?: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
  appointmentId: string;
  date: string | Date;
  notes?: string | string[];
  patientId?: string;
  therapistId?: string;
  userId?: string;
}
