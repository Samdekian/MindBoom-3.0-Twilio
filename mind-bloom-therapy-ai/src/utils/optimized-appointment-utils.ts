
export interface OptimizedAppointmentData {
  id: string;
  title?: string;
  patient_name?: string;
  therapist_name?: string;
  patient_id: string;
  therapist_id: string;
  start_time: string;
  end_time: string;
  status: string;
  description?: string;
  video_enabled?: boolean;
  appointment_type?: string;
  video_url?: string;
  google_calendar_event_id?: string;
  sync_status?: string;
  
  // Patient data
  patient_phone?: string;
  patient_email?: string;
  patient_account_type?: string;
  patient_languages?: string[];
  patient_bio?: string;
  
  // Therapist data
  therapist_phone?: string;
  therapist_email?: string;
  therapist_account_type?: string;
  therapist_languages?: string[];
  therapist_bio?: string;
  
  // Emergency contact (for therapists viewing patient data)
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
}

/**
 * Generates a dynamic appointment title based on user role and participant data
 * Works with optimized appointment data structure
 */
export const generateOptimizedAppointmentTitle = (
  appointment: OptimizedAppointmentData,
  userRole: 'patient' | 'therapist'
): string => {
  // Determine session type from original title if available
  const isInitialConsultation = appointment.title?.toLowerCase().includes('initial consultation') || 
                                appointment.title?.toLowerCase().includes('consultation');
  const sessionType = isInitialConsultation ? 'Initial Consultation' : 'Session';

  // Get the other participant's name based on user role
  const otherParticipantName = userRole === 'therapist' 
    ? appointment.patient_name
    : appointment.therapist_name;

  // Generate title based on participant data
  if (otherParticipantName && otherParticipantName.trim() !== '') {
    return `${sessionType} with ${otherParticipantName}`;
  }
  
  // Fallback when profile data is missing
  const participantType = userRole === 'therapist' ? 'Patient' : 'Therapist';
  return `${sessionType} with ${participantType}`;
};

/**
 * Gets display name for the other participant with fallback
 */
export const getOptimizedOtherParticipantName = (
  appointment: OptimizedAppointmentData,
  userRole: 'patient' | 'therapist'
): string => {
  const otherParticipantName = userRole === 'therapist' 
    ? appointment.patient_name
    : appointment.therapist_name;

  return otherParticipantName && otherParticipantName.trim() !== ''
    ? otherParticipantName
    : (userRole === 'therapist' ? 'Unknown Patient' : 'Unknown Therapist');
};

/**
 * Gets email for the other participant
 */
export const getOptimizedOtherParticipantEmail = (
  appointment: OptimizedAppointmentData,
  userRole: 'patient' | 'therapist'
): string => {
  const otherParticipantEmail = userRole === 'therapist' 
    ? appointment.patient_email
    : appointment.therapist_email;

  return otherParticipantEmail || 'Available via platform messaging';
};

/**
 * Checks if participant profile data is available
 */
export const hasOptimizedParticipantProfileData = (
  appointment: OptimizedAppointmentData,
  userRole: 'patient' | 'therapist'
): boolean => {
  const otherParticipantName = userRole === 'therapist' 
    ? appointment.patient_name
    : appointment.therapist_name;

  return !!otherParticipantName;
};

/**
 * Converts optimized appointment data to legacy format for backward compatibility
 */
export const convertToLegacyFormat = (
  appointment: OptimizedAppointmentData
): any => {
  return {
    id: appointment.id,
    patient_id: appointment.patient_id,
    therapist_id: appointment.therapist_id,
    title: appointment.title,
    start_time: appointment.start_time,
    end_time: appointment.end_time,
    description: appointment.description,
    status: appointment.status,
    video_enabled: appointment.video_enabled,
    appointment_type: appointment.appointment_type,
    video_url: appointment.video_url,
    google_calendar_event_id: appointment.google_calendar_event_id,
    sync_status: appointment.sync_status,
    
    // Patient profile data
    patient_profile: appointment.patient_name ? {
      id: appointment.patient_id,
      full_name: appointment.patient_name,
      phone_number: appointment.patient_phone,
      email: appointment.patient_email,
      account_type: appointment.patient_account_type,
      languages_spoken: appointment.patient_languages,
      bio: appointment.patient_bio,
    } : null,
    
    // Therapist profile data
    therapist_profile: appointment.therapist_name ? {
      id: appointment.therapist_id,
      full_name: appointment.therapist_name,
      phone_number: appointment.therapist_phone,
      email: appointment.therapist_email,
      account_type: appointment.therapist_account_type,
      languages_spoken: appointment.therapist_languages,
      bio: appointment.therapist_bio,
    } : null,
    
    // Emergency contact
    emergency_contact: appointment.emergency_contact_name ? {
      emergency_contact_name: appointment.emergency_contact_name,
      emergency_contact_phone: appointment.emergency_contact_phone,
      emergency_contact_relationship: appointment.emergency_contact_relationship,
    } : null,
    
    // Legacy compatibility - duplicate patient/therapist as patient/therapist (without _profile suffix)
    patient: appointment.patient_name ? {
      id: appointment.patient_id,
      full_name: appointment.patient_name,
      phone_number: appointment.patient_phone,
      email: appointment.patient_email,
      account_type: appointment.patient_account_type,
      languages_spoken: appointment.patient_languages,
      bio: appointment.patient_bio,
    } : null,
    
    therapist: appointment.therapist_name ? {
      id: appointment.therapist_id,
      full_name: appointment.therapist_name,
      phone_number: appointment.therapist_phone,
      email: appointment.therapist_email,
      account_type: appointment.therapist_account_type,
      languages_spoken: appointment.therapist_languages,
      bio: appointment.therapist_bio,
    } : null,
  };
};
