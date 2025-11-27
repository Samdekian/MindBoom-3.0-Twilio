
import { supabase } from "@/integrations/supabase/client";

// Define the appointment status type to match what's in the database
export type AppointmentStatus = "scheduled" | "confirmed" | "cancelled" | "completed" | "rescheduled";

// Define the appointment data interface
export interface AppointmentCreateData {
  title: string;
  description?: string;
  therapist_id: string;
  patient_id: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  notes?: string;
  location?: string;
  type?: string;
}

export async function createAppointment(data: AppointmentCreateData) {
  // Ensure status is within the allowed values
  const appointmentData = {
    ...data,
    status: data.status as AppointmentStatus
  };
  
  const { data: appointment, error } = await supabase
    .from('appointments')
    .insert(appointmentData)
    .select('*')
    .single();
  
  if (error) {
    throw new Error(`Failed to create appointment: ${error.message}`);
  }
  
  return appointment;
}

export async function updateAppointment(id: string, data: Partial<AppointmentCreateData>) {
  // Ensure status is within the allowed values if it's being updated
  const appointmentData = {
    ...data,
    status: data.status as AppointmentStatus
  };
  
  const { data: updatedAppointment, error } = await supabase
    .from('appointments')
    .update(appointmentData)
    .eq('id', id)
    .select('*')
    .single();
  
  if (error) {
    throw new Error(`Failed to update appointment: ${error.message}`);
  }
  
  return updatedAppointment;
}

export async function getAppointment(id: string) {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    throw new Error(`Failed to fetch appointment: ${error.message}`);
  }
  
  return data;
}

export async function getAppointments(userId: string, userRole: 'patient' | 'therapist') {
  const roleField = userRole === 'patient' ? 'patient_id' : 'therapist_id';
  
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq(roleField, userId)
    .order('start_time', { ascending: true });
  
  if (error) {
    throw new Error(`Failed to fetch appointments: ${error.message}`);
  }
  
  return data || [];
}

export async function cancelAppointment(id: string) {
  const { data, error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .select('*')
    .single();
  
  if (error) {
    throw new Error(`Failed to cancel appointment: ${error.message}`);
  }
  
  return data;
}
