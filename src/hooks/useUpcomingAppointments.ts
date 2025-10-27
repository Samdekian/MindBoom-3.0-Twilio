import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";

interface ProfileWithDetails {
  id: string;
  full_name: string;
  phone_number?: string;
  account_type?: string;
  languages_spoken?: string[];
  bio?: string;
}

interface EmergencyContact {
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
}

interface AppointmentWithProfiles {
  id: string;
  patient_id: string;
  therapist_id: string;
  title: string;
  start_time: string;
  end_time: string;
  status: string;
  description?: string;
  video_enabled?: boolean;
  appointment_type?: string;
  video_url?: string;
  google_calendar_event_id?: string;
  sync_status?: string;
  patient?: ProfileWithDetails;
  therapist?: ProfileWithDetails;
  patient_profile?: ProfileWithDetails;
  therapist_profile?: ProfileWithDetails;
  emergency_contact?: EmergencyContact;
}

export const useUpcomingAppointments = (userRole?: 'patient' | 'therapist') => {
  const { user, primaryRole } = useAuthRBAC();

  // Determine the actual user role from primaryRole if not explicitly provided
  const effectiveUserRole = userRole || (primaryRole === 'therapist' ? 'therapist' : 'patient');

  return useQuery({
    queryKey: ['upcoming-appointments', user?.id, effectiveUserRole],
    queryFn: async (): Promise<AppointmentWithProfiles[]> => {
      if (!user?.id) {
        console.log('[useUpcomingAppointments] No user ID available');
        return [];
      }

      console.log('[useUpcomingAppointments] Starting fetch for user:', user.id, 'effective role:', effectiveUserRole);

      const now = new Date().toISOString();
      let query = supabase
        .from('appointments')
        .select(`
          id,
          patient_id,
          therapist_id,
          title,
          description,
          start_time,
          end_time,
          status,
          video_enabled,
          appointment_type,
          video_url,
          google_calendar_event_id,
          sync_status
        `)
        .gte('start_time', now)
        .in('status', ['scheduled', 'confirmed'])
        .order('start_time', { ascending: true });

      // Filter by user role
      if (effectiveUserRole === 'patient') {
        query = query.eq('patient_id', user.id);
      } else if (effectiveUserRole === 'therapist') {
        query = query.eq('therapist_id', user.id);
      } else {
        // If no role specified, show appointments where user is either patient or therapist
        query = query.or(`patient_id.eq.${user.id},therapist_id.eq.${user.id}`);
      }

      const { data: appointments, error } = await query;

      if (error) {
        console.error('[useUpcomingAppointments] Error fetching appointments:', error);
        throw error;
      }
      
      if (!appointments || appointments.length === 0) {
        console.log('[useUpcomingAppointments] No appointments found');
        return [];
      }

      console.log('[useUpcomingAppointments] Fetched appointments:', appointments);

      // Get unique patient and therapist IDs - ensure we have valid IDs
      const patientIds = [...new Set(appointments.map(apt => apt.patient_id).filter(id => id && id.trim() !== ''))];
      const therapistIds = [...new Set(appointments.map(apt => apt.therapist_id).filter(id => id && id.trim() !== ''))];
      
      console.log('[useUpcomingAppointments] Patient IDs to fetch:', patientIds);
      console.log('[useUpcomingAppointments] Therapist IDs to fetch:', therapistIds);

      // Fetch detailed patient profiles
      let patientProfiles: ProfileWithDetails[] = [];
      if (patientIds.length > 0) {
        console.log('[useUpcomingAppointments] Fetching patient profiles...');
        const { data: fetchedPatientProfiles, error: patientError } = await supabase
          .from('profiles')
          .select('id, full_name, phone_number, account_type, languages_spoken, bio')
          .in('id', patientIds);
        
        if (patientError) {
          console.error('[useUpcomingAppointments] Error fetching patient profiles:', patientError);
        } else {
          patientProfiles = fetchedPatientProfiles || [];
          console.log('[useUpcomingAppointments] Fetched patient profiles:', patientProfiles);
        }
      }
      
      // Fetch detailed therapist profiles
      let therapistProfiles: ProfileWithDetails[] = [];
      if (therapistIds.length > 0) {
        console.log('[useUpcomingAppointments] Fetching therapist profiles...');
        const { data: fetchedTherapistProfiles, error: therapistError } = await supabase
          .from('profiles')
          .select('id, full_name, phone_number, account_type, languages_spoken, bio')
          .in('id', therapistIds);
        
        if (therapistError) {
          console.error('[useUpcomingAppointments] Error fetching therapist profiles:', therapistError);
        } else {
          therapistProfiles = fetchedTherapistProfiles || [];
          console.log('[useUpcomingAppointments] Fetched therapist profiles:', therapistProfiles);
        }
      }

      // Fetch emergency contact information for patients
      let emergencyContacts: any[] = [];
      if (patientIds.length > 0) {
        const { data: fetchedEmergencyContacts, error: emergencyError } = await supabase
          .from('patient_intake_forms')
          .select('patient_id, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship')
          .in('patient_id', patientIds)
          .eq('status', 'submitted');
        
        if (emergencyError) {
          console.error('[useUpcomingAppointments] Error fetching emergency contacts:', emergencyError);
        } else {
          emergencyContacts = fetchedEmergencyContacts || [];
          console.log('[useUpcomingAppointments] Fetched emergency contacts:', emergencyContacts);
        }
      }

      // Create lookup maps
      const patientProfileMap = new Map(
        patientProfiles.map(profile => [profile.id, profile])
      );
      const therapistProfileMap = new Map(
        therapistProfiles.map(profile => [profile.id, profile])
      );
      const emergencyContactMap = new Map(
        emergencyContacts.map(contact => [contact.patient_id, contact])
      );

      console.log('[useUpcomingAppointments] Patient profile map size:', patientProfileMap.size);
      console.log('[useUpcomingAppointments] Therapist profile map size:', therapistProfileMap.size);

      // Combine appointments with profile data
      const appointmentsWithProfiles: AppointmentWithProfiles[] = appointments.map(appointment => {
        const patientProfile = patientProfileMap.get(appointment.patient_id);
        const therapistProfile = therapistProfileMap.get(appointment.therapist_id);
        const emergencyContact = emergencyContactMap.get(appointment.patient_id);

        console.log(`[useUpcomingAppointments] Mapping appointment ${appointment.id}:`);
        console.log('  - Patient ID:', appointment.patient_id, '-> Profile found:', !!patientProfile);
        console.log('  - Therapist ID:', appointment.therapist_id, '-> Profile found:', !!therapistProfile);

        if (!patientProfile) {
          console.warn(`[useUpcomingAppointments] Missing patient profile for appointment ${appointment.id}, patient_id: ${appointment.patient_id}`);
        }
        if (!therapistProfile) {
          console.warn(`[useUpcomingAppointments] Missing therapist profile for appointment ${appointment.id}, therapist_id: ${appointment.therapist_id}`);
        }

        return {
          id: appointment.id,
          patient_id: appointment.patient_id,
          therapist_id: appointment.therapist_id,
          title: appointment.title,
          description: appointment.description,
          start_time: appointment.start_time,
          end_time: appointment.end_time,
          status: appointment.status,
          video_enabled: appointment.video_enabled,
          appointment_type: appointment.appointment_type,
          video_url: appointment.video_url,
          google_calendar_event_id: appointment.google_calendar_event_id,
          sync_status: appointment.sync_status,
          // Legacy format for backward compatibility
          patient: patientProfile,
          therapist: therapistProfile,
          // New format with explicit profile naming
          patient_profile: patientProfile,
          therapist_profile: therapistProfile,
          // Emergency contact information
          emergency_contact: emergencyContact,
        };
      });

      console.log('[useUpcomingAppointments] Final mapped appointments:', appointmentsWithProfiles);
      return appointmentsWithProfiles;
    },
    enabled: !!user?.id,
    staleTime: 30000, // 30 seconds
    retry: 2,
    retryDelay: 1000,
  });
};
