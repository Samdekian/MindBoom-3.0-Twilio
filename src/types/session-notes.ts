
export interface SessionNote {
  id: string;
  appointment_id: string;
  created_by: string;
  content: string;
  created_at: string | null;
  updated_at: string | null;
  appointment?: {
    title: string;
    start_time: string;
  };
}
